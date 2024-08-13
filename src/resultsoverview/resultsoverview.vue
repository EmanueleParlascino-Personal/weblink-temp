<template>
    <v-notification
        v-if="notification.isVisible === true"
        v-model="notification.isVisible"
        :notificationType="notification.type"
        :message="notification.message"
    />
    <section v-if="dataIsStillLoading === false" class="branding-image">
        <div v-if="user.brandImage !== null">
            <img 
                :src="user.brandImage.src"
                :alt="user.brandImage.name"
            >
            <v-anchor-main
                is="nav-to-edit-branding"
                icon="fa-pencil"
                value=""
                :href="`/Results/SurveyBranding/Index/${global.surveyId}`"
            />
        </div>
        <v-anchor
            v-else
            is="nav-to-branding"
            icon="fa-file-arrow-up"
            :value="text.resultaten_upload_logo_btn"
            :href="`/Results/SurveyBranding/Index/${global.surveyId}`"
        />
    </section>
    <v-button-clear 
        v-if="crossTableSettings.status === crossTableStatus.active"
        :value="text.knop_terug" 
        id="back-button"
        @onClick="onBackButtonClick()"
    />
    <div class="block-header">
        <h1 >survey results</h1>
    </div>
    
    <section 
        class="question-container"
        v-loader.fixed="showLoader"
    >                    
        <template 
            v-if="dataIsStillLoading === false"
            v-for="questionResult, questionIndex in questionResults"
            :key="user.settingsPerQuestions[questionResult.questionId]"
        >
            <article 
                class="block"
                :data-graph-type="questionResult.questionType"
                :data-question-number="(questionIndex)"
                :data-question-show="hideShowQuestion(`question`, questionResult, questionResult.questionId)"
                :data-all-subquestion-show="hideShowQuestion(`allsubquestions`, questionResult)"
            >
                <template v-if="questionTypeHasSubQuestions(questionResult) === false">
                    <div class="graph-setting-btns" v-if="showCrossTable === false && isExpertLayout">
                        <v-button-clear
                            class="hidequestion-btn"
                            :icon="questionIsHidden(questionResult.questionId) === true ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
                            @click="hideQuestion(questionResult.questionId)"
                        />
                        <v-button-clear
                            v-if="settings.questionType[questionResult.questionType].hasCrosstable && isExpertLayout"
                            class="crosstable-btn"
                            icon="fa-solid fa-table"
                            :aria-label="text.resultaten_crosstables_aria_open"
                            :disabled="questionIsHidden(questionResult.questionId) === false ?? null"
                            @click="onCrossTableClicked(questionResult)"
                        />
                        <v-button-clear
                            v-if="settings.questionType[questionResult.questionType].hasSettingsButton === true"
                            class="toggle-settings-btn"
                            icon="fa-solid fa-gear"
                            :aria-label="text.resultaten_settings_pane_aria_open"
                            :disabled="questionIsHidden(questionResult.questionId) === false ?? null"
                            @onClick="questionWithOpenSettingsPaneGuid = questionResult.questionId" 
                        />
                    </div>
                    <div class="question">
                        <h2>
                            {{ graphQuestionTitle(questionResult) }}
                        </h2>
                        <crossTable 
                            v-if="showCrossTable === true"
                            :id="`crosstable-${questionIndex}`"
                            :questionYResult="questionResult"
                            :user
                            :crossTableSettings
                            :settings
                            @cross-table-clicked="onCrossTableClicked($event)"
                        />
                        <template v-else>
                            <p 
                                v-if="questionTypesMR.includes(questionResult.questionType)" 
                                class="mr-question-text"
                            >
                                More than one answer possible
                            </p>
                            <div 
                                v-if="questionHasResultScore(questionResult)"
                                class="question-result-score"
                            >
                                <resultScore 
                                    :id="`average-or-nps-score-${questionIndex}`"
                                    :results="questionResult"
                                    :isAnswerResult="false"
                                />
                            </div>
                            <star-rating
                                v-if="questionResult.questionType === `rating` && isExpertLayout"
                                :id="`star-${questionIndex}`"
                                :results="questionResult"
                                :settings
                                :user
                            />
                            <component 
                                :is="graphType(questionResult)" 
                                :id="`graph-${questionIndex}`"
                                :results="questionResult"
                                :user
                                :filterSettings
                                :settings
                                :settingPaneIsOpen="questionResult.questionId === questionWithOpenSettingsPaneGuid"
                                @closeCurrentSetting="questionWithOpenSettingsPaneGuid = ``"
                            />
                            <multiAnswerList
                                v-if="questionsWithOpenAnswers(questionResult)"
                                :id="`open-answers-question-${questionIndex}`"
                                :results="questionResult"
                                :settings
                                :user
                                :filterSettings
                            />
                            <outerField
                                v-if="displayOuterField(questionResult)"
                                :id="`question-result-outer-field-${questionIndex}`"
                                :respondentCount="questionResult.outerFieldRespondentCount"
                                :outerFieldText="questionResult.outerFieldText"
                            />
                        </template>
                    </div>
                </template>
                <template v-else>
                    <h2 v-separator-after>
                        {{ graphQuestionTitle(questionResult) }}
                    </h2>
                    <article
                        v-for="sqResult, sqIndex in questionResult.subQuestionResults"
                        class="sub-articles"
                        :data-question-subquestion-number="(questionIndex) + `-` + (sqIndex)"
                        :data-subquestion-show="hideShowQuestion(`subquestion`, questionResult, sqResult.questionId)"
                        v-separator-after="skipLastSubQuestion(sqIndex, questionResult)"
                    >
                    <div class="graph-setting-btns" v-if="!showCrossTable && isExpertLayout">
                        <v-button-clear
                            class="hidequestion-btn"
                            :icon="questionIsHidden(sqResult.questionId) === true ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
                            @click="hideQuestion(sqResult.questionId)"
                        />
                        <v-button-clear
                            v-if="settings.questionType[sqResult.questionType].hasCrosstable === true"
                            class="crosstable-btn"
                            icon="fa-solid fa-table"
                            :aria-label="text.resultaten_crosstables_aria_open"
                            :disabled="questionIsHidden(sqResult.questionId) === false ?? null"
                            @click="onCrossTableClicked(sqResult)"
                        />
                        <v-button-clear
                            v-if="settings.questionType[sqResult.questionType].hasSettingsButton === true"
                            class="toggle-settings-btn"
                            icon="fa-solid fa-gear"
                            :aria-label="text.resultaten_settings_pane_aria_open"
                            :disabled="questionIsHidden(sqResult.questionId) === false ?? null"
                            @onClick="questionWithOpenSettingsPaneGuid = sqResult.questionId" 
                        />
                    </div>
                    <div class="subquestion">
                        <h2>
                            {{ graphSubquestionTitle(sqResult, sqIndex, questionResult) }}
                        </h2>
                        <crossTable 
                            v-if="showCrossTable"
                            :id="`crosstable-${sqIndex}`"
                            :questionYResult="sqResult"
                            :user
                            :crossTableSettings
                            :settings
                            @cross-table-clicked="onCrossTableClicked($event)"
                        />
                        <template v-else>
                            <div 
                                v-if="questionHasResultScore(sqResult)"
                                class="subquestion-result-score"
                            >
                                <resultScore
                                    :id="`average-or-nps-score-subquestion-${sqIndex}`"
                                    :results="sqResult"
                                    :isAnswerResult="false"
                                />
                            </div>
                            <component
                                :is="graphType(sqResult)"
                                :id="`graph-${questionIndex}-${sqIndex}`"
                                :results="sqResult"
                                :user
                                :settings
                                :filterSettings
                                :parentQuestion="questionResult"
                                :settingPaneIsOpen="sqResult.questionId === questionWithOpenSettingsPaneGuid"
                                @closeCurrentSetting="questionWithOpenSettingsPaneGuid = ``"
                            />
                           
                            <multiAnswerList
                                v-if="questionsWithOpenAnswers(sqResult)"
                                :id="`open-answers-subquestion-${questionIndex}-${sqIndex}`"
                                :results="sqResult"
                                :settings
                                :user
                                :showSettingsButton="false"
                                :filterSettings
                            />
                            <div
                                v-if="displayOuterField(sqResult)"
                                class="subquestion-outer-field"
                            >
                                <outerField
                                    v-if="displayOuterField(sqResult)"
                                    :id="`subquestion-outer-field-${questionIndex}`"
                                    :respondentCount="sqResult.outerFieldRespondentCount"
                                    :outerFieldText="sqResult.outerFieldText"
                                />
                            </div>
                            <div  
                                class="bottom-respondent-count"
                            >
                                <respondentCount
                                    :id="`respondent-count-${questionIndex}`"
                                    :results="sqResult"
                                    :user
                                    :settings
                                    :showSettingsButton="false"
                                />
                            </div>                            
                        </template>
                        </div>
                    </article>
                </template>
                <div
                    v-if="showRespondentCount(questionResult)"
                    class="bottom-respondent-count"
                >
                    <respondentCount
                        :id="`respondent-count-${questionIndex}`"
                        :results="questionResult"
                        :user
                        :settings
                        :showSettingsButton="false"
                        :bottom="true"
                    />
                </div>
            </article>
        </template>
    </section>
