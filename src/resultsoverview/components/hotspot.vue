<template>
    <section class="flex">
        <div class="align-start image-container">
            <div class="image-div">
                <img 
                    :id="`main-image-${questionId}`"
                    :src="results.questionImage?.src" 
                    :alt="results.questionImage?.name"
                    draggable="false"
                    @mousedown="imageMouseDown"
                    @mousemove="imageMouseMove"
                    @load="addStylingToImage"
                >
                <v-icon 
                    v-for="answer in openAnswers"
                    icon="fa-sharp fa-solid fa-comment"
                    :class="{
                        'hotspot-icon': true,
                        selected: highlightedAnswer === answer.respondentAnswerId
                    }"
                    :size="28"
                    :style="{
                        left: answer.xpercent + '%',
                        top: answer.ypercent + '%',
                        color: colors[answer.emotiontype - 1]
                    }"
                />
                <div 
                    v-if="Object.keys(selectionArea).length > 0"
                    class="selection-area"
                    id="mask"
                    :style="{
                        left: selectionArea.left + 'px',
                        top: selectionArea.top + 'px',
                        width: selectionArea.width + 'px',
                        height: selectionArea.height + 'px'
                    }"
                ></div>
            </div>
        </div>
        <div class="right-panel direction-column">
            <div class="answers direction-column align-begin">
                <p class="emphasis-weight">
                    {{ answersTitle }}
                </p>
                <div>
                    <ul class="open-answer-list">
                        <li
                            v-for="answer in answersToDisplay"
                            @click="highlightAnswer(answer)"
                            class="align-center"
                            :data-selected="highlightedAnswer === answer.respondentAnswerId"
                        >
                            <v-icon 
                                icon="fa-sharp fa-solid fa-comment"
                                :size="28"
                                :style="{
                                    color: colors[answer.emotiontype - 1]
                                }"
                            />
                            {{ answer.text }}
                        </li>
                    </ul>
                </div>
                <v-button
                    icon="fa-arrow-down-to-line"
                    :value="text.resultaten_download_answers"
                    @onClick="downloadAnswers"
                />
            </div>
            <div class="statistics">
                 <v-grid 
                    :headerRows="statisticsGridHeaders" 
                    :rows="statisticsGridRows"
                    :showPaging="false"
                    id="statistics-grid"
                 />
            </div>
        </div>
    </section>
</template>

