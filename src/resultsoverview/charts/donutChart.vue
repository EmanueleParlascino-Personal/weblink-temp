<template>
    <legend-container :id />
    <div
        class="chart-donut"
        :style="{width: `${settings.regularChartWidth}px`}"
    >
        <canvas :id>
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
    import * as legend from './helpers/legend';
    import * as data from './helpers/data';
    import * as htmlLegend from './plugins/legend';
    import legendContainer from '../components/legendContainer.vue';
    import settingsPane from '../components/settingsPane.vue';
    import { graphMixin } from './mixins/graph';

    export default {
        name: `donut-chart`,
        mixins: [graphMixin],
        components: { legendContainer, settingsPane },
        emits: ['closeCurrentSetting'],
        methods: {
            generatedDatalabels(){
                const visibleAnswers = this.questionSettingHasChanged ? this.results : legend.visibleAnswers(this.chart, this.results);
                const showPercentageLabels = this.isPointDistributionQuestion === true || this.questionSettings.dataType === 'percentage';

                if(this.questionSettings.showLabels === false) return false;

                return {
                    color: datalabels.fontColor(visibleAnswers, false, this.settings),
                    font: {
                        weight: this.settings.fontWeight,
                        size: this.settings.fontSize
                    },
                    formatter: datalabels.datalabelFormatter(visibleAnswers, showPercentageLabels, true, this.user.currentCulture)
                }
            },
            async createChart() {
                await nextTick();
                const $graph = document.getElementById(this.id);

                if(this.chart !== undefined) this.chart.destroy();
                
                this.chart = new Chart($graph, {
                    type: 'doughnut',
                    data: data.regular(this.answers, this.brandColors.map(c => c.hexValue), this.questionSettings.dataType === 'percentage'),
                    options: {
                        responsive: true,
                        plugins: {
                            htmlLegend: {
                                showLegenda: this.questionSettings.showLegenda,
                                containerID: `legend-container-${this.id}`,
                                callback: (data) => {
                                    data.chart.options.plugins.datalabels = this.generatedDatalabels();
                                    data.chart.update()
                                }
                            },
                            legend: {
                                display: false,
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