import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import ExcelJS from "exceljs";
import { appRouter } from "../routers";

export const analyticsExportRouter = router({
  // Export all quality metrics to Excel
  exportQualityReport: adminProcedure.query(async () => {
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SmartPro Platform";
    workbook.created = new Date();

    // Create caller to access other procedures
    const caller = appRouter.createCaller({ 
      req: {} as any, 
      res: {} as any, 
      user: null,
      language: "en" as const,
    });

    // Sheet 1: Overview Metrics
    const overviewSheet = workbook.addWorksheet("Overview");
    const metrics = await caller.translationQuality.getQualityMetrics();
    
    const accuracyScore = Math.round(
      ((metrics.offices.completionRate + metrics.templates.completionRate) / 2)
    );
    const revisionRate = 15; // Placeholder
    const memoryUsageRate = 25; // Placeholder

    overviewSheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    overviewSheet.addRows([
      {
        metric: "Office Translation Completion",
        value: `${metrics.offices.completionRate}%`,
        status: metrics.offices.completionRate >= 80 ? "Good" : "Needs Improvement",
      },
      {
        metric: "Template Translation Completion",
        value: `${metrics.templates.completionRate}%`,
        status: metrics.templates.completionRate >= 80 ? "Good" : "Needs Improvement",
      },
      {
        metric: "Overall Completion Rate",
        value: `${accuracyScore}%`,
        status: accuracyScore >= 80 ? "Good" : "Needs Improvement",
      },
    ]);

    // Style header row
    overviewSheet.getRow(1).font = { bold: true };
    overviewSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    overviewSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Sheet 2: Translator Performance
    const performanceSheet = workbook.addWorksheet("Translator Performance");
    const performance = await caller.translationQuality.getTranslatorPerformance({ limit: 100 });

    performanceSheet.columns = [
      { header: "Translator ID", key: "translatorId", width: 15 },
      { header: "Translator Name", key: "translatorName", width: 25 },
      { header: "Total Translations", key: "totalTranslations", width: 20 },
      { header: "Performance Score", key: "score", width: 20 },
      { header: "Rating", key: "rating", width: 15 },
    ];

    performanceSheet.addRows(
      performance.map((p: any) => ({
        ...p,
        rating:
          p.score >= 80 ? "Excellent" : p.score >= 60 ? "Good" : "Needs Training",
      }))
    );

    // Style header
    performanceSheet.getRow(1).font = { bold: true };
    performanceSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    performanceSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Sheet 3: Accuracy Trends
    const trendsSheet = workbook.addWorksheet("Accuracy Trends");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const trends = await caller.translationQuality.getAccuracyTrends({
      startDate,
      endDate,
      groupBy: "day",
    });

    trendsSheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Accuracy Score", key: "accuracyScore", width: 20 },
      { header: "Translations Count", key: "count", width: 20 },
    ];

    trendsSheet.addRows(trends);

    // Style header
    trendsSheet.getRow(1).font = { bold: true };
    trendsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    trendsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Sheet 4: Memory Phrases
    const memorySheet = workbook.addWorksheet("Memory Phrases");
    const memoryPhrases = await caller.translationQuality.getMostUsedPhrases({ limit: 100 });

    memorySheet.columns = [
      { header: "Source Text (English)", key: "sourceText", width: 40 },
      { header: "Translated Text (Arabic)", key: "translatedText", width: 40 },
      { header: "Usage Count", key: "usageCount", width: 15 },
      { header: "Context", key: "context", width: 20 },
    ];

    memorySheet.addRows(memoryPhrases);

    // Style header
    memorySheet.getRow(1).font = { bold: true };
    memorySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    memorySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as base64
    return {
      success: true,
      data: Buffer.from(buffer).toString("base64"),
      filename: `translation-quality-report-${new Date().toISOString().split("T")[0]}.xlsx`,
    };
  }),
});
