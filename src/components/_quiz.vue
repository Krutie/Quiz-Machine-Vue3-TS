<template>
  <div id="quiz">
    <h2>Quiz Machine - v5 - TS</h2>
    <div class="box">
      state: {{ state.value }}
      <!-- feedback emojis -->
      <feedback :state="state" :currentFeedback="currentFeedback" />

      <!-- instructions -->
      <instructions :state="state" />

      <!-- question -->
      <div v-if="isQuestionTime">
        <span class="question">
          {{ currentQuestion.text }}
        </span>
        <input
          :disabled="isAnswered"
          type="radio"
          id="true"
          :value="true"
          v-model="picked"
        />
        <label :class="{ 'disabled-label': isAnswered }" for="true">True</label>
        <input
          :disabled="isAnswered"
          type="radio"
          id="false"
          :value="false"
          v-model="picked"
        />
        <label :class="{ 'disabled-label': isAnswered }" for="false"
          >False</label
        >
      </div>

      <!-- ACTIONS -->
      <actions :state="state" :activeButton="activeButton" />
    </div>

    <!-- SCORE -->
    <score :score="state.context" />
  </div>
</template>

<script>
import { defineComponent, toRefs } from "vue";

// child components
import instructions from "./instructions.vue";
import feedback from "./feedback.vue";
import score from "./score.vue";
import actions from "./actions.vue";
// usable
import useQuiz from "../use/quiz";

//
import { fetchQuestions } from "../data";

export default defineComponent({
  name: "Quiz",
  components: {
    instructions,
    score,
    feedback,
    actions
  },
  setup() {
    const {
      state,
      send,
      picked,
      isQuestionTime,
      isAnswered,
      currentQuestion,
      currentFeedback,
      activeButton
    } = useQuiz(fetchQuestions());

    return {
      state,
      send,
      picked,
      isAnswered,
      isQuestionTime,
      currentQuestion,
      currentFeedback,
      activeButton
    };
  }
});
</script>
<style></style>
