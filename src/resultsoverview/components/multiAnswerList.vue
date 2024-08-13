<template>
    <template v-for="answer, answerIndex in openAnswerTypes">
        <p>{{ answer.text }}</p>
        <p class="respondent-count">
            {{ text.resultaten_aantal_respondenten }}
            <span class="emphasis-weight emphasis-color">
                {{ answer.respondentCount}}
                {{ completesPercentageOfAllRespondents(answer) }}
            </span>
        </p>
        <div v-if="hasAverageScore(answer)"
             class="top-average-or-nps-score-count">
            <resultScore
                :id="`average-or-nps-score-answer-${answerIndex}`"
                :results="answer"
                :isAnswerResult="true"
            />
        </div>
        <answer-list
            :id="id + `-${answerIndex}`"
            :question="question"
            :results="answer"
            :settings="settings"
            :user="user"
            :showSettingsButton="false"
            :filterSettings
        />
    </template>
</template>

<script>
    import answerList from './answerList.vue';
    import resultScore from './resultScore.vue';
    import { formatPercentageForDisplay } from '../charts/helpers/text';


    export default {
        name: `multi-answer-list`,
        inheritAttrs: false,
        inject: ['text'],
        components: {answerList, resultScore},
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
            }
        },
        computed: {
            question() {
                return {
                    id: this.results.questionId,
                    type: this.results.questionType
                }
            },
            openAnswerTypes(){
                return this.results.answerResults.filter(answer => answer.answerType !== `radiobutton` 
                && answer.answerType !== `checkbox` 
                && answer.answerType !== `description`)
            },
        },
        methods: {
            isNotLastAnswer(answerIndex){
                return answerIndex !== this.results.answerResults.length - 1;
            },
            completesPercentageOfAllRespondents(answer){
                if(this.results.respondentAmt === 0) return '(-%)';
                if(answer.respondentCount === 0) return '(0%)'
                
                const respondentPercentage = formatPercentageForDisplay((answer.respondentCount / this.results.respondentCount) * 100);
                
                return `(${respondentPercentage})`;
            },
            hasAverageScore(answer) {
                if ((answer.respondentCount !== 0) && (answer.answerType === "number")) {
                   return true;
                }
                return false;
            },
        }
    }
</script>