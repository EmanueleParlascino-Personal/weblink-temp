<template>
    <div class="question-result-outerfield" :id="id">
        <p>
            {{this.outerFieldText + `:`}}
            <strong class='emphasis-weight emphasis-color'>
                {{this.respondentCount}}
            </strong>
        </p>
    </div>
</template>

<script>
    export default {
        name: `result-outerfield`,
        inject: ["text"],
        props: {
            id: {
                type: String,
                required: true
            },
            respondentCount: {
                type: Number,
                required: true
            },
            outerFieldText: {
                type: String,
                required: true
            }
        }
    }
</script>