<template>
    <div 
        :id="`legend-container-${id}`"
        class="legend-container"
    ></div>
</template>

<script>
export default {
    name: `legend-container`,
    props: {
        id: {
            type: String,
            required: true
        }
    }
}
</script>