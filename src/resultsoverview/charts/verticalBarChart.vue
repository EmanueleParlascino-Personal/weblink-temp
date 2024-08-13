<template>
    <legend-container :id="id" />
    <div v-if="questionWithImage" class="flex">
        <div 
            class="chart-vertical-bar"
            :style="{width: `${settings.barChartWidth}px`}"
        >
            <canvas :id="id">
                {{text.algemeen_canvas_fallback}}
            </canvas>
        </div>
        <div class="question-image">
            <img :src="results.questionImage.src" :alt="results.questionImage.name">
        </div>
    </div>
    <div
        v-else 
        class="chart-vertical-bar"
        :style="{width: `${settings.barChartWidth}px`}"
    >   
        <canvas :id="id">
            {{text.algemeen_canvas_fallback}}
        </canvas>   
    </div>
    <settings-pane 
        v-if="settingPaneIsOpen === true"
        :settings
        :results
        :user
        :questionSettings
        :parentQuestion="parentQuestion ?? results"
        v-model="brandColors"
        @close-settings-pane="this.$emit('closeCurrentSetting')"
    />
</template>

<script>
    import { nextTick } from 'vue';
    import * as datalabels from './helpers/datalabels';
    import * as data from './helpers/data';
    import * as legend from './helpers/legend';
    import * as ticks from './helpers/ticks';
    import * as htmlLegend from './plugins/legend';
    import legendContainer from '../components/legendContainer.vue';
    import settingsPane from '../components/settingsPane.vue';
    import { graphMixin } from './mixins/graph';
    import { formatPercentageForDisplay } from './helpers/text'

    export default {
        name: `vertical-bar-chart`,
        mixins: [graphMixin],
        components: {legendContainer,settingsPane},
        emits: ['closeCurrentSetting'],
        computed: {
            graphWidth(){
                return this.answers.length * 50;
            },
            questionWithImage() {
                return this.results.questionType === 'imagesingle' 
                    || this.results.questionType === 'imagemulti' 
                    && this.results.questionImage !== null;
            },
        },
        methods: {
            generatedDatalabels(){
                const visibleAnswers = this.questionSettingHasChanged ? this.results : legend.visibleAnswers(this.chart, this.results);
                
                if(this.isPointDistributionQuestion === true || this.questionSettings.dataType === 'numbers') {
                    return {
                        color: datalabels.fontColor(visibleAnswers, false, this.settings),
                        align: 'end',
                        anchor: 'start',
                        offset: datalabels.offset(visibleAnswers),
                        font: {
                            weight: this.settings.fontWeight,
                            size: this.settings.fontSize
                        },
                        formatter: datalabels.datalabelFormatter(visibleAnswers, false, false, this.user.currentCulture)
                    }
                } else {
                    return {
                        color: datalabels.fontColor(visibleAnswers, true, this.settings),
                        align: 'end',
                        anchor: 'start',
                        offset: datalabels.offset(visibleAnswers),
                        font: {
                            weight: this.settings.fontWeight,
                            size: this.settings.fontSize
                        },
                        formatter: datalabels.datalabelFormatter(visibleAnswers, true, false, this.user.currentCulture)
                    }
                }
            },
            async createChart() {
                await nextTick();
                const results = this.results.answerResults;
                const $graph = document.getElementById(this.id);
                const respondentAmtPerAnswer = this.results.answerResults.map(answer => answer.respondentCount);
                const maxAnswerAmt = Math.max(...respondentAmtPerAnswer);

                if(this.chart !== undefined) this.chart.destroy();
            
                this.chart = new Chart($graph, {
                    type: 'bar',
                    data: data.regular(this.answers, this.brandColors.map(c => c.hexValue), this.questionSettings.dataType !== 'numbers'),
                    options: {
                        responsive: true,
                        plugins: {
                            htmlLegend: {
                                containerID: `legend-container-${this.id}`,
                                showLegenda: this.questionSettings.showLegenda,
                                callback: (data) => {
                                    data.chart.options.plugins.datalabels = this.generatedDatalabels()
                                    data.chart.update()
                                }
                            },
                            legend: {
                                display: false,
                                labels: {
                                    generateLabels: (chart) => {
                                        return chart.data.labels.map(
                                            (label, index) => ({
                                                fillStyle: chart.data.datasets[0].backgroundColor[index],
                                                fontColor: "#666",
                                                hidden: !chart.getDataVisibility(index),
                                                index: index,
                                                lineWidth: 2,
                                                pointStyle: undefined,
                                                strokeStyle: "#fff",
                                                text: label,
                                            })
                                        )
                                    }
                                }
                            },
                            title: {
                                display: false
                            },
                            datalabels: this.generatedDatalabels(),
                            tooltip: {
                                callbacks: {
                                    label: this.tooltipLabels(this.questionSettings.dataType !== 'numbers')
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                display: this.questionSettings.showLabels,
                                barPercentage: 0.1,
                                ticks: ticks.x(results, this.settings),                                
                            },
                            y: {
                                grid: {
                                    display: false
                                },
                                max: maxAnswerAmt,
                                ticks: {
                                    color: "#000",
                                    stepSize: maxAnswerAmt / 5,
                                    callback: (value, index, ticks) => {
                                        if(this.questionSettings.dataType === "numbers") {
                                            return value.toFixed();
                                        } else {
                                            if(value === 0) return '0%';

                                            const maxPercentage = (maxAnswerAmt / this.results.respondentCount) * 100;
                                            const tickPercentage = maxPercentage / 5;
                                            const thisTickPercentage = tickPercentage * index;

                                            return thisTickPercentage.toFixed() + '%';
                                        }
                                    }
                                }
                            }
                        }
                    },
                    plugins: [htmlLegend.plugin],
                });
            },
            tooltipLabels(showAsPercentage) {
                const isMultiResponse =
                    (this.results.questionType === 'multi'
                        || this.results.questionType === 'tablemulti'
                        || this.results.questionType === 'tablemixed'
                        || this.results.questionType === 'imagemulti'
                        || this.results.questionType === 'draganddrop');

                const totalRespondents = isMultiResponse ?
                    this.results.respondentCount :
                    this.results.answerResults.reduce((acc, curr) => acc + curr.respondentCount, 0);

                return function (tooltipItem) {
                    const answerAmt = tooltipItem.dataset.data[tooltipItem.dataIndex];
                    const answeredPercentage = (answerAmt / totalRespondents) * 100;

                    if (isNaN(answeredPercentage)) return '';

                    if (showAsPercentage) {
                        return formatPercentageForDisplay(answeredPercentage, culture);
                    } else {
                        return parseFloat(answerAmt.toFixed(2)).toLocaleString(culture);
                    }
                }
            }
        }
    }
</script>