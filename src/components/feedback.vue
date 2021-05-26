<template>
  <div style="padding-top: 20px;" v-if="currentFeedback">
    <component
      :is="currentFeedback.mood"
      :key="state.value"
      class="feedback"
    ></component>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
// import { Feedback } from "../types/index";
import { QuizContext, QuizEvent, QuizState } from "../types/index";
import { State } from "xstate";
export default defineComponent({
  props: {
    state: {
      type: Object as PropType<State<QuizContext, QuizEvent, QuizState>>,
      required: true
    },
    currentFeedback: {
      type: Object, // as PropType<Feedback>,
      required: true
    }
  }
});
</script>
