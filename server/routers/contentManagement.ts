import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import * as db from '../db';

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({ ctx });
});

export const contentManagementRouter = router({
  // ============================================================================
  // SUCCESS STORIES
  // ============================================================================
  
  getSuccessStories: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      featured: z.number().optional(),
      governorate: z.string().optional(),
      industry: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllSuccessStories(input);
    }),

  getSuccessStoryById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const story = await db.getSuccessStoryById(input.id);
      if (!story) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Success story not found',
        });
      }
      return story;
    }),

  createSuccessStory: adminProcedure
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
      awardsReceived: z.array(z.string()).optional(),
      ownerPhotoUrl: z.string().optional(),
      businessPhotoUrl: z.string().optional(),
      additionalPhotos: z.array(z.string()).optional(),
      videoUrl: z.string().optional(),
      smartproServicesUsed: z.array(z.string()).optional(),
      smartproImpact: z.string().optional(),
      smartproImpactAr: z.string().optional(),
      featured: z.number().optional(),
      displayOrder: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      publishedAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = {
        ...input,
        awardsReceived: input.awardsReceived ? JSON.stringify(input.awardsReceived) : null,
        additionalPhotos: input.additionalPhotos ? JSON.stringify(input.additionalPhotos) : null,
        smartproServicesUsed: input.smartproServicesUsed ? JSON.stringify(input.smartproServicesUsed) : null,
        createdBy: ctx.user.id,
      };
      return await db.createSuccessStory(data);
    }),

  updateSuccessStory: adminProcedure
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
      officeId: z.number().optional(),
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
      awardsReceived: z.array(z.string()).optional(),
      ownerPhotoUrl: z.string().optional(),
      businessPhotoUrl: z.string().optional(),
      additionalPhotos: z.array(z.string()).optional(),
      videoUrl: z.string().optional(),
      smartproServicesUsed: z.array(z.string()).optional(),
      smartproImpact: z.string().optional(),
      smartproImpactAr: z.string().optional(),
      featured: z.number().optional(),
      displayOrder: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      publishedAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const data: any = { ...updates };
      
      if (updates.awardsReceived) {
        data.awardsReceived = JSON.stringify(updates.awardsReceived);
      }
      if (updates.additionalPhotos) {
        data.additionalPhotos = JSON.stringify(updates.additionalPhotos);
      }
      if (updates.smartproServicesUsed) {
        data.smartproServicesUsed = JSON.stringify(updates.smartproServicesUsed);
      }
      
      await db.updateSuccessStory(id, data);
      return { success: true };
    }),

  deleteSuccessStory: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteSuccessStory(input.id);
      return { success: true };
    }),

  // ============================================================================
  // REGULATIONS
  // ============================================================================
  
  getRegulations: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      category: z.string().optional(),
      featured: z.number().optional(),
      priority: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllRegulations(input);
    }),

  getRegulationById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const regulation = await db.getRegulationById(input.id);
      if (!regulation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Regulation not found',
        });
      }
      return regulation;
    }),

  createRegulation: adminProcedure
    .input(z.object({
      title: z.string(),
      titleAr: z.string().optional(),
      slug: z.string(),
      category: z.string(),
      subcategory: z.string().optional(),
      applicableIndustries: z.array(z.string()).optional(),
      applicableBusinessTypes: z.array(z.string()).optional(),
      summary: z.string(),
      summaryAr: z.string().optional(),
      description: z.string(),
      descriptionAr: z.string().optional(),
      requirements: z.any().optional(),
      requirementsAr: z.any().optional(),
      issuingAuthority: z.string(),
      issuingAuthorityAr: z.string().optional(),
      authorityWebsite: z.string().optional(),
      authorityContact: z.any().optional(),
      complianceSteps: z.any().optional(),
      complianceStepsAr: z.any().optional(),
      requiredDocuments: z.array(z.string()).optional(),
      requiredDocumentsAr: z.array(z.string()).optional(),
      estimatedCost: z.string().optional(),
      estimatedDuration: z.string().optional(),
      renewalRequired: z.number().optional(),
      renewalPeriod: z.string().optional(),
      downloadableGuideUrl: z.string().optional(),
      downloadableGuideUrlAr: z.string().optional(),
      relatedForms: z.any().optional(),
      externalLinks: z.any().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      featured: z.number().optional(),
      displayOrder: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      publishedAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = {
        ...input,
        applicableIndustries: input.applicableIndustries ? JSON.stringify(input.applicableIndustries) : null,
        applicableBusinessTypes: input.applicableBusinessTypes ? JSON.stringify(input.applicableBusinessTypes) : null,
        requirements: input.requirements ? JSON.stringify(input.requirements) : null,
        requirementsAr: input.requirementsAr ? JSON.stringify(input.requirementsAr) : null,
        authorityContact: input.authorityContact ? JSON.stringify(input.authorityContact) : null,
        complianceSteps: input.complianceSteps ? JSON.stringify(input.complianceSteps) : null,
        complianceStepsAr: input.complianceStepsAr ? JSON.stringify(input.complianceStepsAr) : null,
        requiredDocuments: input.requiredDocuments ? JSON.stringify(input.requiredDocuments) : null,
        requiredDocumentsAr: input.requiredDocumentsAr ? JSON.stringify(input.requiredDocumentsAr) : null,
        relatedForms: input.relatedForms ? JSON.stringify(input.relatedForms) : null,
        externalLinks: input.externalLinks ? JSON.stringify(input.externalLinks) : null,
        createdBy: ctx.user.id,
      };
      return await db.createRegulation(data);
    }),

  updateRegulation: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleAr: z.string().optional(),
      slug: z.string().optional(),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      applicableIndustries: z.array(z.string()).optional(),
      applicableBusinessTypes: z.array(z.string()).optional(),
      summary: z.string().optional(),
      summaryAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      requirements: z.any().optional(),
      requirementsAr: z.any().optional(),
      issuingAuthority: z.string().optional(),
      issuingAuthorityAr: z.string().optional(),
      authorityWebsite: z.string().optional(),
      authorityContact: z.any().optional(),
      complianceSteps: z.any().optional(),
      complianceStepsAr: z.any().optional(),
      requiredDocuments: z.array(z.string()).optional(),
      requiredDocumentsAr: z.array(z.string()).optional(),
      estimatedCost: z.string().optional(),
      estimatedDuration: z.string().optional(),
      renewalRequired: z.number().optional(),
      renewalPeriod: z.string().optional(),
      downloadableGuideUrl: z.string().optional(),
      downloadableGuideUrlAr: z.string().optional(),
      relatedForms: z.any().optional(),
      externalLinks: z.any().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      featured: z.number().optional(),
      displayOrder: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      publishedAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const data: any = { ...updates };
      
      if (updates.applicableIndustries) {
        data.applicableIndustries = JSON.stringify(updates.applicableIndustries);
      }
      if (updates.applicableBusinessTypes) {
        data.applicableBusinessTypes = JSON.stringify(updates.applicableBusinessTypes);
      }
      if (updates.requirements) {
        data.requirements = JSON.stringify(updates.requirements);
      }
      if (updates.requirementsAr) {
        data.requirementsAr = JSON.stringify(updates.requirementsAr);
      }
      if (updates.authorityContact) {
        data.authorityContact = JSON.stringify(updates.authorityContact);
      }
      if (updates.complianceSteps) {
        data.complianceSteps = JSON.stringify(updates.complianceSteps);
      }
      if (updates.complianceStepsAr) {
        data.complianceStepsAr = JSON.stringify(updates.complianceStepsAr);
      }
      if (updates.requiredDocuments) {
        data.requiredDocuments = JSON.stringify(updates.requiredDocuments);
      }
      if (updates.requiredDocumentsAr) {
        data.requiredDocumentsAr = JSON.stringify(updates.requiredDocumentsAr);
      }
      if (updates.relatedForms) {
        data.relatedForms = JSON.stringify(updates.relatedForms);
      }
      if (updates.externalLinks) {
        data.externalLinks = JSON.stringify(updates.externalLinks);
      }
      
      await db.updateRegulation(id, data);
      return { success: true };
    }),

  deleteRegulation: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteRegulation(input.id);
      return { success: true };
    }),

  // ============================================================================
  // GOVERNORATES
  // ============================================================================
  
  getGovernorates: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      region: z.string().optional(),
      featured: z.number().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllGovernorates(input);
    }),

  getGovernorateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const governorate = await db.getGovernorateById(input.id);
      if (!governorate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Governorate not found',
        });
      }
      return governorate;
    }),

  createGovernorate: adminProcedure
    .input(z.object({
      name: z.string(),
      nameAr: z.string(),
      slug: z.string(),
      region: z.enum(['coastal', 'interior', 'south', 'musandam']),
      capitalCity: z.string().optional(),
      capitalCityAr: z.string().optional(),
      area: z.number().optional(),
      coordinates: z.any().optional(),
      population: z.number().optional(),
      populationYear: z.number().optional(),
      majorCities: z.any().optional(),
      wilayats: z.any().optional(),
      keyIndustries: z.array(z.string()).optional(),
      keyIndustriesAr: z.array(z.string()).optional(),
      economicSectors: z.any().optional(),
      totalBusinesses: z.number().optional(),
      smeCount: z.number().optional(),
      overview: z.string().optional(),
      overviewAr: z.string().optional(),
      economicProfile: z.string().optional(),
      economicProfileAr: z.string().optional(),
      historicalSignificance: z.string().optional(),
      historicalSignificanceAr: z.string().optional(),
      touristAttractions: z.any().optional(),
      touristAttractionsAr: z.any().optional(),
      businessOpportunities: z.array(z.string()).optional(),
      businessOpportunitiesAr: z.array(z.string()).optional(),
      investmentZones: z.any().optional(),
      investmentZonesAr: z.any().optional(),
      registeredOfficesCount: z.number().optional(),
      topServiceCategories: z.array(z.string()).optional(),
      averageServicePrice: z.number().optional(),
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
      featured: z.number().optional(),
      displayOrder: z.number().optional(),
      status: z.enum(['draft', 'active', 'inactive']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = {
        ...input,
        coordinates: input.coordinates ? JSON.stringify(input.coordinates) : null,
        majorCities: input.majorCities ? JSON.stringify(input.majorCities) : null,
        wilayats: input.wilayats ? JSON.stringify(input.wilayats) : null,
        keyIndustries: input.keyIndustries ? JSON.stringify(input.keyIndustries) : null,
        keyIndustriesAr: input.keyIndustriesAr ? JSON.stringify(input.keyIndustriesAr) : null,
        economicSectors: input.economicSectors ? JSON.stringify(input.economicSectors) : null,
        touristAttractions: input.touristAttractions ? JSON.stringify(input.touristAttractions) : null,
        touristAttractionsAr: input.touristAttractionsAr ? JSON.stringify(input.touristAttractionsAr) : null,
        businessOpportunities: input.businessOpportunities ? JSON.stringify(input.businessOpportunities) : null,
        businessOpportunitiesAr: input.businessOpportunitiesAr ? JSON.stringify(input.businessOpportunitiesAr) : null,
        investmentZones: input.investmentZones ? JSON.stringify(input.investmentZones) : null,
        investmentZonesAr: input.investmentZonesAr ? JSON.stringify(input.investmentZonesAr) : null,
        topServiceCategories: input.topServiceCategories ? JSON.stringify(input.topServiceCategories) : null,
        galleryImages: input.galleryImages ? JSON.stringify(input.galleryImages) : null,
        keywords: input.keywords ? JSON.stringify(input.keywords) : null,
        createdBy: ctx.user.id,
      };
      return await db.createGovernorate(data);
    }),

  updateGovernorate: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      slug: z.string().optional(),
      region: z.enum(['coastal', 'interior', 'south', 'musandam']).optional(),
      capitalCity: z.string().optional(),
      capitalCityAr: z.string().optional(),
      area: z.number().optional(),
      coordinates: z.any().optional(),
      population: z.number().optional(),
      populationYear: z.number().optional(),
      majorCities: z.any().optional(),
      wilayats: z.any().optional(),
      keyIndustries: z.array(z.string()).optional(),
      keyIndustriesAr: z.array(z.string()).optional(),
      economicSectors: z.any().optional(),
      totalBusinesses: z.number().optional(),
      smeCount: z.number().optional(),
      overview: z.string().optional(),
      overviewAr: z.string().optional(),
      economicProfile: z.string().optional(),
      economicProfileAr: z.string().optional(),
      historicalSignificance: z.string().optional(),
      historicalSignificanceAr: z.string().optional(),
      touristAttractions: z.any().optional(),
      touristAttractionsAr: z.any().optional(),
      businessOpportunities: z.array(z.string()).optional(),
      businessOpportunitiesAr: z.array(z.string()).optional(),
      investmentZones: z.any().optional(),
      investmentZonesAr: z.any().optional(),
      registeredOfficesCount: z.number().optional(),
      topServiceCategories: z.array(z.string()).optional(),
      averageServicePrice: z.number().optional(),
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
      featured: z.number().optional(),
      displayOrder: z.number().optional(),
      status: z.enum(['draft', 'active', 'inactive']).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const data: any = { ...updates };
      
      if (updates.coordinates) {
        data.coordinates = JSON.stringify(updates.coordinates);
      }
      if (updates.majorCities) {
        data.majorCities = JSON.stringify(updates.majorCities);
      }
      if (updates.wilayats) {
        data.wilayats = JSON.stringify(updates.wilayats);
      }
      if (updates.keyIndustries) {
        data.keyIndustries = JSON.stringify(updates.keyIndustries);
      }
      if (updates.keyIndustriesAr) {
        data.keyIndustriesAr = JSON.stringify(updates.keyIndustriesAr);
      }
      if (updates.economicSectors) {
        data.economicSectors = JSON.stringify(updates.economicSectors);
      }
      if (updates.touristAttractions) {
        data.touristAttractions = JSON.stringify(updates.touristAttractions);
      }
      if (updates.touristAttractionsAr) {
        data.touristAttractionsAr = JSON.stringify(updates.touristAttractionsAr);
      }
      if (updates.businessOpportunities) {
        data.businessOpportunities = JSON.stringify(updates.businessOpportunities);
      }
      if (updates.businessOpportunitiesAr) {
        data.businessOpportunitiesAr = JSON.stringify(updates.businessOpportunitiesAr);
      }
      if (updates.investmentZones) {
        data.investmentZones = JSON.stringify(updates.investmentZones);
      }
      if (updates.investmentZonesAr) {
        data.investmentZonesAr = JSON.stringify(updates.investmentZonesAr);
      }
      if (updates.topServiceCategories) {
        data.topServiceCategories = JSON.stringify(updates.topServiceCategories);
      }
      if (updates.galleryImages) {
        data.galleryImages = JSON.stringify(updates.galleryImages);
      }
      if (updates.keywords) {
        data.keywords = JSON.stringify(updates.keywords);
      }
      
      await db.updateGovernorate(id, data);
      return { success: true };
    }),

  deleteGovernorate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteGovernorate(input.id);
      return { success: true };
    }),
});
