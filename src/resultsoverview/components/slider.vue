<template>
    <div class="slider-container" :id="id">
        <div class="slider-answers">
            <div id="minimum-answer-value">{{ leftAnswer.size }}</div>
            <div id="maximum-answer-value">{{ rightAnswer.size }}</div>
        </div>
        <div class="slider-range-container">
            <div class="slider-range" :style="`width: ${calculateSliderPercentage}%`">
            </div>
            <div class="slider-thumb">
                <p class="slider-thumb-value">{{ sliderThumb }}</p>
            </div>
        </div>
        <div class="slider-labels">
            <p :id="`${id}-${results.subNumber}-${leftAnswer.number}`">{{leftAnswer.text}}</p>
            <p :id="`${id}-${results.subNumber}-${rightAnswer.number}`">{{rightAnswer.text}}</p>
        </div>
    </div>
    <answerList
        :id="`slider-${results.number}-${results.subNumber}`"
        :results="results"
        :settings="settings"
        :user="user"
        :filterSettings
        @cross-table-clicked="crossTableClicked()"
    />
</template>

<script>
    import answerList from './answerList.vue';

    export default {
        name: `slider`,
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
        computed: {
            leftAnswer() {
                return this.answers[0];
            },
            rightAnswer() {
                return this.answers[1];
            },
            answers() {
                return this.results.subQuestionResults ?? this.results.answerResults;
            },
            calculateSliderPercentage() {
                return (this.answers[0].average / this.answers[1].size) * 100;
            },
            sliderThumb() {
                return parseFloat(this.leftAnswer.average.toFixed(2)).toLocaleString(this.user.currentCulture);
            }
        },
    }
</script>