<template>
    <section 
        :id
        :aria-label="text.vw_en_rs_rangorde_vraag"
    >
    <div>
        <v-button 
            @click="downloadZip"
            icon ="fa-download" 
            :value ="text.resultaten_download_all_answers"
        />
    </div>
        <article
            v-for="answer, answerIndex in results.answerResults"
            v-separator-after="isNotLastAnswer(answerIndex)"
        >
            <div class="answer-text">
                    <p>
                        {{ answer.text }}
                    </p>
            </div>
            <div class="answers-files-container">
                <div class="image-reel">
                    <div v-for="file, fileIndex in answer.files" v-if="isDoneLoading">
                        <div v-if="file.answerType ==='Image'" class="file-placeholder" >
                            <a :href="file.uri" class="download-anchor" :alt="file.fileName" download>
                                <v-button  icon ="fa-download" />
                            </a>
                            <img :src="file.uri" :alt="file.fileName" @click="selectFile(file, answerIndex, fileIndex)"/>
                        </div>
                        <div v-if="file.answerType ==='Audio'" class="file-placeholder media-file audio-file" role="button" >
                            <div class="play-buttons">
                                <a @click="pause(file.id, answerIndex, fileIndex)" v-if="file.isPlaying">
                                    <v-button  icon ="fa-pause" />
                                </a>
                                <a @click="play(file.id, answerIndex, fileIndex)" v-else>
                                    <v-button  icon ="fa-play" />
                                </a>
                                <a :href="file.uri"  :alt="file.fileName" download>
                                    <v-button  icon ="fa-download" />
                                </a>
                            </div>
                            <audio :ref="file.id" :src="file.uri" controls :style="{display: 'none'}"></audio>
                            <v-button-clear class="file-icon" icon ="fa-solid fa-file-audio" @click="selectFile(file, answerIndex, fileIndex)"/>
                            <span class="file-name">{{file.fileName}}</span>
                        </div>
                        <div v-if="file.answerType ==='Video'" class="file-placeholder" >
                            <div class="play-buttons">
                                <a @click="pause(file.id, answerIndex, fileIndex)" v-if="file.isPlaying">
                                    <v-button  icon ="fa-pause" />
                                </a>
                                <a @click="play(file.id, answerIndex, fileIndex)" v-else>
                                    <v-button  icon ="fa-play" />
                                </a>
                                <a :href="file.uri"  :alt="file.fileName" download>
                                    <v-button  icon ="fa-download" />
                                </a>
                            </div>
                            <video  :ref="file.id" width="520" height="440" @click="selectFile(file, answerIndex, fileIndex)" >
                                <source :src="file.uri">
                            </video>
                        </div>
                        <div v-if="file.answerType ==='File'" class="file-placeholder audio-file" role="button">
                            <a :href="file.uri" class="download-anchor" :alt="file.fileName" download>
                                <v-button  icon ="fa-download" />
                            </a>
                            <v-icon 
                                icon="fa-solid fa-file"
                                :size="60"
                            />
                            <span class="file-name">{{file.fileName}}</span>
                        </div>
                    </div>
                </div>
            </div>  
        </article>
    </section>
    <div id="image-dialog" :style="{display: showModal? '' : 'none'}">
        <div class="modal-container" v-click-outside="closeModal">
            <div class="left-arrow">
                <button  @click="navigate('left')">
                    <i tabindex="0" role="button" class="fa fa-caret-left fa-4x" aria-hidden="true"></i>
                </button>
            </div>
            <div class="modal-image-container" v-if="selectedFile.file.answerType ==='Image'" >    
                <img :src="selectedFile.file.uri" :alt="selectedFile.file.name"/>
            </div>
            <div class="modal-video-container" v-if="selectedFile.file.answerType ==='Video'">
                <video ref ="video" width="520" height="440" controls>
                    <source :src="selectedFile.file.uri">
                </video>
            </div>
            <div class="modal-audio-container" v-if="selectedFile.file.answerType ==='Audio'">
                <audio  ref ="audio" controls>
                    <source v-bind:src="selectedFile.file.uri">
                </audio>
            </div>
            <div class="right-arrow">
                <button  @click="navigate('right')">
                    <i tabindex="0" class="fa fa-caret-right fa-4x" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'camera',
        inject: ["text", "get", "global"],
        inheritAttrs: true,
        data(){
            return{
                showModal: false,
                selectedFile:{
                    file:{},
                    answerIndex: 0,
                    fileIndex: 0
                }
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
            filterSettings: {
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
        computed:{
            isDoneLoading(){
                return !this.results.answerResults.some(element => element.files === undefined)
            }
        },
        watch:{
            selectedFile:{
                handler() {
                    this.updatePlayers();
                },
                deep: true
            }
        },
        methods: {
            isNotLastAnswer(answerIndex) {
                return answerIndex + 1 < this.results.answerResults.length;
            },
            selectFile(file, answerIndex, fileIndex){
                setTimeout(() => {
                    this.showModal = true;
                }, 50);
                this.selectedFile.file = file
                this.selectedFile.answerIndex = answerIndex;
                this.selectedFile.fileIndex = fileIndex;
            },
            closeModal(){
                this.showModal = false; 
                this.updatePlayers();
            },
            play(id, answerIndex, fileIndex){
                let file = this.$refs[id][0];
                file.play();
                this.results.answerResults[answerIndex].files[fileIndex].isPlaying = !file.paused
            },
            pause(id, answerIndex, fileIndex){
                let file = this.$refs[id][0];
                file.pause();
                this.results.answerResults[answerIndex].files[fileIndex].isPlaying = !file.paused
            },
            updatePlayers(){
                let video = this.$refs.video;
                let audio = this.$refs.audio;
                
                if(video !== undefined){
                    video.load();
                }
                if(audio !== undefined){
                    audio.load();
                }
            },
            navigate(direction){
                direction === 'right' ? this.selectedFile.fileIndex++ : this.selectedFile.fileIndex--;
                let fileArrayLength = this.results.answerResults[this.selectedFile.answerIndex].files.length - 1;
                if(this.selectedFile.fileIndex > fileArrayLength){
                    this.selectedFile.fileIndex = 0
                }
                if(this.selectedFile.fileIndex < 0){
                    this.selectedFile.fileIndex = fileArrayLength;
                }
                let newfile = this.results.answerResults[this.selectedFile.answerIndex].files[this.selectedFile.fileIndex];
                this.selectedFile.file = newfile;
            },
            async getFiles(){
                this.results.answerResults.map((answer,index) =>
                    {
                        this.get({
                            url: `/api/${this.global.surveyId}/respondentfiles/${answer.answerId}`,
                            data: {
                                page: 1,
                                pageSize: 20,
                                dateFrom: this.filterSettings.beginDate,
                                dateTo: this.filterSettings.endDate,
                                filterId: this.filterSettings.filterId,
                                respondentStatus: this.filterSettings.respondentState
                            },
                            successCallback: (response) => {
                                let files = response.answerFiles.map((file) => ({...file, isPlaying: false}))
                                this.results.answerResults[index] = {...answer, files}
                            }
                        })
                    }
                )     
            },
            downloadZip(){
                window.location = `/api/${this.global.surveyId}/downloadzip/${this.results.questionId}/${this.filterSettings.filterId}/${this.filterSettings.beginDate}/${this.filterSettings.endDate}/${this.filterSettings.respondentState}`;         
            }
        },
        mounted(){
            this.getFiles();
        }
    }
</script>

