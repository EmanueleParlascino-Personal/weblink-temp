<template>
    <section class="information-bar block p-reset">
        <div class="information-bar-container justify-space-between">
            <div class="align-center gap-20">
                <div>
                    <v-icon 
                        icon="fa-users"
                        :size="40"
                        class="emphasis-color"
                        :ariaHidden="true"
                    />
                </div>
                <div>
                    <p>
                       total respondents
                    </p>
                    <p class="emphasis-weight emphasis-enlarge"
                       id="survey-respondents-count">
                        {{ user.respondentAmt.toLocaleString(user.currentCulture) }}
                    </p>
                </div> 
            </div>
            <div class="place-center">
                <v-button-clear
                    icon="fa-solid fa-print"
                    is="print-button"
                    :value="text.rapportage_print"
                    @onClick="printPage"
                />
                <v-button-clear
                    :value="text.communityv2_rewards_accounting_export_download"
                    icon="fa-solid fa-file-powerpoint"
                    is="download-button"
                    :disabled="disableExportButton"
                    @onClick="exportResults()"
                />
             <!--    <v-button
                    value="Delen"
                    icon="fa-file-arrow-down"
                    v-if="false"
                /> -->
            </div>    
        </div>
    </section>
    <section class="top-bar block flex justify-space-between">
        <div class="justify-start">
            <div id="filterconditions">

            </div>
            <div>
                <v-input 
                    is="resultaten_datum_vanaf"
                    type="date"
                    v-model="_filterSettings.beginDate"
                    :max="dateToday"
                />
            </div>
            <div>
                <v-input
                    is="resultaten_datum_tot_en_met"
                    type="date"
                    v-model="_filterSettings.endDate"
                    :max="dateToday"
                />
            </div>
            <div>
                <v-select
                    is="resultaten_toon"
                    :items="respondentStateTypes"
                    v-model="_filterSettings.respondentState"
                />
            </div>
            <div 
                v-if="crossTableSettings.status === 'active'"
                class="direction-column"
            >
                <p class="crosstable-label">{{ text.resultaten_datatype_label }}</p>
                <div class="place-center">
                    <div class="place-center">
                        <input
                            type="radio"
                            value="number"
                            id="datatype-number"
                            name="crosstable-datatype"
                            v-model="crossTableSettings.dataType"
                        />
                        <label 
                            for="datatype-number"
                            class="label-without-padding"
                        >
                            N
                        </label>
                    </div>
                    <div class="place-center">
                        <input
                            type="radio"
                            value="percentage"
                            id="datatype-percentage"
                            name="crosstable-datatype"
                            v-model="crossTableSettings.dataType"
                        />
                        <label 
                            for="datatype-percentage"
                            class="label-without-padding"
                        >
                            %
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="align-center">
            <v-button
                is="filters_apply_filter"
                :disabled="disableApplyFilterBtn"
                @onClick="onApplyFilterClick"
            />
        </div>
    </section>
</template>

<script>
export default {
    name: 'action-bar',
    inject: ['text', "global",  "get"],
    emits: ['filterHasUpdated'],
    data() {
        return {
            _filterSettings: this.filterSettings,
            _questionSettings: this.user.settingsPerQuestions,
            dateToday: new Date().toLocaleDateString('fr-ca'),
            respondentStateTypes: [
                {
                    text: "completes",
                    value: 'Completes'
                },
                {
                    text: this.text.resultaten_afhakers,
                    value: 'Quit'
                },
                {
                    text: this.text.resultaten_alles,
                    value: 'CompletesAndQuitters'
                }
            ]
        }
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        filterSettings: {
            type: Object,
            required: true
        },
        disableExportButton:{
            type: Boolean,
            required: true
        },
        disableApplyFilterBtn: {
            type: Boolean
        },
        crossTableSettings: {
            type: Object,
            required: true
        }
    },
    methods: {
        onApplyFilterClick(){
			this.$emit("filterHasUpdated", {
                respondentState: this._filterSettings.respondentState,
                beginDate: this._filterSettings.beginDate,
                endDate: this._filterSettings.endDate,
                filterId: this._filterSettings.filterId
            });
        },
        exportResults() {
            const hasPercentageDataType = Object.values(this.user.settingsPerQuestions).some(setting => setting.dataType === "percentage");

            if (hasPercentageDataType) {
                const userConfirmed = confirm(this.text.survey_notification_download_odp);
                if (userConfirmed === false) {
                    return;
                }
            }

            const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-color');
            const encodedColor = encodeURIComponent(brandColor); 
            let data = {
                url: `/api/${this.global.surveyId}/export-to-odp?filterid=${this._filterSettings.filterId}&start=${this._filterSettings.beginDate}&end=${this._filterSettings.endDate}&respondentState=${this._filterSettings.respondentState}&brandColor=${encodedColor}`
            };
            
            window.location = data.url;
        },
        printPage(){
            window.print()
        }
    },
    created() {
        // Has to work like this because the conditions popup does its own thing
        const conditionsInterval = setInterval(() => {
            const $selectFilter = document.getElementById('select-filter');

            if($selectFilter !== null) {
                document.getElementById('select-filter').addEventListener('change', e => {
                    this._filterSettings.filterId = e.target.value;
                });
                clearInterval(conditionsInterval);
            }
        }, 10);
    }
}
</script>