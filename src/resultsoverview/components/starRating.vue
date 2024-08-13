<template>
    <div class="align-center gap-20">
        <div class="star-rating">
            <div class="back-stars flex gap-10">
                <v-icon
                    v-for="answer in answersAmount" 
                    icon="fa-star" 
                    :size="25"
                    aria-hidden="true"
                />
                <div class="front-stars flex gap-10">
                    <div v-for="answer in rating.amtOfStars">
                        <v-icon
                            icon="fa-star" 
                            :size="25"
                            aria-hidden="true"
                        />
                    </div>
                    <div>
                        <v-icon
                            icon="fa-star" 
                            :size="25"
                            aria-hidden="true"
                            :style="`width: ${rating.fraction}%`"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="rating-average">
            <p>
                {{ rating.value?.toLocaleString(user.currentCulture) }} {{this.text.resultaten_out_of}} {{ answersAmount }}
            </p>
        </div>
    </div>
</template>

<script>
    export default {
        name: `star-rating-header`,
        inject: ["text"],
        data(){
            return {
                starContainerWidth: 0,
            }
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
            settings: {
                type: Object,
                required: true
            },
            user: {
                type: Object,
                required: true
            },
        },
        computed: {
            answers() {
                return this.results.subQuestionResults ?? this.results.answerResults;
            },
            answersAmount() {
                let answerAmount = this.answers.length;
                let hasOuterField = this.answers.find((x) => x.answerType === `outerfield`);

                return hasOuterField ? answerAmount - 1 : answerAmount;
            },
            calculateStarPercentage() {
                return (this.rating.value / this.answersAmount) * 100;
            },
            rating() {
                let totalRating = 0;
                let ratingBasedOnStar = 0;

                this.answers.forEach((rating, index) => {
                    // we don't count outerfield as an answer in the rating average.
                    if(rating.answerType === `outerfield`) return;
                    
                    totalRating += rating.respondentCount;
                    ratingBasedOnStar += rating.respondentCount * (index + 1);
                });

                if (totalRating === 0 && ratingBasedOnStar === 0) {
                    return {
                        amtOfStars: 0,
                        fraction: 0
                    }
                }
                
                const value = parseFloat((ratingBasedOnStar / totalRating).toFixed(1));
                const amtOfStars = Math.floor(value);
                const fraction = parseInt((value - amtOfStars) * 100);

                return {
                    amtOfStars,
                    fraction,
                    value
                }
            },
        },
        methods: {
        },
        mounted() {

        }
    }
</script>