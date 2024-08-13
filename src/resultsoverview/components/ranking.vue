<template>
    <section 
        :id
        :aria-label="text.vw_en_rs_rangorde_vraag"
    >
        <article
            v-for="answer, answerIndex in results.answerResults"
            v-separator-after="isNotLastAnswer(answerIndex)"
            class="ranking-answer"
        >
            <div class="answer-data align-center">
                <div class="labels-before-chart">
                    <p>
                        {{ answer.text }}
                    </p>
                </div>
                <div class="chart-container chart-ranking">
                    <div class="ranking-bar">
                        <div 
                            v-if="answer.average !== 0"
                            :style="{
                                left: rankScorePosition(answer) + '%'
                            }"
                            class="ranking-score"
                        >
                            <div class="ranking-tooltip place-center">
                                <p>{{ answerAverage(answer) }}</p>
                                <div class="triangle"></div>
                            </div>
                            <div class="ranking-line"></div>
                        </div>
                    </div>
                </div>
                <div class="labels-behind-chart">
                    <p class="text-overflow-ellipsis">
                        <span class="respondent-amt emphasis-weight emphasis-color">{{ answer.respondentCount }}</span>  
                        {{ text.resultaten_respondents }}
                    </p>
                </div>
            </div>
            <answerList
                :id="`slider-${results.subNumber}`"
                :showSettingsButton="false"
                :results="answer"
                :question="results"
                :settings
                :user
                :filterSettings
            />
        </article>
    </section>
</template>

<script>
    import answerList from './answerList.vue';

    export default {
        name: 'ranking',
        inject: ["text"],
        inheritAttrs: false,
        components: {
            answerList
        },
        props: {
            id: {
                type: String, 
                required: true
            },
            results: {
                type: Object,
                required: true
            },
            filterSettings: {
                type: Object
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
        methods: {
            isNotLastAnswer(answerIndex) {
                return answerIndex + 1 < this.results.answerResults.length;
            },
            answerAverage(answer) {
                let cuttOffAverage = parseFloat(answer.average.toFixed(2));

                return cuttOffAverage.toLocaleString(this.user.currentCulture);
            },
            rankScorePosition(answer) {
                const maxRestriction = this.results.properties.restriction.max ?? 9999;
                const maxAmtOfAnswers = Math.min(this.results.answerResults.length, maxRestriction) - 1;
                const percentagePerNumber = 100 / maxAmtOfAnswers;
                let answerPosition = (answer.average - 1) * percentagePerNumber;

                if(answerPosition > 100) answerPosition = 100;
                
                return answerPosition;
            },
        }
    }
</script>