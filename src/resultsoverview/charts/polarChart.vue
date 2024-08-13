<template>
    <legend-container :id />
    <div 
        class="chart-polar"
        :style="{width: `${settings.regularChartWidth}px`}"
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
    import * as htmlLegend from './plugins/legend';
    import legendContainer from '../components/legendContainer.vue';
    import settingsPane from '../components/settingsPane.vue';
    import { graphMixin } from './mixins/graph';

    export default {
        name: `polar-chart`,
        mixins: [graphMixin],
        components: {legendContainer, settingsPane},
        emits: ['closeCurrentSetting'],
        methods: {
            generatedDatalabels(){
                const showPercentageLabels = this.isPointDistributionQuestion === true || this.questionSettings.dataType === 'percentage';
                const hideLowPercentages = !showPercentageLabels;

                return {
                    color: datalabels.fontColor(this.results, false, this.settings),
                    font: {
                        weight: this.settings.fontWeight,
                        size: this.settings.fontSize
                    },
                    formatter: datalabels.datalabelFormatter(this.results, showPercentageLabels, hideLowPercentages, this.user.currentCulture)
                }
            },
            async createChart() {
                await nextTick();
                const $graph = document.getElementById(this.id);
                
                if(this.chart !== undefined) this.chart.destroy();
                
                this.chart = new Chart($graph, {
                    type: 'polarArea',
                    data: data.regular(this.answers, this.brandColors.map(c => c.hexValue), this.questionSettings.dataType === 'percentage'),
                    options: {
                        responsive: true,
                        scales: {
                            r: {
                                pointLabels: {
                                    display: false
                                },
                                ticks: {
                                    callback: (value) => value.toFixed(0)
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            htmlLegend: {
                                showLegenda: this.questionSettings.showLegenda,
                                containerID: `legend-container-${this.id}`
                            },
                            title: {
                                display: false
                            },
                            datalabels: this.generatedDatalabels(),
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => tooltipItem.dataset.tooltipData[tooltipItem.dataIndex]
                                }
                            }
                        }
                    },
                    plugins: [htmlLegend.plugin]
                });
            }
        }
    }
</script>