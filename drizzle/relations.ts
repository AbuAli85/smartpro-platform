import { relations } from "drizzle-orm/relations";
import { trainingQuizzes, quizAttempts, users, quizQuestions, quizOptions } from "./schema";

export const quizAttemptsRelations = relations(quizAttempts, ({one}) => ({
	trainingQuizz: one(trainingQuizzes, {
		fields: [quizAttempts.quizId],
		references: [trainingQuizzes.id]
	}),
	user: one(users, {
		fields: [quizAttempts.userId],
		references: [users.id]
	}),
}));

export const trainingQuizzesRelations = relations(trainingQuizzes, ({many}) => ({
	quizAttempts: many(quizAttempts),
	quizQuestions: many(quizQuestions),
}));

export const usersRelations = relations(users, ({many}) => ({
	quizAttempts: many(quizAttempts),
}));

export const quizOptionsRelations = relations(quizOptions, ({one}) => ({
	quizQuestion: one(quizQuestions, {
		fields: [quizOptions.questionId],
		references: [quizQuestions.id]
	}),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({one, many}) => ({
	quizOptions: many(quizOptions),
	trainingQuizz: one(trainingQuizzes, {
		fields: [quizQuestions.quizId],
		references: [trainingQuizzes.id]
	}),
}));