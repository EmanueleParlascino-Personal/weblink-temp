<template>
    <div  
        v-if="showTotalRespondentCount" 
    >
        <div class="respondent-count" :id="id">
            <p v-html="respondentCountAndPercentage"></p>
        </div>
    </div>
</template>

<script>
    import { formatPercentageForDisplay } from '../charts/helpers/text';

    export default {
        name: `respondent-count`,
        inject: ["text"],
        inheritAttrs: false,
        props: {
            id: {
                type: String, 
                required: true
            },
            results: {
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
            },
            filterSettings: {
                type: Object
            },
            showSettingsButton: {
                type: Boolean,
                default: false
            },
            bottom: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            respondentCountAndPercentage() {
                const respondentCount = this.results.respondentCount;
                let percentageOfTotalRespondents = (respondentCount / this.user.respondentAmt * 100.0);

                if(isNaN(percentageOfTotalRespondents)) percentageOfTotalRespondents = 0;

                const respondentHTML = `
                    ${this.text.resultaten_aantal_respondenten}: 
                    <strong class='emphasis-weight emphasis-color'>
                        ${respondentCount}
                        (${formatPercentageForDisplay(percentageOfTotalRespondents, this.user.currentCulture)})
                    </strong>
                `;

                return respondentHTML;
            },
            answers() {
                return this.results.subQuestionResults ?? this.results.answerResults;
            },
            showTotalRespondentCount() {
                return (this.results.questionType !== "redirect" && this.results.questionType !== "empty") || this.bottom;
            }
        },
    }
</script>