<script>
    export default {
        name: `hotspot`,
        inject: ["text", "global", "get"],
        inheritAttrs: false,
        watch: {
            results(){
                this.loadAnswers()
            }
        },
        data(){
            return {
                statisticsGridHeaders: [[
                    {text: this.text.resultaten_type},
                    {text: this.text.resultaten_aantal},
                    {text: this.text.resultaten_percentage}
                ]],
                iconDimensions: {
                    width: 30,
                    height: 30
                },
                openAnswers: [],
                isDragging: false,
                selectedAnswers: [],
                selectionArea: {},
                highlightedAnswer: undefined
            }
        },
        props: {
            id: {
                type: String, 
                required: true
            },
            filterSettings: {
                type: Object
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
            }
        },
        computed: {
            questionId() {
                return  this.results.questionId ?? this.question.id;
            },
            answersToDisplay() {
                return this.selectedAnswers.length > 0 ? this.selectedAnswers : this.openAnswers;
            },
            answersTitle(){
                if(this.selectedAnswers.length > 0) {
                    return `${this.selectedAnswers.length} ${this.text.resultaten_answers_selected_title}`;
                } else {
                    return `${this.openAnswers.length} ${this.text.resultaten_hotspot_answers_title}`;
                }
            },
            colors() {
                return ['green', 'red', 'yellow'].concat(this.user.colorPalette)
            },
            statisticsGridRows() {
                let statisticsArr = [];
                let emotionTypes = [];

                this.answersToDisplay.forEach(answer => {
                    const typeIndex = answer.emotiontype - 1;
                    
                    if(emotionTypes[typeIndex] === undefined) emotionTypes[typeIndex] = 1;
                    else emotionTypes[typeIndex] += 1;
                });

                emotionTypes.forEach((emotionAmt, index) => {
                    const percentageOfTotal = parseFloat(((emotionAmt / this.answersToDisplay.length) * 100).toFixed(2));

                    statisticsArr.push({
                        columns: [
                            {
                                component: 'icon',
                                size: 28,
                                icon: 'fa-sharp fa-solid fa-comment',
                                style: `color: ${this.colors[index]}`
                            },
                            {
                                text: emotionAmt
                            },
                            {
                                text: percentageOfTotal.toLocaleString(this.user.currentCulture)
                            }
                        ]
                    });
                });

                return statisticsArr;
            }
        },
        methods: {
            imageMouseDown(e){
                e.preventDefault();

                this.selectionArea = {
                    left: e.offsetX,
                    startLeft: e.offsetX,
                    top: e.offsetY,
                    startTop: e.offsetY,
                    width: 0,
                    height: 0
                };
                
                this.isDragging = true;
                this.highlightedAnswer = undefined;
            },
            imageMouseMove(e){
                if(this.isDragging === false) return

                this.selectionArea.left =  Math.min(e.offsetX, this.selectionArea.startLeft),
                this.selectionArea.top = Math.min(e.offsetY, this.selectionArea.startTop),
                this.selectionArea.width = Math.abs(e.offsetX - this.selectionArea.startLeft),
                this.selectionArea.height = Math.abs(e.offsetY - this.selectionArea.startTop)
            },
            //If we apply this styling before the image has loaded, the browser wont understand
            addStylingToImage(e) {
                e.target.style.display = 'flex';
            },
            resetAnswerSelection(){
                this.selectedAnswers = [];
                this.selectionArea = {};
                this.highlightedAnswer = undefined;
            },
            imageMouseUp(){
                const userHasNotDragged = this.selectionArea.width === 0 && this.selectionArea.height === 0;

                this.isDragging = false;

                if(userHasNotDragged) this.selectionArea = {};

                this.selectAnswers();
            },
            selectAnswers() {
                //Ref doesnt work, probably because image has to load
                const imageBCR = document.getElementById(`main-image-${this.questionId}`)?.getBoundingClientRect();

                if(imageBCR === undefined) return;

                const halfIconWidth = this.iconDimensions.width / 2;
                const halfIconHeight = this.iconDimensions.height / 2;
                
                this.selectedAnswers = this.openAnswers.filter(answer => {
                    const answerPosition = {
                        x: imageBCR.width * (answer.xpercent / 100),
                        y: imageBCR.height * (answer.ypercent / 100)
                    }

                    return answerPosition.x + halfIconWidth > this.selectionArea.left && 
                        answerPosition.x - halfIconWidth < this.selectionArea.left + this.selectionArea.width &&
                        answerPosition.y + halfIconHeight > this.selectionArea.top && 
                        answerPosition.y - halfIconHeight < this.selectionArea.top + this.selectionArea.height;
                });
            },
            highlightAnswer(answer) {
                if(this.highlightedAnswer === answer.respondentAnswerId) this.highlightedAnswer = undefined;
                else this.highlightedAnswer = answer.respondentAnswerId;
            },
            loadAnswers() {
                const url = `/api/${this.global.surveyId}/Results/${this.questionId}/null/null/null/get-open-results`;

                this.get({
                    url,
                    data: this.filterSettings,
                    successCallback: (data) => {
                        data = data.map(answer => ({
                            ...answer,
                            respondentAnswerId: crypto.randomUUID()
                        }));

                        this.openAnswers = data;
                    },
                });
            },
            downloadAnswers() {
                const url = `/api/${this.global.surveyId}/Results/${this.questionId}/download-open-results`;
                const body = this.selectedAnswers.length > 0 ? 
                    this.selectedAnswers.map(a => a.text) : 
                    this.openAnswers.map(a => a.text);

                fetch(url, {
                    method: "POST",
                    headers: {
                        "X-Verification-Token": document.querySelector("input[name='__RequestVerificationToken']").value,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ answers: body })
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
            }
        },
        created() {
            this.loadAnswers();

            document.addEventListener('mouseup', () => this.imageMouseUp());
            document.addEventListener('keyup', e => {
                if (e.key === 'Escape') {
                    this.resetAnswerSelection();
                }
            });
        }
    }
</script>