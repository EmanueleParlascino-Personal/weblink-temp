<template>
    <legend-container :id />
    <div
        class="chart"
        :style="{width: `${settings.barChartWidth}px`}"
    >
        <canvas :id>
            {{text.algemeen_canvas_fallback}}
        </canvas>
    </div>
    <settings-pane 
        v-if="settingPaneIsOpen === true"
        :settings
        :results = "this.results.subQuestionResults[0]"
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
    import * as ticks from './helpers/ticks';
    import settingsPane from '../components/settingsPane.vue';
    import legendContainer from '../components/legendContainer.vue';
    import { graphMixin } from './mixins/graph';
    import { formatPercentageForDisplay } from './helpers/text';

    export default {
        name: `vertical-stacked-bar-chart`,
        mixins: [graphMixin],
        components: {settingsPane,legendContainer},
        emits: ['closeCurrentSetting'],
        computed: {
            subQuestions() {
                return this.results.subQuestionResults;
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
                        formatter: datalabels.datalabelFormatterLessThanOnePercent(this.subQuestions)
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
              
                const $graph = document.getElementById(this.id);
                if(this.chart !== undefined) this.chart.destroy();
            
                this.chart = new Chart($graph, {
                    type: 'bar',
                    options: {
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
                                    label: (tooltipItem) => tooltipItem.dataset.tooltipData[tooltipItem.dataIndex]
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: "#000",
                                    display: this.questionSettings.showLabels,
                                },
                                stacked: true
                            },
                            y: {
                                grid: {
                                    display: false
                                },
                                max: this.results.respondentCount,
                                ticks: ticks.regular(this.results, this.questionSettings),
                                stacked: true
                            }
                        },
                        elements: {
                            bar: {
                                borderWidth: 0
                            }
                        }
                    },
                    data: {
                        labels: this.subQuestions.map(result => result.text),
                        datasets: this.subQuestions[0].answerResults.map((answer, index) => ({
                            label: answer.text,
                            data: this.data(index, true),
                            backgroundColor: this.brandColors.map(c => c.hexValue)[index],
                            borderColor: this.settings.borderColors,
                            borderWidth: 1,
                            tooltipData: this.data(index, this.questionSettings.dataType === 'numbers')
                        }))
                    },
                    plugins: [htmlLegend.plugin]
                });
            },
            data(index, showInNumbers) {
                if (showInNumbers) {
                    return this.subQuestions.map(result => result.answerResults[index].respondentCount);
                } else {
                    return this.subQuestions.map(result => formatPercentageForDisplay(((result.answerResults[index].respondentCount / this.results.respondentCount) * 100), this.user.currentCulture))
                }
            }
        }
    }
</script>