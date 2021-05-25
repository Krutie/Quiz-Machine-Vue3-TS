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
import { defineComponent } from "vue";
export default defineComponent({
  props: ["state", "currentFeedback"]
});
</script>
