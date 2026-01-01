import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { trainingMaterials, trainingQuizzes, quizQuestions, quizOptions, quizAttempts } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const translatorTrainingRouter = router({
  // Get all training materials by category
  getMaterials: protectedProcedure
    .input(z.object({
      category: z.enum(["guidelines", "common_mistakes", "best_practices", "examples"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions = [eq(trainingMaterials.isActive, 1)];
      if (input.category) {
        conditions.push(eq(trainingMaterials.category, input.category));
      }
      
      return await db
        .select()
        .from(trainingMaterials)
        .where(and(...conditions))
        .orderBy(trainingMaterials.orderIndex, trainingMaterials.createdAt);
    }),

  // Get all active quizzes
  getQuizzes: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(trainingQuizzes)
        .where(eq(trainingQuizzes.isActive, 1))
        .orderBy(trainingQuizzes.createdAt);
    }),

  // Get quiz with questions and options
  getQuizDetails: protectedProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const quiz = await db
        .select()
        .from(trainingQuizzes)
        .where(eq(trainingQuizzes.id, input.quizId))
        .limit(1);

      if (!quiz[0]) {
        throw new Error("Quiz not found");
      }

      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, input.quizId))
        .orderBy(quizQuestions.orderIndex);

      const questionsWithOptions = await Promise.all(
        questions.map(async (question: any) => {
          const options = await db
            .select()
            .from(quizOptions)
            .where(eq(quizOptions.questionId, question.id))
            .orderBy(quizOptions.orderIndex);

          return {
            ...question,
            options: options.map((opt: any) => ({
              id: opt.id,
              optionText: opt.optionText,
              optionTextAr: opt.optionTextAr,
              orderIndex: opt.orderIndex,
            })),
          };
        })
      );

      return {
        ...quiz[0],
        questions: questionsWithOptions,
      };
    }),

  // Submit quiz attempt
  submitQuiz: protectedProcedure
    .input(z.object({
      quizId: z.number(),
      answers: z.record(z.number(), z.number()), // questionId -> optionId
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Get quiz details
      const quiz = await db
        .select()
        .from(trainingQuizzes)
        .where(eq(trainingQuizzes.id, input.quizId))
        .limit(1);

      if (!quiz[0]) {
        throw new Error("Quiz not found");
      }

      // Get all questions for this quiz
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, input.quizId));

      // Check answers
      let correctCount = 0;
      for (const question of questions) {
        const selectedOptionId = input.answers[question.id];
        if (selectedOptionId) {
          const option = await db
            .select()
            .from(quizOptions)
            .where(eq(quizOptions.id, selectedOptionId))
            .limit(1);

          if (option[0]?.isCorrect === 1) {
            correctCount++;
          }
        }
      }

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= (quiz[0].passingScore || 70);

      // Save attempt
      await db.insert(quizAttempts).values({
        quizId: input.quizId,
        userId: ctx.user.id,
        score,
        totalQuestions: questions.length,
        passed: passed ? 1 : 0,
      });

      return {
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        passed,
        passingScore: quiz[0].passingScore || 70,
      };
    }),

  // Get user's quiz attempts
  getMyAttempts: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select({
          id: quizAttempts.id,
          quizId: quizAttempts.quizId,
          quizTitle: trainingQuizzes.title,
          quizTitleAr: trainingQuizzes.titleAr,
          score: quizAttempts.score,
          totalQuestions: quizAttempts.totalQuestions,
          passed: quizAttempts.passed,
          completedAt: quizAttempts.completedAt,
        })
        .from(quizAttempts)
        .leftJoin(trainingQuizzes, eq(quizAttempts.quizId, trainingQuizzes.id))
        .where(eq(quizAttempts.userId, ctx.user.id))
        .orderBy(desc(quizAttempts.completedAt));
    }),

  // Admin: Create training material
  createMaterial: adminProcedure
    .input(z.object({
      title: z.string(),
      titleAr: z.string().optional(),
      content: z.string(),
      contentAr: z.string().optional(),
      category: z.enum(["guidelines", "common_mistakes", "best_practices", "examples"]),
      orderIndex: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [material] = await db.insert(trainingMaterials).values(input);
      return { success: true, id: material.insertId };
    }),

  // Admin: Create quiz with questions
  createQuiz: adminProcedure
    .input(z.object({
      title: z.string(),
      titleAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      passingScore: z.number().default(70),
      questions: z.array(z.object({
        question: z.string(),
        questionAr: z.string().optional(),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
        explanationAr: z.string().optional(),
        options: z.array(z.object({
          optionText: z.string(),
          optionTextAr: z.string().optional(),
          isCorrect: z.number().int().min(0).max(1),
        })),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Create quiz
      const [quiz] = await db.insert(trainingQuizzes).values({
        title: input.title,
        titleAr: input.titleAr,
        description: input.description,
        descriptionAr: input.descriptionAr,
        passingScore: input.passingScore,
      });

      const quizId = quiz.insertId;

      // Create questions and options
      for (let i = 0; i < input.questions.length; i++) {
        const q = input.questions[i];
        const [question] = await db.insert(quizQuestions).values({
          quizId,
          question: q.question,
          questionAr: q.questionAr,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          explanationAr: q.explanationAr,
          orderIndex: i,
        });

        const questionId = question.insertId;

        // Create options
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await db.insert(quizOptions).values({
            questionId,
            optionText: opt.optionText,
            optionTextAr: opt.optionTextAr,
            isCorrect: opt.isCorrect ? 1 : 0,
            orderIndex: j,
          });
        }
      }

      return { success: true, quizId };
    }),
});
