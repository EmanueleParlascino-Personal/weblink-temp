<template>
    <div>
        <v-grid 
            class="table-view"
            :headerRows="tableGridHeaders" 
            :rows="questionRows"
            :rowsPerPage="20"
            :showPaging="true"
        />
    </div>
    <settings-pane 
        v-if="settingPaneIsOpen === true"
        :settings
        :results
        :user
        :questionSettings
        :parentQuestion="parentQuestion ?? results"
        @close-settings-pane="this.$emit('closeCurrentSetting')"
    />
</template>
<script>

import settingsPane from '../components/settingsPane.vue';
import { nextTick } from 'vue';
import { graphMixin } from '../charts/mixins/graph';
import { formatPercentageForDisplay } from '../charts/helpers/text';

export default {
    name: `table-view`,
    mixins: [graphMixin],
    components: {settingsPane},
    emits: ['closeCurrentSetting'],
    inject: ['text', 'get'],
    data() {
        return {
            tableGridHeaders: [
                [
                    {
                        text: this.text.antwoord,
                        class: `large`,
                    },
                    {
                        text: '%',
                        class: `extrasmall`,
                    },
                    {
                        text: this.text.respondenten,
                        class: `extrasmall`,
                    }
                ]
            ],
        }
    },
    computed: {  
        questionRows(){
            let rows = [];
            this.answers.map(answer => {                    
                const columns = [
                    { 
                        text: answer.text 
                    },
                    { 
                        text: this.percentage(answer)
                    },
                    { 
                        text: answer.respondentCount
                    }
                ]
                rows.push({ columns });
            });
            return rows;
        },
    },
    methods: {	 
        percentage(answer) {
            const totalAmtOfAnswers = this.answers.reduce((acc, curr) => acc + curr.respondentCount, 0);
            return formatPercentageForDisplay(((answer.respondentCount / totalAmtOfAnswers) * 100), this.user.currentCulture);            
        },
        async createChart() {
            await nextTick();
        },
        crossTableClicked() {
            this.$emit('cross-table-clicked', this.results)
        }
    }
}
</script>