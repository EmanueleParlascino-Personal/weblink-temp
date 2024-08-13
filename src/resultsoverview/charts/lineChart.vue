<template>
    <legend-container :id="id" />
    <div
        class="chart-line"
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
    import * as data from './helpers/data';
    import * as ticks from './helpers/ticks';
    import * as htmlLegend from './plugins/legend';
    import legendContainer from '../components/legendContainer.vue';
    import settingsPane from '../components/settingsPane.vue';
    import { graphMixin } from './mixins/graph';

    export default {
        name: `line-chart`,
        mixins: [graphMixin],
        components: {legendContainer,settingsPane},
        emits: ['closeCurrentSetting'],
        methods: {
            async createChart() {
                await nextTick();
                const results = this.results.answerResults;
                const $graph = document.getElementById(this.id);
    
                if(this.chart !== undefined) this.chart.destroy();
            
                this.chart = new Chart($graph, {
                    type: 'line',
                    data: data.regularLine(this.answers, this.brandColors.map(c => c.hexValue)),
                    options: {
                        responsive: true,
                        plugins: {
                            htmlLegend: {
                                showLegenda: this.questionSettings.showLegenda,
                                containerID: `legend-container-${this.id}`,
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
                                                text: label,
                                            })
                                        )
                                    }
                                },        
                            },
                            // Don't show values on the dots.                           
                            datalabels: {
                                display: false,
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
                                beginAtZero: true,
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: "#000",
                                }
                            }
                        }
                    },
                    plugins: [htmlLegend.plugin],
                });
            }
        }
    }
</script>