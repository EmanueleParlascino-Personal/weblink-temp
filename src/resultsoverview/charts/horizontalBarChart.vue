<template>
    <div       
        class="chart-basic"
    >
        <div class="chart-wrapper">
            <div class="labels-before-chart">
                <div 
                    v-for="answer in answers"
                    class="basic-chart-label"
                >
                    <p class="text-overflow-ellipsis">
                        {{ answer.text }}
                    </p>
                </div>
            </div>
            <div 
                class="chart-container"
                :style="{width: `${settings.barChartWidth}px`}"
            >
                <canvas 
                    :id="id"
                    :height="graphHeight"
                >
                    {{text.algemeen_canvas_fallback}}
                </canvas>
            </div>
            <div class="labels-behind-chart">
                <div 
                    v-for="answer in answers"
                    class="align-center"
                >
                    <p class="text-overflow-ellipsis">
                        <span class="respondent-amt emphasis-weight emphasis-color">{{ answer.respondentCount }}</span>  
                        {{ text.resultaten_respondents }}
                    </p>
                </div>
            </div>
        </div>
    </div>
    <settings-pane 
        v-if="settingPaneIsOpen === true"
        :settings
        :results
        :user
        :questionSettings
        v-model="brandColors"
        :parentQuestion="parentQuestion ?? results"
        @close-settings-pane="this.$emit('closeCurrentSetting')"
    />
</template>

<script>
import { nextTick } from 'vue';
import * as datalabels from './helpers/datalabels';
import * as text from './helpers/text';
import settingsPane from '../components/settingsPane.vue';
import { graphMixin } from './mixins/graph';

export default {
    name: `graph-basic`,
    mixins: [graphMixin],
    components: {settingsPane},
    emits: ['closeCurrentSetting'],
    computed: {
        graphHeight(){
            const barHeight = 50;
            const labelAndPaddingHeight = 35;

            return (this.answers.length * barHeight) + labelAndPaddingHeight;
        },
        truncatedLabels(){
            return this.answers.map(row => {
                return text.cutOffLabel(row.text, 80);
            });
        },
        isPointDistributionQuestion() {
            return this.results.questionType === `pointdistribution`;
        },
        isExpertLayout(){
            return this.user.selectedSwitcherType === 1;
        },
        showGraphInNumbers(){
            return this.isPointDistributionQuestion === true || (this.questionSettings.dataType === 'numbers' && this.isExpertLayout === true);
        }
    },
    watch: {
        isExpertLayout(){
            this.createChart();
        },
    },
    methods: {
        generatedDatalabels(){
            if(this.showGraphInNumbers === true) {
                return {
                    color: datalabels.fontColor(this.results, false, this.settings),
                    align: 'end',
                    anchor: 'start',
                    offset: datalabels.offset(this.results),
                    font: {
                        weight: this.settings.fontWeight,
                        size: this.settings.fontSize
                    },
                    formatter: datalabels.datalabelFormatter(this.results, false, false, this.user.currentCulture)
                }
            } else {
                return {
                    color: datalabels.fontColor(this.results, true, this.settings),
                    align: 'end',
                    anchor: 'start',
                    offset: datalabels.offset(this.results),
                    font: {
                        weight: this.settings.fontWeight,
                        size: this.settings.fontSize
                    },
                    formatter: datalabels.datalabelFormatter(this.results, true, false, this.user.currentCulture)
                }
            }
        },
        async createChart() {
            await nextTick();
            
            const $graph = document.getElementById(this.id);
            let totalAmtOfAnswers = this.isPointDistributionQuestion ? this.results.properties.pointsToDistribute : this.results.respondentCount;
            const stepSize = this.isPointDistributionQuestion ? undefined : totalAmtOfAnswers / 10.0;

            // We need this so that graphs without respondents still show some ticks correctly
            if(totalAmtOfAnswers === 0) totalAmtOfAnswers += 1;
            
            if(this.chart !== undefined) this.chart.destroy();
            
            this.chart = new Chart($graph, {
                type: 'bar',
                defaults: {
                    color: 'black'
                },
                options: {
                    indexAxis: 'y',
                    maintainAspectRatio: false, 
                    responsive: true,
                    plugins: {
                        legend: {display: false},
                        datalabels: this.generatedDatalabels(),
                        tooltip: {
                            callbacks: {
                                label: (tooltipItem) => tooltipItem.dataset.tooltipData[tooltipItem.dataIndex]
                            }, 
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            max: totalAmtOfAnswers,
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                stepSize: stepSize,
                                callback: (value) => {
                                    let tickValue;
                                    
                                    if(this.showGraphInNumbers === true) {
                                        tickValue = value.toFixed();
                                    } else {
                                        tickValue = Math.round(value * (100.0 / totalAmtOfAnswers)) + '%';
                                    }

                                    return tickValue;
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                display: false,
                                color: 'black',
                                font: {
                                    size: 14,
                                    minWidth: 100
                                }
                            }
                        }
                    },
                    elements: {
                        bar: {
                            borderWidth: 0
                        }
                    }
                },
                data: {
                    labels: this.truncatedLabels,
                    datasets: [
                        {
                            data: this.data(true),
                            backgroundColor: this.isExpertLayout ? this.brandColors.map(c => c.hexValue) : this.settings.brandColor,
                            borderColor: this.settings.borderColors,
                            borderWidth: 1,
                            fill: false,
                            barBorderRadius: 6,
                            tooltipData: this.data(this.showGraphInNumbers)
                        }
                    ]
                }
            });
        },
        data(showInNumbers) {
            if (showInNumbers) {
                return this.isPointDistributionQuestion ? this.answers.map(row => row.average) : this.answers.map(row => row.respondentCount);
            } else {
                const totalAmtOfAnswers = this.isPointDistributionQuestion ? this.results.properties.pointsToDistribute : this.results.respondentCount;
                return this.answers.map(row => text.formatPercentageForDisplay(((row.respondentCount / totalAmtOfAnswers) * 100)), this.user.currentCulture);
            }
        }
    },
    created(){
        this.chartIsCreated = true;
    }
}
</script>