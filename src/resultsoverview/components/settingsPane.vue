<template>
    <section 
        class="settings-pane position-top-right border-radius padding background border"
        v-click-outside="closePane"
    >
        <v-button-clear
            :aria-label="text.resultaten_settings_pane_aria_close"
            class="close-pane-btn"
            icon="fa-times"
            @on-click="closePane"
        />
        <div>
            <p>{{text.resultaten_graph_type_title}}</p>
            <div 
                v-separator-after
                id="question-graph-types"
                class="gap-10 flex-wrap"
            >
                <template 
                    v-for="graphName in questionTypeSettings.allowedGraphList"
                >
                    <v-button 
                        v-if="questionSettings.expertGraphType === graphName"
                        :icon="settings.charts[graphName].icon"
                        :id="graphName"
                        :disabled="questionIsDisabled"
                    />
                    <v-button-clear 
                        v-else
                        :icon="settings.charts[graphName].icon"
                        :disabled="questionIsDisabled"
                        :id="graphName"
                        @onClick="onGraphButtonClick(graphName)"
                    />
                </template>
            </div>
        </div>
        <div 
            v-if="modelValue.length > 0"
            class="setting-colors" 
            v-separator-after="questionTypeSettings.hasQuestionSettings === true"
        >
            <p>{{ text.resultaten_color_title }}</p>
            <div class="direction-column gap-10">
                <div 
                    v-for="answer, answerIndex in answers"
                    class="answer-color align-center gap-10"
                >
                    <button
                        class="color-block"
                        :style="{background: modelValue[answerIndex].hexValue}"
                        :id="`answer-color-` + answerIndex"
                        @click="answerColorSelected(answer.answerId, answerIndex)"
                    ></button>
                    <p>{{ answer.text }}</p>
                </div>
            </div>
        </div>
        <template 
            v-if="questionTypeSettings.hasQuestionSettings === true"
            is="settings-options"
        >
            <div 
                v-if="chartSettings.hasDatatypeSetting === true"
                class="setting-data-types direction-column gap-10" 
                v-separator-after
            >
                <p>{{text.resultaten_settings_datatype_header}}</p>
                <div class="align-center">
                    <input 
                        type="radio" 
                        id="numbers" 
                        value="numbers" 
                        v-model="questionSettings.dataType"
                        :disabled="questionIsDisabled"
                    />
                    <label for="numbers">{{text.resultaten_resultaten_numbers}}</label>
                    <input 
                        type="radio" 
                        id="percentage" 
                        value="percentage" 
                        v-model="questionSettings.dataType" 
                        :disabled="questionIsDisabled"
                    />
                    <label for="percentage">{{text.resultaten_percentage}}</label>
                </div>
            </div>
            <div 
                v-if="chartSettings.hasLegend === true || chartSettings.hasLabelSetting === true"
                class="setting-show direction-column gap-10" 
                v-separator-after="chartSettings.hasAnswerOrderSetting === true"
            >
                <p>{{text.resultaten_settings_show_header}}</p>
                <div class="flex">
                    <v-checkbox
                        v-if="chartSettings.hasLabelSetting === true"
                        :label="text.rapport_grafiek_labels"
                        id="show-labels-check"
                        v-model="questionSettings.showLabels"
                        :disabled="questionIsDisabled"
                    />
                    <v-control
                        v-if="chartSettings.hasLegend === true" 
                        :label="text.legenda"
                        id="show-legenda-check"
                        v-model="questionSettings.showLegenda"
                        :disabled="questionIsDisabled"
                    />
                </div>
            </div>
            <div
                v-if="chartSettings.hasAnswerOrderSetting === true" 
                class="setting-sort"
            >
                <v-select 
                    is="rapport-grafiek-sorteren-op"
                    :items="sortOptions"
                    v-model="questionSettings.sortType"
                    :disabled="questionIsDisabled"
                />
            </div>
        </template>
    </section>
    <color-palette-pane 
        v-if="selectedAnswerColor.answerId !== undefined"
        v-model="selectedAnswerColor"
        :colorPalette="user.colorPalette"
        :key="selectedAnswerColor.answerId"
        @update:modelValue="changeAnswerColor"   
        @closeColorPalettePane="closeColorPalettePane"
    />
