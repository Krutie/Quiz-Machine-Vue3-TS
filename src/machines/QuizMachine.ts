/* eslint-disable */
import { createMachine, assign, StateSchema } from "xstate";

export interface Answer {
  picked?: boolean | null;
  value?: boolean;
}

// The context (extended state) of the machine
export interface QuizContext {
  currentQuestion: number;
  correct: number;
  incorrect: number;
  errorMessage?: string;
  answer: Answer;
  totalQuestions: number;
}

type InitialState = { value: "initial"; context: QuizContext };
type AnsweringState = { value: "answering"; context: QuizContext };
type IdleState = { value: "answering.idle"; context: QuizContext };
type SubmittingState = { value: "submitting"; context: QuizContext };
type CompleteState = { value: "complete"; context: QuizContext };

type CheckingState = { value: "checking"; context: QuizContext };
type CorrectState = { value: "correct"; context: QuizContext };
type IncorrectState = { value: "incorrect"; context: QuizContext };
type FinishState = { value: "finish"; context: QuizContext };

export type QuizState =
  | InitialState
  | AnsweringState
  | IdleState
  | SubmittingState
  | CompleteState
  | CheckingState
  | CorrectState
  | IncorrectState
  | FinishState;

export type QuizEvent =
  | { type: "START"; totalQuestions: number }
  | { type: "ANSWER"; answer?: Answer }
  | { type: "NEXT_QUESTION" };

// Validate answer
const validateAnswer = (ctx: QuizContext, evt: QuizEvent) =>
  new Promise((resolve, reject) => {
    if (evt.type === "ANSWER" && evt.answer?.picked !== null) {
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

export const QuizMachine = createMachine<QuizContext, QuizEvent, QuizState>(
  {
    id: "quiz",
    initial: "initial",
    context: {
      currentQuestion: 0,
      correct: 0,
      incorrect: 0,
      errorMessage: "",
      answer: { picked: null, value: false },
      totalQuestions: 0
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
                  return event.type === "ANSWER" 
                    ? { answer: event.answer }
                    : { }
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
            actions: assign((context: QuizContext, event) => {
              return {
                correct: context.correct + 1
              };
            })
          },
          {
            target: "incorrect",
            cond: "isIncorrect",
            actions: assign((context: QuizContext, event) => {
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
      newTotalQuestionsIsValidValue: (context, event: QuizEvent) => {
        if (event.type !== "START") return false;

        return event.totalQuestions > 0;
      },
      canGoToNextQuestion: (context:QuizContext) => {
        return context.currentQuestion < context.totalQuestions;
      },
      isCorrect: (ctx: QuizContext) => {
        return ctx.answer.picked === ctx.answer.value;
      },
      isIncorrect: (ctx: QuizContext) => {
        return ctx.answer.picked !== ctx.answer.value;
      }
    },
    actions: {
      clearErrorMessage: assign((context: QuizContext) => {
        return { errorMessage: undefined }
      }),
      goToNextQuestion: assign((context: QuizContext) => {
        return { currentQuestion: context.currentQuestion + 1}
      }),
      assignTotalQuestionsToContext: assign((context, event: QuizEvent) => {
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
