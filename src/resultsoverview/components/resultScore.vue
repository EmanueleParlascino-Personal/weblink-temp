<template>
    <div v-if="isAnswerResult === false" class="question-result-score" :id="id">
        <p v-html="questionResultScore"></p>
    </div>
    <div v-if="isAnswerResult === true" class="answer-result-score" :id="id">
        <p v-html="answerResultScore"></p>
    </div>
</template>

<script>
    export default {
        name: `result-score`,
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
            culture: {
                type: String,
                required: false
            },
            isAnswerResult: {
                type: Boolean,
                required: true
            }
        },
        computed: {
            questionResultScore() {
                let resultScoreLabel = (this.results.npsScore) ? this.text.resultaten_gemiddelde_nps_score : this.text.resultaten_gemiddeld_gegeven_antwoord;
                let score = this.results.npsScore ?? this.results.averageScore;
                score = parseFloat((score.toFixed(2)).toLocaleString(this.culture));
                const resultScoreHTML = `
                        ${resultScoreLabel} 
                        <strong class='emphasis-weight emphasis-color'>
                            ${score}
                        </strong>
                    `;
                return resultScoreHTML;
            },
            answerResultScore() {
                let score = parseFloat(this.results.average.toFixed(2)).toLocaleString(this.culture)
                const resultScoreHTML = `
                        ${this.text.resultaten_gemiddelde}
                        <strong class='emphasis-weight emphasis-color'>
                            ${score}
                        </strong>
                    `;

                return resultScoreHTML;
            }
        }
    }
</script>