</template>

<script>
import colorPalettePane from './colorPalettePane.vue';

export default {
    name: 'settings-pane',
    inject: ["text", "get"],
    emits: [
        "update:modelValue", 
        "closeSettingsPane", 
        "changeAnswerColor"
    ],
    components: {
        colorPalettePane
    },
    props: {
        modelValue: {
            type: Object,
            required: false,
            default: []
        },
        settings: {
            type: Object,
            required: true
        },
        results: {
            type: Object,
            required: true
        },
        user: {
            type: Object,
            required: true
        },
        questionSettings: {
            type: Object,
            required: true
        },
        parentQuestion: {
            type: Object
        }
    },
    data() {
        return {
            selectedAnswerColor: { 
                answerId: undefined,
                answerIndex: undefined, 
                colorPaletteIndex: undefined, 
                hexValue: ''
            },
            questionIsDisabled: null,
            sortOptions: [
                {
                    value: "byNumberAscending",
                    text: this.text.rapportage_grafiek_sort_by_number_ascending
				},
                {
                    value: "byPercentageDescending",
                    text: this.text.rapportage_grafiek_sort_by_percentage_descending
				},
                {
                    value: "byPercentageAscending",
                    text: this.text.rapportage_grafiek_sort_by_percentage_ascending
				},
            ]
        }
    },
    watch: {
        questionSettings: {
            handler(newValue) {
                this.saveSettings(newValue);
                this.questionIsDisabled = true;
                
                setTimeout(() => {
                    this.questionIsDisabled = null;
                }, 1000);
            },
            deep: true
        }
    },
    computed: {
        answers(){
            let answers = this.results.answerResults;
            let hideOuterFieldFromSettingsPane = (this.results.outerFieldRespondentCount !== null) && this.results.questionType === "semanticdifferential";
            if (hideOuterFieldFromSettingsPane) {
                answers = answers.slice(0, -1);
            }
            return answers;
        },
        questionTypeSettings() {
            return this.settings.questionType[this.results.questionType];
        },
        chartSettings() {
            return this.settings.charts[this.questionSettings.expertGraphType];
        }
    },
    methods: {
        onGraphButtonClick(questionType){
            if(this.results.questionType === 'draganddrop') {
                const questionSettings = this.user.settingsPerQuestions[this.results.questionId];

                if(questionSettings.expertGraphType === 'verticalStackedBarChart') {
                    this.parentQuestion.subQuestionResults.forEach(sq => {
                        const questionSettings = this.user.settingsPerQuestions[sq.questionId];

                        questionSettings.expertGraphType = questionType;
                        this.saveSettings(questionSettings);
                    });
                } else {
                    questionSettings.expertGraphType = questionType;
                    this.saveSettings(questionSettings);
                }
            } else {
                this.questionSettings.expertGraphType = questionType;
                this.saveSettings(this.questionSettings);
            }
        },
        closePane(){
            if(this.selectedAnswerColor.answerId == undefined){
                this.$emit("closeSettingsPane");
            }
        },
        answerColorSelected(answerId, answerIndex) {
            this.selectedAnswerColor = {
                answerId: answerId,
                answerIndex: answerIndex,
                colorPaletteIndex: this.modelValue[answerIndex].colorPaletteIndex,
                hexValue: this.modelValue[answerIndex].hexValue
            };
        },
        changeAnswerColor() {
            const answerIndex = this.selectedAnswerColor.answerIndex;
            let brandColors = Array.from(this.modelValue);

            brandColors[answerIndex] = { 
                colorPaletteIndex: this.selectedAnswerColor.colorPaletteIndex, 
                hexValue: this.selectedAnswerColor.hexValue 
            }; 

            this.$emit("update:modelValue", brandColors);
        },
        closeColorPalettePane(){
            this.selectedAnswerColor = {};
        },
        saveSettings(questionSettings) {
            this.get({
                url: `/api/send/SaveQuestionResultSettings`,
                data: questionSettings
            });
        }
    }
}
</script>