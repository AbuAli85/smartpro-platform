/**
 * tRPC Router for Oman-specific features
 * - Success Stories
 * - Regulations & Compliance
 * - Governorates
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as dbOman from "../db-oman";
import { TRPCError } from "@trpc/server";

export const omanRouter = router({
  // ============================================
  // SUCCESS STORIES
  // ============================================
  
  successStories: router({
    list: publicProcedure
      .input(z.object({
        governorate: z.string().optional(),
        industry: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return await dbOman.getAllSuccessStories(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const story = await dbOman.getSuccessStoryById(input.id);
        if (!story) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Success story not found",
          });
        }
        return story;
      }),
    
    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(10).default(3) }))
      .query(async ({ input }) => {
        return await dbOman.getFeaturedSuccessStories(input.limit);
      }),
    
    getByGovernorate: publicProcedure
      .input(z.object({ governorate: z.string() }))
      .query(async ({ input }) => {
        return await dbOman.getSuccessStoriesByGovernorate(input.governorate);
      }),
    
    create: protectedProcedure
      .input(z.object({
        businessName: z.string(),
        businessNameAr: z.string().optional(),
        ownerName: z.string(),
        ownerNameAr: z.string().optional(),
        governorate: z.string(),
        wilayat: z.string().optional(),
        industry: z.string(),
        serviceType: z.string().optional(),
        yearEstablished: z.number().optional(),
        officeId: z.number().optional(),
        challenge: z.string(),
        challengeAr: z.string().optional(),
        solution: z.string(),
        solutionAr: z.string().optional(),
        results: z.string(),
        resultsAr: z.string().optional(),
        testimonial: z.string().optional(),
        testimonialAr: z.string().optional(),
        jobsCreated: z.number().optional(),
        revenueGrowth: z.string().optional(),
        customersServed: z.number().optional(),
        awardsReceived: z.array(z.any()).optional(),
        ownerPhotoUrl: z.string().optional(),
        businessPhotoUrl: z.string().optional(),
        additionalPhotos: z.array(z.string()).optional(),
        videoUrl: z.string().optional(),
        smartproServicesUsed: z.array(z.string()).optional(),
        smartproImpact: z.string().optional(),
        smartproImpactAr: z.string().optional(),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create success stories",
          });
        }
        
        const data = {
          ...input,
          featured: input.featured ? 1 : 0,
          createdBy: ctx.user.id,
          publishedAt: input.status === 'published' ? new Date().toISOString() : null,
        };
        
        return await dbOman.createSuccessStory(data as any);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        businessName: z.string().optional(),
        businessNameAr: z.string().optional(),
        ownerName: z.string().optional(),
        ownerNameAr: z.string().optional(),
        governorate: z.string().optional(),
        wilayat: z.string().optional(),
        industry: z.string().optional(),
        serviceType: z.string().optional(),
        yearEstablished: z.number().optional(),
        challenge: z.string().optional(),
        challengeAr: z.string().optional(),
        solution: z.string().optional(),
        solutionAr: z.string().optional(),
        results: z.string().optional(),
        resultsAr: z.string().optional(),
        testimonial: z.string().optional(),
        testimonialAr: z.string().optional(),
        jobsCreated: z.number().optional(),
        revenueGrowth: z.string().optional(),
        customersServed: z.number().optional(),
        awardsReceived: z.array(z.any()).optional(),
        ownerPhotoUrl: z.string().optional(),
        businessPhotoUrl: z.string().optional(),
        additionalPhotos: z.array(z.string()).optional(),
        videoUrl: z.string().optional(),
        smartproServicesUsed: z.array(z.string()).optional(),
        smartproImpact: z.string().optional(),
        smartproImpactAr: z.string().optional(),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update success stories",
          });
        }
        
        const { id, ...updateData } = input;
        const data: any = { ...updateData };
        
        if (updateData.featured !== undefined) {
          data.featured = updateData.featured ? 1 : 0;
        }
        
        if (updateData.status === 'published') {
          const existing = await dbOman.getSuccessStoryById(id);
          if (existing && !existing.publishedAt) {
            data.publishedAt = new Date().toISOString();
          }
        }
        
        return await dbOman.updateSuccessStory(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete success stories",
          });
        }
        
        return await dbOman.deleteSuccessStory(input.id);
      }),
  }),
  
  // ============================================
  // REGULATIONS
  // ============================================
  
  regulations: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        priority: z.string().optional(),
        featured: z.boolean().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return await dbOman.getAllRegulations(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const regulation = await dbOman.getRegulationById(input.id);
        if (!regulation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Regulation not found",
          });
        }
        return regulation;
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const regulation = await dbOman.getRegulationBySlug(input.slug);
        if (!regulation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Regulation not found",
          });
        }
        return regulation;
      }),
    
    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
      .query(async ({ input }) => {
        return await dbOman.getFeaturedRegulations(input.limit);
      }),
    
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await dbOman.getRegulationsByCategory(input.category);
      }),
    
    getCritical: publicProcedure
      .query(async () => {
        return await dbOman.getCriticalRegulations();
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        titleAr: z.string().optional(),
        slug: z.string(),
        category: z.enum(['business_registration', 'licensing', 'tax', 'labor', 'sme_support', 'industry_specific', 'general']),
        subcategory: z.string().optional(),
        applicableIndustries: z.array(z.string()).optional(),
        applicableBusinessTypes: z.array(z.string()).optional(),
        summary: z.string(),
        summaryAr: z.string().optional(),
        description: z.string(),
        descriptionAr: z.string().optional(),
        requirements: z.array(z.any()),
        requirementsAr: z.array(z.any()).optional(),
        issuingAuthority: z.string(),
        issuingAuthorityAr: z.string().optional(),
        authorityWebsite: z.string().optional(),
        authorityContact: z.any().optional(),
        complianceSteps: z.array(z.any()).optional(),
        complianceStepsAr: z.array(z.any()).optional(),
        requiredDocuments: z.array(z.any()).optional(),
        requiredDocumentsAr: z.array(z.any()).optional(),
        estimatedCost: z.string().optional(),
        estimatedDuration: z.string().optional(),
        renewalRequired: z.boolean().optional(),
        renewalPeriod: z.string().optional(),
        downloadableGuideUrl: z.string().optional(),
        downloadableGuideUrlAr: z.string().optional(),
        relatedForms: z.array(z.any()).optional(),
        externalLinks: z.array(z.any()).optional(),
        priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create regulations",
          });
        }
        
        const data = {
          ...input,
          renewalRequired: input.renewalRequired ? 1 : 0,
          featured: input.featured ? 1 : 0,
          createdBy: ctx.user.id,
          publishedAt: input.status === 'published' ? new Date().toISOString() : null,
          lastUpdated: new Date().toISOString(),
        };
        
        return await dbOman.createRegulation(data as any);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        slug: z.string().optional(),
        category: z.enum(['business_registration', 'licensing', 'tax', 'labor', 'sme_support', 'industry_specific', 'general']).optional(),
        subcategory: z.string().optional(),
        applicableIndustries: z.array(z.string()).optional(),
        applicableBusinessTypes: z.array(z.string()).optional(),
        summary: z.string().optional(),
        summaryAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        requirements: z.array(z.any()).optional(),
        requirementsAr: z.array(z.any()).optional(),
        issuingAuthority: z.string().optional(),
        issuingAuthorityAr: z.string().optional(),
        authorityWebsite: z.string().optional(),
        authorityContact: z.any().optional(),
        complianceSteps: z.array(z.any()).optional(),
        complianceStepsAr: z.array(z.any()).optional(),
        requiredDocuments: z.array(z.any()).optional(),
        requiredDocumentsAr: z.array(z.any()).optional(),
        estimatedCost: z.string().optional(),
        estimatedDuration: z.string().optional(),
        renewalRequired: z.boolean().optional(),
        renewalPeriod: z.string().optional(),
        downloadableGuideUrl: z.string().optional(),
        downloadableGuideUrlAr: z.string().optional(),
        relatedForms: z.array(z.any()).optional(),
        externalLinks: z.array(z.any()).optional(),
        priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update regulations",
          });
        }
        
        const { id, ...updateData } = input;
        const data: any = { ...updateData, lastUpdated: new Date().toISOString() };
        
        if (updateData.renewalRequired !== undefined) {
          data.renewalRequired = updateData.renewalRequired ? 1 : 0;
        }
        if (updateData.featured !== undefined) {
          data.featured = updateData.featured ? 1 : 0;
        }
        
        if (updateData.status === 'published') {
          const existing = await dbOman.getRegulationById(id);
          if (existing && !existing.publishedAt) {
            data.publishedAt = new Date().toISOString();
          }
        }
        
        return await dbOman.updateRegulation(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete regulations",
          });
        }
        
        return await dbOman.deleteRegulation(input.id);
      }),
  }),
  
  // ============================================
  // GOVERNORATES
  // ============================================
  
  governorates: router({
    list: publicProcedure
      .input(z.object({
        region: z.string().optional(),
        featured: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await dbOman.getAllGovernorates(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const governorate = await dbOman.getGovernorateById(input.id);
        if (!governorate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Governorate not found",
          });
        }
        return governorate;
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const governorate = await dbOman.getGovernorateBySlug(input.slug);
        if (!governorate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Governorate not found",
          });
        }
        return governorate;
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        nameAr: z.string(),
        slug: z.string(),
        region: z.enum(['north', 'south', 'central', 'coastal', 'interior']),
        capitalCity: z.string().optional(),
        capitalCityAr: z.string().optional(),
        area: z.number().optional(),
        coordinates: z.any().optional(),
        population: z.number().optional(),
        populationYear: z.number().optional(),
        majorCities: z.array(z.any()).optional(),
        wilayats: z.array(z.any()).optional(),
        keyIndustries: z.array(z.any()).optional(),
        keyIndustriesAr: z.array(z.any()).optional(),
        economicSectors: z.array(z.any()).optional(),
        totalBusinesses: z.number().optional(),
        smeCount: z.number().optional(),
        overview: z.string(),
        overviewAr: z.string().optional(),
        economicProfile: z.string().optional(),
        economicProfileAr: z.string().optional(),
        historicalSignificance: z.string().optional(),
        historicalSignificanceAr: z.string().optional(),
        touristAttractions: z.array(z.any()).optional(),
        touristAttractionsAr: z.array(z.any()).optional(),
        businessOpportunities: z.array(z.any()).optional(),
        businessOpportunitiesAr: z.array(z.any()).optional(),
        investmentZones: z.array(z.any()).optional(),
        investmentZonesAr: z.array(z.any()).optional(),
        coverImageUrl: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        mapImageUrl: z.string().optional(),
        governmentOfficeAddress: z.string().optional(),
        governmentOfficeAddressAr: z.string().optional(),
        governmentOfficePhone: z.string().optional(),
        governmentOfficeEmail: z.string().optional(),
        metaTitle: z.string().optional(),
        metaTitleAr: z.string().optional(),
        metaDescription: z.string().optional(),
        metaDescriptionAr: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        status: z.enum(['active', 'inactive']).default('active'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create governorates",
          });
        }
        
        const data = {
          ...input,
          featured: input.featured ? 1 : 0,
        };
        
        return await dbOman.createGovernorate(data as any);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameAr: z.string().optional(),
        slug: z.string().optional(),
        region: z.enum(['north', 'south', 'central', 'coastal', 'interior']).optional(),
        capitalCity: z.string().optional(),
        capitalCityAr: z.string().optional(),
        area: z.number().optional(),
        coordinates: z.any().optional(),
        population: z.number().optional(),
        populationYear: z.number().optional(),
        majorCities: z.array(z.any()).optional(),
        wilayats: z.array(z.any()).optional(),
        keyIndustries: z.array(z.any()).optional(),
        keyIndustriesAr: z.array(z.any()).optional(),
        economicSectors: z.array(z.any()).optional(),
        totalBusinesses: z.number().optional(),
        smeCount: z.number().optional(),
        overview: z.string().optional(),
        overviewAr: z.string().optional(),
        economicProfile: z.string().optional(),
        economicProfileAr: z.string().optional(),
        historicalSignificance: z.string().optional(),
        historicalSignificanceAr: z.string().optional(),
        touristAttractions: z.array(z.any()).optional(),
        touristAttractionsAr: z.array(z.any()).optional(),
        businessOpportunities: z.array(z.any()).optional(),
        businessOpportunitiesAr: z.array(z.any()).optional(),
        investmentZones: z.array(z.any()).optional(),
        investmentZonesAr: z.array(z.any()).optional(),
        coverImageUrl: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        mapImageUrl: z.string().optional(),
        governmentOfficeAddress: z.string().optional(),
        governmentOfficeAddressAr: z.string().optional(),
        governmentOfficePhone: z.string().optional(),
        governmentOfficeEmail: z.string().optional(),
        metaTitle: z.string().optional(),
        metaTitleAr: z.string().optional(),
        metaDescription: z.string().optional(),
        metaDescriptionAr: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        status: z.enum(['active', 'inactive']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update governorates",
          });
        }
        
        const { id, ...updateData } = input;
        const data: any = { ...updateData };
        
        if (updateData.featured !== undefined) {
          data.featured = updateData.featured ? 1 : 0;
        }
        
        return await dbOman.updateGovernorate(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete governorates",
          });
        }
        
        return await dbOman.deleteGovernorate(input.id);
      }),
  }),
  
  // ============================================
  // USER COMPLIANCE CHECKLISTS
  // ============================================
  
  compliance: router({
    myChecklists: protectedProcedure
      .input(z.object({ officeId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        return await dbOman.getUserComplianceChecklists(ctx.user.id, input.officeId);
      }),
    
    getProgress: protectedProcedure
      .input(z.object({ regulationId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await dbOman.getUserRegulationProgress(ctx.user.id, input.regulationId);
      }),
    
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        return await dbOman.getComplianceStatsByUser(ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        regulationId: z.number(),
        officeId: z.number().optional(),
        status: z.enum(['not_started', 'in_progress', 'completed', 'not_applicable']).default('not_started'),
        notes: z.string().optional(),
        dueDate: z.coerce.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const data = {
          ...input,
          userId: ctx.user.id,
          dueDate: input.dueDate?.toISOString(),
        };
        
        return await dbOman.createUserComplianceChecklist(data as any);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['not_started', 'in_progress', 'completed', 'not_applicable']).optional(),
        completedSteps: z.array(z.any()).optional(),
        notes: z.string().optional(),
        documentsUploaded: z.array(z.string()).optional(),
        dueDate: z.coerce.date().optional(),
        reminderDate: z.coerce.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const data: any = { ...updateData };
        
        if (updateData.dueDate) {
          data.dueDate = updateData.dueDate.toISOString();
        }
        if (updateData.reminderDate) {
          data.reminderDate = updateData.reminderDate.toISOString();
        }
        
        // Set timestamps based on status
        if (updateData.status === 'in_progress' && !data.startedAt) {
          data.startedAt = new Date().toISOString();
        }
        if (updateData.status === 'completed') {
          data.completedAt = new Date().toISOString();
        }
        
        return await dbOman.updateUserComplianceChecklist(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await dbOman.deleteUserComplianceChecklist(input.id);
      }),
  }),
});
