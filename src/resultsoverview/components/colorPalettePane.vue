<template>
    <section 
        class="color-pane padding border-radius background border"
        v-click-outside="closeColorPalettePane"
    >
        <v-button-clear
            class="close-pane-btn"
            icon="fa-times"
            @on-click="closeColorPalettePane"
        />    
        <div class="colors">
            <h2>{{ text.label_branding_colors }}</h2>
            <div class="color-swatches">
                <v-button 
                    v-for="color, colorIndex in colorPalette"
                    :icon="colorIsSelected(colorIndex) ? 'fa-check': null"
                    class="color-swatch"
                    :disabled="colorPositionIsBeingSaved === true"
                    :style="{background: color}" 
                    @click="changeAnswerColor(colorIndex, color)">
                </v-button>
            </div>
            <div class="add-new-colors flex">
                <v-anchor
                    is="nav-to-survey-branding"
                    :value="text.resultaten_add_new_color"
                    :href="`/Results/SurveyBranding/Index/${surveyId}`"
                />
            </div>
        </div>
    </section>
</template>

<script>
 export default {
    name: 'color-palette-pane',
    inject: ["text", "get"],
    emits: ["update:modelValue","closeColorPalettePane"],
    props: {
        modelValue: {
            type: Object,
            required: true
        },
        colorPalette: {
            type: Object,
            required: true 
        }
    },
    data() {
        return {
            surveyId: '',
            selectedColorPosition: '',
            colorPositionIsBeingSaved: false
        }
    },
    created() {
        this.surveyId = window.location.pathname.split("/").pop();
        this.selectedColorPosition = this.modelValue.colorPaletteIndex;
    },
    methods: {
        colorIsSelected(colorIndex) {
            return this.selectedColorPosition === colorIndex;
        },
        changeAnswerColor(newColorIndex, newHexValue) {         
            if (newColorIndex === this.modelValue.colorPaletteIndex) return;

            this.selectedColorPosition = newColorIndex;
            this.saveNewColorPosition(this.modelValue.answerId, newColorIndex, newHexValue);       
        },
        saveNewColorPosition(answerId, newColorIndex, newHexValue){
            this.colorPositionIsBeingSaved = true;

            this.get({
                url: "/api/send/SaveAnswerBrandColor",
                data: {
                    answerId: answerId,
                    colorIndex: newColorIndex
                },
                successCallback: (response) => {
                    const newAnswerColor = {
                        answerId: this.modelValue.answerId,
                        answerIndex: this.modelValue.answerIndex,
                        colorPaletteIndex: newColorIndex, 
                        hexValue: newHexValue 
                    };

                    this.$emit("update:modelValue", newAnswerColor);
                    
                    // Give the chart some time to redraw before allowing the user to pick another color again, otherwise there will be errors
                    setTimeout(() => {
                        this.colorPositionIsBeingSaved = false;
                    }, 1000);
                },
            }); 
        },
        closeColorPalettePane(){
            this.$emit("closeColorPalettePane");
        }
    }
}
</script>