

<template>
    <div class="swipe-question-wrapper" v-if="results.questionImage !== null && results.questionImage !== undefined">
        <img :src="results.questionImage.src" :alt="results.questionImage.name">
        <div class="swipe-color-overlay" :style="`background: ${getColorPercentages}`">
        </div>
    </div>
    <div class="swipe-answers">    
        <div class="swipe-answer-image place-center" v-for="answer, answerIndex in answers">
            <img :src="answer.answerImage.src" :alt="answer.answerImage.name">
            <p>{{ answerPercentage(answer).toLocaleString(this.user.currentCulture) + '%' }}</p>
        </div>
    </div>
    <settings-pane 
        v-if="settingPaneIsOpen === true"
        :settings
        :results
        :user
        :questionSettings
        v-model="brandColors"
        @close-settings-pane="this.$emit('closeCurrentSetting')"
    />
</template>

<script>
    import settingsPane from '../components/settingsPane.vue';
    import { graphMixin } from '../charts/mixins/graph';
    export default {
        name: `swipe`,
        inject: ["text"],
        mixins: [graphMixin],
        emits: ['closeCurrentSetting'],
        components: {
            settingsPane
        },
        computed: {
            answers() {
                return this.results.subQuestionResults ?? this.results.answerResults;
            },
            getColorPercentages() {
                let answerAmount = this.answers.length;
                let percentageAnswerOne = '';
                let percentageAnswerTwo = '';

                switch(answerAmount) {
                    case 2: 
                        percentageAnswerOne = this.answerPercentage(this.answers[0]);
                        return 'linear-gradient(to right, #ff000087 ' + 
                            percentageAnswerOne + '%, #00800070 ' +
                            percentageAnswerOne + '%, #00800070 100%)';
                    case 3:
                        percentageAnswerOne = this.answerPercentage(this.answers[0]);
                        percentageAnswerTwo = this.answerPercentage(this.answers[1]) + percentageAnswerOne;
                        return 'linear-gradient(to right, #ff000087 ' + 
                            percentageAnswerOne + '%, #00800070 ' + 
                            percentageAnswerOne + '%, #00800070 ' + 
                            percentageAnswerTwo + '%, #ffff0085 ' + 
                            percentageAnswerTwo + '%, #ffff0085 100%)';
                }               
            },                
        },
        methods: {
            answerPercentage(answer) {
                let answerPercentage = parseFloat(((answer.respondentCount / this.results.respondentCount) * 100).toFixed(1));
                if(isNaN(answerPercentage)) answerPercentage = 0;
                return answerPercentage;
            },     
        }
    }
</script>