// Vue 3
import { ref, computed, watchEffect, Component } from "vue";

// XSTATE
import { useMachine } from "@xstate/vue";
import { QuizMachine } from "../machines/QuizMachine";

// Feedback (Vue) components
import {
  answering,
  incorrect,
  finish,
  idle,
  correct
} from "../components/feedback/";

// INTERFACE

interface question {
  text: string;
  answer: boolean;
}
interface action {
  label: string;
  state: string;
  cond: (state: any) => any;
  action: () => void;
}

interface feedback {
  state: string;
  mood: Component;
  color: string;
}
// ==============

export default function quiz(Questions: question[]) {
  // initialise xstate machine
  const { state, send } = useMachine(QuizMachine, { devTools: true });

  // user answer to true/false question
  const picked = ref<boolean | null>(null);

  // show question if the following states don't matche
  const isQuestionTime = computed<boolean>(
    () => !state.value.matches("initial") && !state.value.matches("finish")
  );

  // to disable radio buttons once answered
  // check if current state matches correct or incorrect
  const isAnswered = computed<boolean>(() =>
    ["correct", "incorrect"].some(state.value.matches)
  );

  // current question based on context value defined in Quiz machine
  const currentQuestion = computed<question>(
    () => Questions[state.value.context.currentQuestion]
  );

  // reset answers when new question is set
  watchEffect(() => {
    // reset radio buttons when state becomes pending
    if (state.value.matches("answering.idle")) {
      picked.value = null;
    }
  });

  // Feedback ======================================

  // default feedback object map
  const defaultFeedback = { state: "initial", mood: idle, color: "#a27ae8" };

  const newFeedbackMap: feedback[] = [
    { state: "initial", mood: idle, color: "#a27ae8" },
    { state: "answering.idle", mood: answering, color: "#FCCB7E" },
    { state: "correct", mood: correct, color: "#50b97e" },
    { state: "incorrect", mood: incorrect, color: "#ff7043" },
    { state: "finish", mood: finish, color: "#a27ae8" }
  ];

  const currentFeedback = computed<feedback>(() => {
    const matched = newFeedbackMap.filter((feedback) =>
      state.value.toStrings().includes(feedback.state)
    );
    return matched.length === 1 ? matched[0] : defaultFeedback;
  });

  // ACTIONS ======================================

  // Array below decides which button to show based on current state
  // }
  const actions: action[] = [
    {
      label: "START",
      state: "initial",
      cond: (state) => state.value.matches("initial"),
      action: () =>
        send({
          type: "START",
          totalQuestions: Questions.length
        })
    },
    {
      label: "ANSWER",
      state: "answering.idle",
      cond: (state) => state.value.matches("answering.idle"),
      action: () =>
        send({
          type: "ANSWER",
          answer: {
            picked: picked.value,
            value: currentQuestion.value.answer
          }
        })
    },
    {
      label: "NEXT",
      cond: (state) => ["correct", "incorrect"].some(state.value.matches),
      action: () => send({ type: "NEXT_QUESTION" })
    }
  ];

  // show active button based on state value
  const activeButton = computed(() =>
    actions.find((action) => action.cond(state))
  );

  // return properties and methods to control the UI
  return {
    state,
    send,
    picked,
    isQuestionTime,
    isAnswered,
    currentQuestion,
    currentFeedback,
    activeButton
  };
}
