import { Machine, assign, StateSchema } from "xstate";

// The context (extended state) of the machine
interface QuizContext {
  currentQuestion: number;
  correct: number;
  incorrect: number;
  errorMessage: string;
}

// Available states of Quiz Machine
export interface QuizStateSchema {
  states: {
    initial: {
      states: {
        answering: {
          idle: {}
          submitting: {}
          complete: {}
        }
      }
    checking: {}
    correct: {}
    incorrect: {}
    finish: {}
  };
}

export const START_EVENT = { type: "START" };
export const ANSWER_EVENT = { type: "ANSWER", answer: Boolean };
export const NEXT_QUESTION_EVENT = { type: "NEXT_QUESTION" };

// The events that the machine handles
export type QuizEvent =
  | typeof START_EVENT
  | typeof ANSWER_EVENT
  | typeof NEXT_QUESTION_EVENT;

// Validate answer
const validateAnswer = (ctx: any, evt: any) =>
  new Promise((resolve, reject) => {
    if (evt.answer.picked !== null) {
      resolve(evt.answer);
    } else {
      reject(new Error("Please select answer."));
    }
  });

// NEXT_QUESTION transition object
const NEXT_Q = [
  {
    target: "answering",
    cond: "canGoToNextQuestion",
    actions: "goToNextQuestion"
  },
  { target: "finish" }
];

export const QuizMachine = Machine<QuizContext, QuizStateSchema, QuizEvent>(
  {
    id: "quiz",
    initial: "initial",
    context: {
      currentQuestion: 0,
      correct: 0,
      incorrect: 0,
      errorMessage: ""
    },
    states: {
      initial: {
        on: {
          START: {
            cond: "newTotalQuestionsIsValidValue",
            actions: "assignTotalQuestionsToContext",
            target: "answering"
          }
        }
      },
      answering: {
        initial: "idle",
        id: "answering-id",
        onDone: {
          target: "checking"
        },
        states: {
          idle: {
            exit: ["clearErrorMessage"],
            on: {
              ANSWER: {
                target: "submitting",
                actions: assign((context, event) => {
                  return {
                    answer: event.answer
                  };
                })
              }
            }
          },
          submitting: {
            invoke: {
              src: validateAnswer,
              id: "validate-answer",
              onDone: {
                target: "complete"
              },
              onError: {
                target: "idle",
                actions: assign((context, event) => {
                  return {
                    errorMessage: event.data.message
                  };
                })
              }
            }
          },
          complete: {
            type: "final"
          }
        }
      },
      checking: {
        always: [
          {
            target: "correct",
            cond: "isCorrect",
            actions: assign((context, event) => {
              return {
                correct: context.correct + 1
              };
            })
          },
          {
            target: "incorrect",
            cond: "isIncorrect",
            actions: assign((context, event) => {
              return {
                incorrect: context.incorrect + 1
              };
            })
          }
        ]
      },
      correct: {
        on: {
          NEXT_QUESTION: NEXT_Q
        }
      },
      incorrect: {
        on: {
          NEXT_QUESTION: NEXT_Q
        }
      },
      finish: {
        type: "final"
      }
    }
  },
  {
    guards: {
      newTotalQuestionsIsValidValue: (context, event) => {
        if (event.type !== "START") return false;

        return event.totalQuestions > 0;
      },
      canGoToNextQuestion: (context) => {
        return context.currentQuestion < context.totalQuestions;
      },
      isCorrect: (ctx, event) => {
        if (ctx.answer.picked === ctx.answer.value) {
          return true;
        }
      },
      isIncorrect: (ctx, event) => {
        if (ctx.answer.picked !== ctx.answer.value) {
          return true;
        }
      }
    },
    actions: {
      clearErrorMessage: assign({
        errorMessage: () => undefined
      }),
      goToNextQuestion: assign({
        currentQuestion: (context, event) => context.currentQuestion + 1
      }),
      assignTotalQuestionsToContext: assign((context, event) => {
        if (event.type !== "START") return {};
        // questions array starts from index 0
        // reduce one from the total length of questions array
        return {
          totalQuestions: event.totalQuestions - 1
        };
      })
    }
  }
);
