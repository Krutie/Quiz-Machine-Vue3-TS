/* eslint-disable */
import { ref, computed, watchEffect, Component } from "vue";

// XSTATE
import { useMachine } from "@xstate/vue";
import { QuizMachine, QuizEvent, QuizState, QuizContext } from "../machines/QuizMachine";
import { Typestate  } from 'xstate';


// Feedback (Vue) components
import {
  answering,
  incorrect,
  finish,
  idle,
  correct
} from "../components/feedback-components/";

// INTERFACE

interface Question {
  text: string;
  answer: boolean;
}
interface Action {
  label: string;
  cond: (state: any) => any;
  action: () => void;
}

interface Feedback {
  state: string;
  mood: Component;
  color: string;
}
// ==============

export default function quiz(Questions: Question[]) {
  // initialise xstate machine
  const { state, send } = useMachine(QuizMachine, { devTools: true });

  // user answer to true/false question
  const picked = ref<boolean | null>(null);

  // show question if the following states don't matche
  const isQuestionTime = computed<boolean>(
    () => !state.value.matches("initial") && !state.value.matches("finish")
  );

  const resultStates = ["correct", "incorrect"] as const;
  const isAnswered = computed<boolean>(() => resultStates.some(state.value.matches));

  // current question based on context value defined in Quiz machine
  const currentQuestion = computed<Question>(
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

  const newFeedbackMap: Feedback[] = [
    { state: "initial", mood: idle, color: "#a27ae8" },
    { state: "answering.idle", mood: answering, color: "#FCCB7E" },
    { state: "correct", mood: correct, color: "#50b97e" },
    { state: "incorrect", mood: incorrect, color: "#ff7043" },
    { state: "finish", mood: finish, color: "#a27ae8" }
  ];

  const currentFeedback = computed<Feedback>(() => {
    const matched = newFeedbackMap.filter(feedback =>
      state.value.toStrings().includes(feedback.state)
    );
    return matched.length === 1 ? matched[0] : defaultFeedback;
  });

  // ACTIONS ======================================

  // Array below decides which button to show based on current state
  const actions: Action[] = [
    {
      label: "START",
      cond: state => state.value.matches("initial"),
      action: () =>
        send({
          type: "START",
          totalQuestions: Questions.length
        } as QuizEvent)
    },
    {
      label: "ANSWER",
      cond: state => state.value.matches("answering.idle"),
      action: () =>
        send({
          type: "ANSWER",
          answer: {
            picked: picked.value,
            value: currentQuestion.value.answer
          }
        } as QuizEvent)
    },
    {
      label: "NEXT",
      cond: state => ["correct", "incorrect"].some(state.value.matches),
      action: () => send({ type: "NEXT_QUESTION" })
    }
  ];

  // show active button based on state value
  const activeButton = computed<Action | undefined>(() => actions.find(action => action.cond(state)));

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
