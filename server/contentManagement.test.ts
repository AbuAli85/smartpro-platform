import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Mock admin user context
const createAdminContext = (): Context => ({
  user: {
    id: 1,
    openId: 'test-admin',
    name: 'Test Admin',
    email: 'admin@test.com',
    phone: null,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    languagePreference: 'en',
  },
  req: {} as any,
  res: {} as any,
});

// Mock regular user context
const createUserContext = (): Context => ({
  user: {
    id: 2,
    openId: 'test-user',
    name: 'Test User',
    email: 'user@test.com',
    phone: null,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    languagePreference: 'en',
  },
  req: {} as any,
  res: {} as any,
});

describe('Content Management - Success Stories', () => {
  let createdStoryId: number;

  it('should allow admin to create a success story', async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.contentManagement.createSuccessStory({
      businessName: 'Test Business',
      ownerName: 'Test Owner',
      governorate: 'Muscat',
      industry: 'Technology',
      challenge: 'Test challenge',
      solution: 'Test solution',
      results: 'Test results',
      status: 'published',
    });

    expect(result).toBeDefined();
    // Store the ID for cleanup
    createdStoryId = (result as any).insertId || 1;
  });

  it('should allow anyone to list success stories', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const stories = await caller.contentManagement.getSuccessStories({});

    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBeGreaterThan(0);
  });

  it('should allow anyone to get a success story by ID', async () => {
    const caller = appRouter.createCaller(createUserContext());

    // Get the first story from the list
    const stories = await caller.contentManagement.getSuccessStories({ limit: 1 });
    if (stories.length > 0) {
      const story = await caller.contentManagement.getSuccessStoryById({ id: stories[0].id });
      expect(story).toBeDefined();
      expect(story?.businessName).toBeDefined();
    }
  });

  it('should prevent non-admin from creating success stories', async () => {
    const caller = appRouter.createCaller(createUserContext());

    await expect(
      caller.contentManagement.createSuccessStory({
        businessName: 'Test Business',
        ownerName: 'Test Owner',
        governorate: 'Muscat',
        industry: 'Technology',
        challenge: 'Test challenge',
        solution: 'Test solution',
        results: 'Test results',
        status: 'published',
      })
    ).rejects.toThrow();
  });
});

describe('Content Management - Regulations', () => {
  it('should allow admin to create a regulation', async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.contentManagement.createRegulation({
      title: 'Test Regulation',
      slug: 'test-regulation',
      category: 'business_registration',
      summary: 'Test summary',
      description: 'Test description',
      issuingAuthority: 'Test Authority',
      requirements: { basic: ['Test requirement 1', 'Test requirement 2'] },
      status: 'published',
    });

    expect(result).toBeDefined();
  });

  it('should allow anyone to list regulations', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const regulations = await caller.contentManagement.getRegulations({});

    expect(Array.isArray(regulations)).toBe(true);
    expect(regulations.length).toBeGreaterThan(0);
  });

  it('should allow anyone to get a regulation by ID', async () => {
    const caller = appRouter.createCaller(createUserContext());

    // Get the first regulation from the list
    const regulations = await caller.contentManagement.getRegulations({ limit: 1 });
    if (regulations.length > 0) {
      const regulation = await caller.contentManagement.getRegulationById({ id: regulations[0].id });
      expect(regulation).toBeDefined();
      expect(regulation?.title).toBeDefined();
    }
  });

  it('should filter regulations by category', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const regulations = await caller.contentManagement.getRegulations({
      category: 'business_registration',
    });

    expect(Array.isArray(regulations)).toBe(true);
    regulations.forEach((reg: any) => {
      expect(reg.category).toBe('business_registration');
    });
  });

  it('should prevent non-admin from creating regulations', async () => {
    const caller = appRouter.createCaller(createUserContext());

    await expect(
      caller.contentManagement.createRegulation({
        title: 'Test Regulation',
        slug: 'test-regulation',
        category: 'business_registration',
        summary: 'Test summary',
        description: 'Test description',
        issuingAuthority: 'Test Authority',
        requirements: { basic: ['Test requirement 1', 'Test requirement 2'] },
        status: 'published',
      })
    ).rejects.toThrow();
  });
});

describe('Content Management - Governorates', () => {
  it('should allow admin to create a governorate', async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.contentManagement.createGovernorate({
      name: 'Test Governorate',
      nameAr: 'محافظة الاختبار',
      slug: 'test-governorate',
      region: 'coastal',
      overview: 'Test governorate overview',
      overviewAr: 'نظرة عامة على المحافظة',
      status: 'active',
    });

    expect(result).toBeDefined();
  });

  it('should allow anyone to list governorates', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const governorates = await caller.contentManagement.getGovernorates({});

    expect(Array.isArray(governorates)).toBe(true);
    expect(governorates.length).toBeGreaterThan(0);
  });

  it('should allow anyone to get a governorate by ID', async () => {
    const caller = appRouter.createCaller(createUserContext());

    // Get the first governorate from the list
    const governorates = await caller.contentManagement.getGovernorates({ limit: 1 });
    if (governorates.length > 0) {
      const governorate = await caller.contentManagement.getGovernorateById({ id: governorates[0].id });
      expect(governorate).toBeDefined();
      expect(governorate?.name).toBeDefined();
    }
  });

  it('should filter governorates by region', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const governorates = await caller.contentManagement.getGovernorates({
      region: 'coastal',
    });

    expect(Array.isArray(governorates)).toBe(true);
    governorates.forEach((gov: any) => {
      expect(gov.region).toBe('coastal');
    });
  });

  it('should prevent non-admin from creating governorates', async () => {
    const caller = appRouter.createCaller(createUserContext());

    await expect(
      caller.contentManagement.createGovernorate({
        name: 'Test Governorate',
        nameAr: 'محافظة الاختبار',
        slug: 'test-governorate',
        region: 'coastal',
        overview: 'Test governorate overview',
        overviewAr: 'نظرة عامة على المحافظة',
        status: 'active',
      })
    ).rejects.toThrow();
  });
});

describe('Content Management - Search and Filters', () => {
  it('should search success stories by business name', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const stories = await caller.contentManagement.getSuccessStories({
      search: 'Coffee',
    });

    expect(Array.isArray(stories)).toBe(true);
    // Should find the Omani Coffee House story from seed data
    const hasMatch = stories.some((story: any) => 
      story.businessName.toLowerCase().includes('coffee')
    );
    expect(hasMatch).toBe(true);
  });

  it('should filter regulations by priority', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const regulations = await caller.contentManagement.getRegulations({
      priority: 'high',
    });

    expect(Array.isArray(regulations)).toBe(true);
    regulations.forEach((reg: any) => {
      expect(reg.priority).toBe('high');
    });
  });

  it('should filter success stories by governorate', async () => {
    const caller = appRouter.createCaller(createUserContext());

    const stories = await caller.contentManagement.getSuccessStories({
      governorate: 'Muscat',
    });

    expect(Array.isArray(stories)).toBe(true);
    stories.forEach((story: any) => {
      expect(story.governorate).toBe('Muscat');
    });
  });
});
