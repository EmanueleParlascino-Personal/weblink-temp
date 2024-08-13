export const graphMixin = {
    inject: ['text'],
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
        },
        parentQuestion: {
            type: Object
        },
        settingPaneIsOpen: {
            type: Boolean,
            default: false,
        }
    },
    computed: {
        questionSettings(){
            return this.user.settingsPerQuestions[this.results.questionId];
        },
        staticQuestionData(){
            return this.settings.questionType[this.results.questionType];
        },
        isExpertLayout(){
            return this.user.selectedSwitcherType === 1;
        },
        answers() {
            const answers = this.results.subQuestionResults ?? this.results.answerResults;

            if(this.questionSettings.sortType === "byNumberAscending") {
                return answers.sort((a, b) => {
                    if (a.number > b.number) return 1;
                    else if (a.number < b.number) return -1;
                    else return 0;
                });
            } else if(this.questionSettings.sortType === "byPercentageAscending") {
                return answers.sort((a, b) => {
                    if (a.respondentCount > b.respondentCount) return 1;
                    else if (a.respondentCount < b.respondentCount) return -1;
                    else return 0;
                });
            } else if(this.questionSettings.sortType === "byPercentageDescending") {
                return answers.sort((a, b) => {
                    if (a.respondentCount < b.respondentCount) return 1;
                    else if (a.respondentCount > b.respondentCount) return -1;
                    else return 0;
                });
            }
        }
    },
    watch: {
        results(){
            this.createChart();
        },
        questionSettings: {
            async handler() {
                if (this.questionSettings.expertGraphType === `swipe`) return;

                this.questionSettingHasChanged = true;

                await this.createChart();

                this.questionSettingHasChanged = false;
            },
            deep: true
        },
        brandColors: {
            handler() {
                // Swipe doesnt use a chart so return.
                if(this.questionSettings.expertGraphType === `swipe`) return;
                this.createChart();
            },
            deep: true
        }
    },
    created() {
        this.brandColors = this.user.brandColorsPerQuestion.get(this.results.questionId);
    },
    data() {
        return {
            chart: undefined,
            openSettingsPane: false,
            brandColors: [],
            questionSettingHasChanged: false
        }
    }
};