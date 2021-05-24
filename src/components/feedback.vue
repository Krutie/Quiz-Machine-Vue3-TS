<template>
  <div>
    <component
      v-if="currentFeedback"
      :key="state.value.value"
      :is="currentFeedback.mood"
      class="feedback"
    ></component>
  </div>
</template>
<script>
export default {
  props: ["state", "currentFeedback"],
};
</script>