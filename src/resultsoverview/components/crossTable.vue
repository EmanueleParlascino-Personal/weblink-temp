<template>
    <div class="graph-setting-btns">
        <v-button-clear
            v-if="isCrossableQuestion === true && isActiveQuestion === false"
            class="crosstable-btn"
            icon="fa-solid fa-table"
            :aria-label="text.resultaten_crosstables_aria_open"
            @click="crossTableClicked()"
        />
        <div v-if="isActiveQuestion === true">
            <p class='emphasis-weight emphasis-color'>{{ text.conditions_active }}</p>
        </div>
    </div>
    <div class="table-container">
        <table  
            :id 
            class="crosstable"
            :aria-label="text.res_kruis_totale_res"
        >
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col" class="total-respondent-cell"></th>
                    <th 
                        v-for="(answerXId, index) in crossTableData.questionXAnswerIds" 
                        scope="col"
                        v-tooltip="{
                            bodyText: answersX[index],
                            isClickable: false
                        }"
                    >
                        {{answersX[index]}}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr 
                    v-for="(answerYId, index) in crossTableData.questionYAnswerIds"
                >
                    <th 
                        scope="row" 
                        :id="`${answerYId}-total-of-row`"
                        v-tooltip="{
                            bodyText: answersY[index],
                            isClickable: false
                        }"
                    >
                        {{answersY[index]}}
                    </th>
                    <td class="total-respondent-cell">
                        <template v-if="showAsPercentage === true">
                            {{getPercentage(crossTableData.rowCounts[answerYId], crossTableData.totalRespondentCount)}}
                        </template>
                        <template v-else>
                            {{crossTableData.rowCounts[answerYId] ?? 0}}
                        </template>
                    </td>
                    <td v-for="answerXId in crossTableData.questionXAnswerIds">
                        <template v-if="showAsPercentage === true">
                            {{getPercentage(crossTableData.cellCounts[answerXId + "_" + answerYId] ?? 0, crossTableData.columnCounts[answerXId])}}
                        </template>
                        <template v-else>
                            {{crossTableData.cellCounts[answerXId + "_" + answerYId] ?? 0}}
                        </template>
                    </td>
                </tr>
                <tr class="total-answers-row">
                    <th scope="row">
                        {{this.text.resultaten_aantal_antwoorden}}
                    </th>
                    <td 
                        class="total-respondent-cell"
                        :id="`${id}-total-of-question`"
                    >
                        {{totalAnswers}}
                    </td>
                    <td v-for="answerXId in crossTableData.questionXAnswerIds">
                        {{crossTableData.totalColumnAnswers[answerXId] ?? 0}}
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>N=</td>
                    <td 
                        class="total-respondent-cell"
                        :id="`${id}-n-of-question`"
                    >
                        {{crossTableData.totalRespondentCount}}
                    </td>
                    <td v-for="answerXId in crossTableData.questionXAnswerIds">
                        {{crossTableData.columnCounts[answerXId] ?? 0}}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>
<script>
    import { formatPercentageForDisplay } from '../../resultsoverview/charts/helpers/text';
    export default {
        name: 'crossTable',
        inject: ["text"],
        emits: ['cross-table-clicked'],
        props: {
            id: {
                type: String,
                required: true
            },
            questionYResult: {
                type: Object,
                required: true
            },
            crossTableSettings: {
                type: Object,
                required: true
            },
            settings: {
                type: Object,
                required: true
            },
            user: {
                type: Object,
                required: true
            }
        },
        computed: {
            isActiveQuestion(){
                return this.questionYResult.questionId === this.crossTableSettings.crossedQuestionId;
            },
            crossTableData() {
                return this.crossTableSettings.crossTableData[this.questionYResult.questionId];
            },
            answersX() {
                return this.crossTableSettings.crossedQuestionResult.answerResults.map(a => a.text);
            },
            showAsPercentage() {
                return this.crossTableSettings.dataType === 'percentage';
            },
            answersY() {
                return this.questionYResult.answerResults.map(a => a.text);
            },
            totalAnswers() {
                const totals = Object.values(this.crossTableData.totalColumnAnswers);
                return totals.reduce((a, b) => a + b, 0);
            },
            isCrossableQuestion() {
                return this.settings.questionType[this.questionYResult.questionType].hasCrosstable;
            }
        },
        methods: {
            getPercentage(numerator, denominator) {
                const percentage = (denominator === 0) ? 0 : (numerator / denominator) * 100;
                return formatPercentageForDisplay(percentage, this.user.currentCulture);
            },
            crossTableClicked() {
                this.$emit('cross-table-clicked', this.questionYResult)
            }
        },
    }
</script>