</template>
<script>


import horizontalBarChart from './charts/horizontalBarChart.vue';
import pieChart from './charts/pieChart.vue';
import verticalBarChart from './charts/verticalBarChart.vue';
import verticalStackedBarChart from './charts/verticalStackedBarChart.vue'
import stackedBarChart from './charts/stackedBarChart.vue';
import lineChart from './charts/lineChart.vue';
import polarChart from './charts/polarChart.vue';
import donutChart from './charts/donutChart.vue';
import answerList from './components/answerList.vue';
import starRating from './components/starRating.vue';
import multiAnswerList from './components/multiAnswerList.vue';
import respondentCount from './components/respondentCount.vue';
import ranking from './components/ranking.vue';
import actionBar from './components/actionBar.vue';
import slider from './components/slider.vue';
import swipe from './components/swipe.vue';
import getStaticData from "./staticData.js";
import hotspot from './components/hotspot.vue';
import resultScore from './components/resultScore.vue';
import outerField from './components/outerField.vue';
import tableView from './components/tableView.vue'
import crossTable from './components/crossTable.vue';
import camera from './components/camera.vue';
import get from './methods.js'

export default {
    name: `results-overview`,
    components: { 
        horizontalBarChart, 
        pieChart, 
        verticalBarChart, 
        stackedBarChart,
        polarChart, 
        donutChart,
        answerList,
        multiAnswerList,
        starRating,
        respondentCount,
        actionBar,
        slider,
        verticalStackedBarChart,
        swipe,
        lineChart,
        ranking,
        hotspot,
        resultScore,
        outerField,
        tableView,
        crossTable,
        camera
    },
    data() { 
        return {
            notification: {
                isVisible: false,
                message: ``,
                type: `failure`,
            },
            filterSettings: {
                filterId: '', 
                beginDate: '',
                endDate: '',
                respondentState: 'Completes'
            },
            questionWithOpenSettingsPaneGuid: ``,
            user: {
                respondentAmt: 0,
                selectedSwitcherType: -1,
                colorPalette: [],
                brandImage: undefined,
                brandColorsPerQuestion: new Map()
            }, 
            disableApplyFilterBtn: false,
            questionResults: undefined,
            
            questionTypesMR: ['multi', 'tablemulti', 'imagemulti'],
            crossTableStatus: {
                inactive: 'inactive',
                loading: 'loading',
                loadingNewTable: 'loadingNewTable',
                active: 'active'
            },
            disableExportButton: false,
            crossTableSettings: {
                status: 'inactive',
                dataType: "number",
                crossedQuestionID: undefined,
                crossTableData: undefined,
            }
        };
    },
    watch: {
        questionResults: {
            handler() {
                if(this.crossTableSettings.status === this.crossTableStatus.active) {
                    this.getCrossTableData();
                }
            },
            deep: true
        }
    },
    computed: {
        isExpertLayout(){
            return this.user.selectedSwitcherType === 1;
        },
        dataIsStillLoading(){
            return this.questionResults === undefined || 
                this.user.brandImage === undefined || 
                this.user.settingsPerQuestions === undefined;
        },
        exportButtonIsDisabled() {
            return this.disableExportButton === true || 
                this.crossTableSettings.status === this.crossTableStatus.active
        },
        showLoader() {
            return this.dataIsStillLoading === true || 
                this.crossTableSettings.status === this.crossTableStatus.loading || 
                this.crossTableSettings.status === this.crossTableStatus.loadingNewTable;
        },
        showCrossTable() {
            return this.crossTableSettings.status === this.crossTableStatus.active || 
                this.crossTableSettings.status === this.crossTableStatus.loadingNewTable
        }
    },
    methods: {
        allSubQuestionsHidden(questionResult) {
            const subQuestionResults = questionResult.subQuestionResults;
            const subQuestionResultsAmount = subQuestionResults.length;
            let counter = 0;
            subQuestionResults.forEach(subquestion => {
               if( this.user.settingsPerQuestions[subquestion.questionId].showQuestion === false) {
                    counter++;
               }
            });

            return counter !== subQuestionResultsAmount;
        },
        questionIsHidden(questionId) {
            return this.user.settingsPerQuestions[questionId].showQuestion;
        },
        hideShowQuestion(typeOfQuestion, questionResult, subQuestionId) {
            let hasSubQuestions = this.questionTypeHasSubQuestions(questionResult);
            if(typeOfQuestion === `question`) {
                return hasSubQuestions === false && this.isExpertLayout && !this.showCrossTable ? this.questionIsHidden(questionResult.questionId) : null;
            }
            else if(typeOfQuestion === `allsubquestions`) {
                return hasSubQuestions === true && this.isExpertLayout && !this.showCrossTable ? this.allSubQuestionsHidden(questionResult) : null;
            }
            else if(typeOfQuestion === `subquestion`) {
                return hasSubQuestions === true && this.isExpertLayout && !this.showCrossTable ? this.questionIsHidden(subQuestionId) : null;
            }           
        },
        showGraphSettingsBtn(questionResult) {
            return questionResult.questionType === 'redirect' && 
                questionResult.questionId !== this.crossTableSettings.crossedQuestionId &&
                this.isExpertLayout === true;
        },
        showRespondentCount(questionResult){
            return this.questionTypeHasSubQuestions(questionResult) === false && 
                (this.crossTableSettings.status !== this.crossTableStatus.active && this.crossTableSettings.status !== this.crossTableStatus.loadingNewTable)
        },
        graphType(question) {
            const questionTypeSettings = this.settings.questionType[question.questionType];
            const questionSettings = this.user.settingsPerQuestions[question.questionId];

            // show an empty vertical bar chart when these graphs have no respondents
            if((question.questionType === 'single' || question.questionType === 'tablesingle') && question.respondentCount === 0) {
                return 'verticalBarChart';
            }

            if(question.questionType === 'fileupload'){
                return 'camera';
            }
          
            if(this.isExpertLayout === true && question.questionType !== 'rating' && !(question.questionType === 'selectbox' && question.answerResults.length > 20) ) {
                return questionSettings.expertGraphType;
            } else {
                return questionTypeSettings.chartBasic;
            }
        },
        isDragAndDropVerticalStackedBar(question) {
            const expertGraphType = this.user.settingsPerQuestions[question.questionId].expertGraphType;

            return question.questionType === 'draganddrop' && this.isExpertLayout && expertGraphType === 'verticalStackedBarChart';
        },
        filterHasUpdated(data){
            this.filterSettings = data;
            this.disableApplyFilterBtn = true;
            this.getQuestions();
        },
        questionsWithOpenAnswers(questionResults) {
            return questionResults.questionType === `pointdistribution`
                || questionResults.questionType === `tablemixed`
                || questionResults.questionType === `single`
                || questionResults.questionType === `multi`;
        },
        onBackButtonClick() {
            location.reload();
        },
        onSwitchViewClicked() {
            this.disableExportButton = true;
            this.get({
                url: `/api/send/SaveSurveyResultsViewer`,
                data: {
                    surveyId: this.global.surveyId,
					IsExpertViewer: this.user.selectedSwitcherType,
				}, 
                successCallback: () =>{
                    this.disableExportButton = false
                }
            });
        },
        getQuestions() {
            get({
                url: `/api/${this.global.surveyId}/Results`,
                data: this.filterSettings,
                successCallback: (data) => {
                    // we will split questions that over 600 answers because of the limitation of the canvas size
                    this.questionResults = this.splitArrays(data.questionResults);

                    this.sanitizeTexts(this.questionResults);

                    this.user.respondentAmt = data.respondentCount;

                    setTimeout(() => {
                        this.disableApplyFilterBtn = false;
                    }, 1200);
                }
            });
        },
        getResults(){
            get({
                url: `/api/0916c6c8-1c2c-4da4-bb67-fc3000baa4b0/get-results`,
                data: this.filterSettings,
                successCallback: (data) => {
                    // we will split questions that over 600 answers because of the limitation of the canvas size
                    this.user.selectedSwitcherType = data.isExpertViewer === true ? 1 : 0;
                    this.questionResults = this.splitArrays(data.results.questionResults);
                    this.sanitizeTexts(this.questionResults);
                    this.user.respondentAmt = data.results.respondentCount;
                    this.user.settingsPerQuestions = data.questionResultSettings;
                    this.user.brandImage = data.brandImage;
                    this.user.colorPalette = data.colorPalette;
                    this.user.brandColorsPerQuestion = new Map(Object.entries(data.brandColorsPerQuestion));

                    setTimeout(() => {
                        this.disableApplyFilterBtn = false;
                    }, 1200);
                }
            });
        },
        hideQuestion(questionId) {
            const questionSettings = this.user.settingsPerQuestions[questionId]
            questionSettings.showQuestion = !questionSettings.showQuestion
            
            this.get({
                url: `/api/send/SaveQuestionResultSettings`,
                data: questionSettings
            });
        },
        getCrossTableData(crossedQuestionResult = this.crossTableSettings.crossedQuestionResult) {
            this.crossTableSettings.status = this.crossTableSettings.status === this.crossTableStatus.active ?
                this.crossTableStatus.loadingNewTable :
                this.crossTableStatus.loading;
                this.disableApplyFilterBtn = true;
            this.get({
                url: `/api/${this.global.surveyId}/Results/CrossTables/${crossedQuestionResult.questionId}`,
                data: this.filterSettings,
                successCallback: (data) => {
                    this.crossTableSettings = {
                        crossTableData: data,
                        crossedQuestionId: crossedQuestionResult.questionId,
                        crossedQuestionResult: crossedQuestionResult,
                        status: this.crossTableStatus.active,
                        dataType: this.crossTableSettings.dataType
                    }
                    this.disableApplyFilterBtn = false;
                }
            });
        },
        sanitizeTexts(question) {
            question.forEach(q => {
                q.text = q.text.replace(/<\/?[^>]+(>|$)/g, "");
                
                if(q.subQuestionResults !== null) {
                    q.subQuestionResults.forEach(sq => {
                        sq.answerResults.forEach(a => a.text = a.text.replace(/<\/?[^>]+(>|$)/g, ""));
                    });
                }

                if(q.answerResults !== null) {
                    q.answerResults.forEach(a => a.text = a.text.replace(/<\/?[^>]+(>|$)/g, ""));
                }
            })
        },
        splitArrays(questions) {
            const result = [];
            
            questions.forEach(obj => {
                if (obj.answerResults.length <= 600) {
                    // If the array has 600 or fewer elements, simply push the object to the result array
                    result.push(obj);
                } else {
                    // If the array has more than 600 elements, split it into multiple arrays
                    const numChunks = Math.ceil(obj.answerResults.length / 600);
                    const chunkSize = Math.ceil(obj.answerResults.length / numChunks);
                    
                    for (let i = 0; i < numChunks; i++) {
                        const start = i * chunkSize;
                        const end = start + chunkSize;
                        const chunk = obj.answerResults.slice(start, end);
                        
                        // Create a new object with the chunk of the array and push it to the result array
                        result.push({ ...obj, answerResults: chunk });
                    }
                }
            });
            
            return result;
        },
        questionTypeHasSubQuestions(questionResult){
            const questionSettings = this.user.settingsPerQuestions[questionResult.questionId];
            const crossTablesActive = this.crossTableSettings.status === this.crossTableStatus.active;
            return questionResult.answerResults?.length === 0 && !(questionResult.questionType === `tagit` && !crossTablesActive) && !(questionResult.questionType === 'draganddrop' && this.isExpertLayout && questionSettings.expertGraphType === "verticalStackedBarChart" && !crossTablesActive);
        },
        graphQuestionTitle(questionResults){
            return questionResults.number + " " + questionResults.text;
        },
        graphSubquestionTitle(sqResults, sqIndex, questionResult){
            let questionType = questionResult.questionType;
            if(questionType === "slider" || questionType === "semanticdifferential"){
                return sqResults.number + "." + (sqIndex + 1) + " " + questionResult.text;
            }
            return sqResults.number + "." + (sqIndex + 1) + " " + sqResults.text;
        },
        questionHasNoSq(questionResult) {
            return questionResult.subQuestionResults !== undefined;
        },
        skipLastSubQuestion(sqIndex, questionResults) {
            return sqIndex !== questionResults.subQuestionResults.length -1;
        },
        questionHasResultScore(questionResult) {
            return (questionResult.respondentCount != 0) && (questionResult.npsScore || questionResult.averageScore);
        },
        displayOuterField(questionResult) {
            let questionType = questionResult.questionType;
            if (questionType === `open` || questionType === `slider`) {
                return questionResult.outerFieldRespondentCount !== null;
            }
            if (questionType === `semanticdifferential` || questionType === `fileupload`) {
                return this.isExpertLayout && questionResult.outerFieldRespondentCount !== null;
            }
            return false;
        },
        onCrossTableClicked(crossedQuestionResult) {
            this.getCrossTableData(crossedQuestionResult);
        },
        isActiveCrossedQuestion(questionId){
            return questionId === this.crossTableSettings.crossedQuestionId;
        },
    },
    mounted() {
        //Chart.register(ChartDataLabels);
		this.settings = getStaticData();
        this.getResults();
    },
	provide() {
		return {
			pageName: 'results-overview'
		}
	}
};
</script>
