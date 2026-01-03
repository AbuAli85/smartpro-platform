import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as XLSX from "xlsx";

export const exportRouter = router({
  // Export conversations to CSV
  exportConversationsCSV: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      staffUserId: z.number().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["active", "closed", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const conversations = await db.getConversationsForExport(input);
      
      // Format data for CSV
      const csvData = conversations.map((conv: any) => ({
        "Conversation ID": conv.id,
        "Customer Name": conv.customerName || "N/A",
        "Customer Email": conv.customerEmail || "N/A",
        "Status": conv.status,
        "Tags": conv.tags ? conv.tags.join(", ") : "",
        "Assigned To": conv.assignedStaffName || "Unassigned",
        "Created At": new Date(conv.createdAt).toLocaleString(),
        "Last Message": conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : "N/A",
        "Message Count": conv.messageCount,
        "Resolution Time (hours)": conv.resolutionTimeHours || "N/A",
      }));
      
      // Generate CSV using xlsx
      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Conversations");
      
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      
      return {
        success: true,
        data: csvContent,
        filename: `conversations_export_${new Date().toISOString().split('T')[0]}.csv`,
      };
    }),
  
  // Export conversations to Excel
  exportConversationsExcel: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      staffUserId: z.number().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["active", "closed", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const conversations = await db.getConversationsForExport(input);
      
      // Format data for Excel
      const excelData = conversations.map((conv: any) => ({
        "Conversation ID": conv.id,
        "Customer Name": conv.customerName || "N/A",
        "Customer Email": conv.customerEmail || "N/A",
        "Status": conv.status,
        "Tags": conv.tags ? conv.tags.join(", ") : "",
        "Assigned To": conv.assignedStaffName || "Unassigned",
        "Created At": new Date(conv.createdAt).toLocaleString(),
        "Last Message": conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : "N/A",
        "Message Count": conv.messageCount,
        "Resolution Time (hours)": conv.resolutionTimeHours || "N/A",
      }));
      
      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Conversations");
      
      // Convert to base64 for transmission
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      const base64 = excelBuffer.toString("base64");
      
      return {
        success: true,
        data: base64,
        filename: `conversations_export_${new Date().toISOString().split('T')[0]}.xlsx`,
      };
    }),
});
