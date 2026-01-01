import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbClients from "../db-clients";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

export const clientManagementRouter = router({
  // Create a new client
  createClient: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      userId: z.number().optional(),
      name: z.string().min(1).max(255),
      email: z.string().email().optional(),
      phone: z.string().max(20).optional(),
      address: z.string().optional(),
      city: z.string().max(100).optional(),
      region: z.string().max(100).optional(),
      dateOfBirth: z.string().optional(),
      nationalId: z.string().max(50).optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      const clientId = await dbClients.createClient(input);
      return { clientId, message: "Client created successfully" };
    }),

  // Get all clients for an office
  getClientsByOffice: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      search: z.string().optional(),
      status: z.enum(['active', 'inactive', 'blocked']).optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await dbClients.getClientsByOffice(input.officeId, {
        search: input.search,
        status: input.status,
        tags: input.tags,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  // Get client by ID with full details
  getClientDetails: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      // Get additional data
      const [documents, notes, history] = await Promise.all([
        dbClients.getClientDocuments(input.clientId),
        dbClients.getClientNotes(input.clientId),
        dbClients.getClientHistory(input.clientId),
      ]);

      return {
        ...client,
        documents,
        notes,
        history,
      };
    }),

  // Update client information
  updateClient: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1).max(255).optional(),
      email: z.string().email().optional(),
      phone: z.string().max(20).optional(),
      address: z.string().optional(),
      city: z.string().max(100).optional(),
      region: z.string().max(100).optional(),
      dateOfBirth: z.string().optional(),
      nationalId: z.string().max(50).optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['active', 'inactive', 'blocked']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      const { clientId, ...updateData } = input;
      await dbClients.updateClient(clientId, updateData);

      return { success: true, message: "Client updated successfully" };
    }),

  // Delete client
  deleteClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      await dbClients.deleteClient(input.clientId);

      return { success: true, message: "Client deleted successfully" };
    }),

  // Add client document
  addClientDocument: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      documentType: z.string().min(1).max(100),
      documentName: z.string().min(1).max(255),
      documentUrl: z.string().url(),
      fileSize: z.number().optional(),
      mimeType: z.string().max(100).optional(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      const documentId = await dbClients.addClientDocument({
        ...input,
        officeId: client.officeId,
        uploadedBy: ctx.user.id,
      });

      return { documentId, message: "Document added successfully" };
    }),

  // Get client documents
  getClientDocuments: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      return await dbClients.getClientDocuments(input.clientId);
    }),

  // Delete client document
  deleteClientDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Verify document ownership through client -> office
      await dbClients.deleteClientDocument(input.documentId);
      return { success: true, message: "Document deleted successfully" };
    }),

  // Add client note
  addClientNote: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      note: z.string().min(1),
      isImportant: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      const noteId = await dbClients.addClientNote({
        clientId: input.clientId,
        officeId: client.officeId,
        note: input.note,
        createdBy: ctx.user.id,
        createdByName: ctx.user.name || "Unknown",
        isImportant: input.isImportant,
      });

      return { noteId, message: "Note added successfully" };
    }),

  // Get client notes
  getClientNotes: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      const client = await dbClients.getClientById(input.clientId);
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === client.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this client",
        });
      }

      return await dbClients.getClientNotes(input.clientId);
    }),

  // Update client note
  updateClientNote: protectedProcedure
    .input(z.object({
      noteId: z.number(),
      note: z.string().min(1).optional(),
      isImportant: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { noteId, ...updateData } = input;
      await dbClients.updateClientNote(noteId, updateData);
      return { success: true, message: "Note updated successfully" };
    }),

  // Delete client note
  deleteClientNote: protectedProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await dbClients.deleteClientNote(input.noteId);
      return { success: true, message: "Note deleted successfully" };
    }),

  // Search clients
  searchClients: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      searchTerm: z.string().min(1),
    }))
    .query(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await dbClients.searchClients(input.officeId, input.searchTerm);
    }),

  // Get client statistics
  getClientStats: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await dbClients.getClientStats(input.officeId);
    }),

  // Get top clients by spending
  getTopClients: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await dbClients.getTopClients(input.officeId, input.limit);
    }),

  // Get recent clients
  getRecentClients: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await dbClients.getRecentClients(input.officeId, input.limit);
    }),

  // Get expiring documents
  getExpiringDocuments: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      daysAhead: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ input, ctx }) => {
      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await dbClients.getExpiringDocuments(input.officeId, input.daysAhead);
    }),
});
