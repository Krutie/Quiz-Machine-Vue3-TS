<template>
  <div id="app">
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
import { defineComponent } from 'vue';
// data
import questions from "./assets/questions.json";
// child components
import instructions from "./components/instructions";
import feedback from "./components/feedback";
import score from "./components/score";
import actions from "./components/actions";
// usable
import useQuiz from "./use/quiz";

export default defineComponent ({
  name: "App",
  components: {
    instructions,
    score,
    feedback,
    actions,
  },
  props: {
    data: {
      type: Array,
      default: questions,
    },
  },
  setup(props) {
    const {
      state,
      send,
      picked,
      isQuestionTime,
      isAnswered,
      currentQuestion,
      currentFeedback,
      activeButton,
    } = useQuiz(props.data);

    return {
      state,
      send,
      questions,
      picked,
      isAnswered,
      isQuestionTime,
      currentQuestion,
      currentFeedback,
      activeButton,
    };
  },
});
</script>
<style>
</style>