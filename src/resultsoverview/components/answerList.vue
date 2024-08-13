<template>
    <div class="answer-list"
         :id="id">
        <div class="button-container">
            <v-button
                icon="fa-comment-lines"
                class="clear-button"
                id="show-hide-open-answers"
                :value="showAnswers ? text.resultaten_antwoorden_verbergen : text.resultaten_load_answers"
                @onClick="toggleShowAnswer"
            />
            <v-button
                icon="fa-arrow-down-to-line"
                id="download-open-answers"
                :value="text.resultaten_download_answers"
                @onClick="downloadAnswers"
            />
        </div>
        <div 
            v-if="showAnswers" 
            class="answer-container"
            :id="`answer-list-${id}`"
            @scroll="onAnswerScroll"
        >
            <ul class="answers-list">
                <li v-for="answer in answerList">
                    {{ decodeHtmlEntities(answer) }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: `answer-list`,
        inject: ["text", "get", "global"],
        inheritAttrs: false,
        data(){
            return {
                answerList: [],
                isLoadingAnswers: false,
                allAnswersAreLoaded: false,
                showAnswers: false
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
            question: {
                type: Object,
                default: undefined
            },
            filterSettings: {
                type: Object
            }
        },
        computed: {
            answers() {
                return this.results.subQuestionResults ?? this.results.answerResults;
            },
            answersAreLoaded(){
                return this.answerList.length > 0;
            },
            isExpertLayout(){
                return this.user.selectedSwitcherType === 1;
            }
        },
        methods: {
            loadAnswers() {
                const skip = this.answerList.length;
                const answerId = this.results.answerId ?? this.results.answerResults[0].answerId;
                const questionId = this.results.questionId ?? this.question.id ?? this.question.questionId;
                const answerAmt = this.settings.loadOpenAnswerAmt;
                const url = `/api/${this.global.surveyId}/Results/${questionId}/${answerId}/${skip}/${answerAmt}/get-open-results`;

                this.isLoadingAnswers = true;
             
                this.get({
                    url,
                    data: this.filterSettings,
                    successCallback: (data) => {
                        this.answerList = this.answerList.concat(data);
                        this.isLoadingAnswers = false;

                        if(data.length === 0) this.allAnswersAreLoaded = true;
                    },
                });
            },
            toggleShowAnswer(){
                this.showAnswers = !this.showAnswers
                if(this.isLoadingAnswers === false || this.allAnswersAreLoaded === false || this.showAnswers === true){
                    this.loadAnswers()
                }
            },
            downloadAnswers(){
                const answerId = this.results.answerId ?? this.results.answerResults[0].answerId;
                const questionId = this.results.questionId ?? this.question.id;
                const url = `/api/${this.global.surveyId}/Results/${questionId}/${answerId}/download-open-results`;
                
                fetch(url, {
                    method: "POST",
                    body: JSON.stringify(this.filterSettings),
                    headers: {
                        "X-Verification-Token": document.querySelector("input[name='__RequestVerificationToken']").value,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.blob())
                .then(data => {
                    const fileName = `OpenAnswers`;
                    const url = window.URL.createObjectURL(data);
                    const a = document.createElement(`a`);
                    
                    a.style.display = `none`;
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);

                    this.notificationSettings = {
                        message: this.text.resultaten_downloading_open_answers_succesful,
                        type: `success`,
                        isVisible: true,
                    };
                })
                .catch(() => {
                    this.notificationSettings = {
                        message: this.text.resultaten_downloading_open_answers_failed,
                        type: `failure`,
                        isVisible: true,
                    };
                });
            },
            decodeHtmlEntities(str) {
                const txt = document.createElement("textarea");
                txt.innerHTML = str;
                return txt.value;
            },
            onAnswerScroll(e){
                const element = e.target;
                const remainingScrollPixels = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight)
                const userHasScrolledToTreshold = remainingScrollPixels < this.settings.scrollTreshold;
                
                if(userHasScrolledToTreshold === true && this.isLoadingAnswers === false && this.allAnswersAreLoaded === false) {
                    this.loadAnswers();
                }
            },
        },
    }
</script>