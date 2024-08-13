<template>
    <div class="stacked-bar-chart-container">
        <div :id="`legend-container-${id}`"
             class="legend-container"></div>
        <div class="chart chart-stacked"
             :style="{width: `${settings.largeBarChartWidth}px`}">
            <canvas :id="id">
                {{text.algemeen_canvas_fallback}}
            </canvas>
        </div>
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
    import * as htmlLegend from './plugins/legend';
    import * as datalabels from './helpers/datalabels';
    import settingsPane from '../components/settingsPane.vue';
    import { graphMixin } from './mixins/graph';
    import { formatPercentageForDisplay } from './helpers/text';

    export default {
        name: `stacked-bar-chart`,
        mixins: [graphMixin],
        components: {settingsPane},
        emits: ['closeCurrentSetting'],
        computed: {
            answers() {
                let answers = this.results.subQuestionResults ?? this.results.answerResults;

                const hideOuterFieldFromChart = this.results.outerFieldRespondentCount !== null && this.results.questionType === "semanticdifferential";
                if (hideOuterFieldFromChart) {
                    answers = answers.slice(0, -1);
                }

                if(this.questionSettings.sortType === "byNumberAscending") {
                    return answers.sort((a, b) => {
                        if (a.number > b.number) return 1;
                        else if (a.number < b.number) return -1;
                        else return 0;
                    });
                } else if(this.questionSettings.sortType === "byPercentageAscending") {
                    return answers.sort((a, b) => {
                        if (a.respondentCount > b.respondentCount) return 1;
                        else if (a.respondentCount < b.respondentCount) return -1;
                        else return 0;
                    });
                } else if(this.questionSettings.sortType === "byPercentageDescending") {
                    return answers.sort((a, b) => {
                        if (a.respondentCount < b.respondentCount) return 1;
                        else if (a.respondentCount > b.respondentCount) return -1;
                        else return 0;
                    });
                }
            }
        },
        methods: {
            generatedDatalabels(){
                if(this.isPointDistributionQuestion === true || this.questionSettings.dataType === 'numbers') {
                    return {
                        color: this.settings.fontColor,
                        font: {
                            weight: this.settings.fontWeight,
                            size: this.settings.fontSize
                        },
                        formatter: datalabels.datalabelFormatterLessThanOnePercent(this.answers)
                    }
                } else {
                    return {
                        color: this.settings.fontColor,
                        font: {
                            weight: this.settings.fontWeight,
                            size: this.settings.fontSize
                        },
                        formatter: datalabels.datalabelFormatter(this.results, true, true, this.user.currentCulture)
                    }
                }
            },
            async createChart() {
                await nextTick();
                const totalAmtOfAnswers = this.answers.reduce((acc, curr) => acc + curr.respondentCount, 0);

                const $graph = document.getElementById(this.id);
                if(this.chart !== undefined) this.chart.destroy();
            
                this.chart = new Chart($graph, {
                    type: 'bar',
                    options: {
                        indexAxis: 'y',
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                            htmlLegend: {
                                showLegenda: this.questionSettings.showLegenda,
                                containerID: `legend-container-${this.id}`
                            },
                            legend: {
                                display: false,
                            },
                            datalabels: this.generatedDatalabels(),
                            tooltip: {
                                callbacks: {
                                    title: (tooltipItems) => tooltipItems[0].dataset.label,
                                    label: (tooltipItem) => tooltipItem.dataset.tooltipData
                                }
                            }
                        },
                        scales: {
                            x: {
                                stacked: true,
                                max: totalAmtOfAnswers,
                                display: false
                            },
                            y: {
                                stacked: true,
                                display: false,
                            }
                        },
                        elements: {
                            bar: {
                                borderWidth: 0
                            }
                        },
                    },
                    plugins: [htmlLegend.plugin],
                    data: {
                        //make one label per row
                        labels: [""],
                        datasets: this.answers.map((answer, index, array) => ({
                            label: answer.text,
                            data: this.data(answer, true),
                            backgroundColor: this.brandColors.map(c => c.hexValue)[index],
                            borderColor: this.settings.borderColors,
                            barThickness: 45,
                            borderWidth: 1,
                            tooltipData: this.data(answer, this.questionSettings.dataType === 'numbers')
                        }))
                    },
                });
            },
            data(answer, showInNumbers) {
                if (showInNumbers) {
                    return [answer.respondentCount];
                } else {
                    const totalAmtOfAnswers = this.answers.reduce((acc, curr) => acc + curr.respondentCount, 0);
                    return formatPercentageForDisplay(((answer.respondentCount / totalAmtOfAnswers) * 100), this.user.currentCulture);
                }
            }
        }
    }
</script>