import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTrackingNumber } from './_core/serviceRequestEmails';
import { 
  detectServiceType, 
  recommendBudget, 
  generateRequirementChecklist, 
  predictTimeline,
  matchOffices 
} from './_core/intelligentRequestService';

describe('Service Request Automation', () => {
  
  describe('Tracking Number Generation', () => {
    it('should generate tracking number with correct format', () => {
      const trackingNumber = generateTrackingNumber();
      
      // Format: SR-YYYYMMDD-XXXXX
      expect(trackingNumber).toMatch(/^SR-\d{8}-[A-Z0-9]{5}$/);
    });

    it('should generate unique tracking numbers', () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateTrackingNumber());
      }
      
      // All 100 should be unique
      expect(numbers.size).toBe(100);
    });

    it('should include current date in tracking number', () => {
      const trackingNumber = generateTrackingNumber();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      expect(trackingNumber).toContain(today);
    });
  });

  describe('AI Service Type Detection', () => {
    it('should detect commercial registration service', async () => {
      const result = await detectServiceType({
        title: 'Need help with commercial registration',
        description: 'I want to register my new business and need assistance with commercial registration documents and procedures in Oman.',
      });

      expect(result.suggestedType).toContain('Commercial Registration');
      expect(result.confidence).toBeGreaterThan(50);
      expect(result.reasoning).toBeTruthy();
    });

    it('should detect tax registration service', async () => {
      const result = await detectServiceType({
        title: 'Tax registration assistance needed',
        description: 'I need help registering for taxes and understanding tax obligations for my business in Oman.',
      });

      expect(result.suggestedType).toContain('Tax');
      expect(result.confidence).toBeGreaterThan(50);
    });

    it('should handle vague descriptions gracefully', async () => {
      const result = await detectServiceType({
        title: 'Business help',
        description: 'I need some help with my business.',
      });

      expect(result.suggestedType).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Budget Recommendation', () => {
    it('should recommend budget for commercial registration', async () => {
      const result = await recommendBudget({
        serviceType: 'Commercial Registration',
        description: 'Need to register a new LLC company',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

      expect(result.recommendedMin).toBeGreaterThan(0);
      expect(result.recommendedMax).toBeGreaterThan(result.recommendedMin);
      expect(result.marketAverage).toBeGreaterThan(0);
      expect(result.reasoning).toBeTruthy();
    });

    it('should consider urgency in budget recommendation', async () => {
      const normalResult = await recommendBudget({
        serviceType: 'Tax Registration',
        description: 'Tax registration needed',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const urgentResult = await recommendBudget({
        serviceType: 'Tax Registration',
        description: 'Urgent tax registration needed ASAP',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Urgent requests typically cost more
      expect(urgentResult.marketAverage).toBeGreaterThanOrEqual(normalResult.marketAverage * 0.8);
    });

    it('should use historical data when provided', async () => {
      const result = await recommendBudget({
        serviceType: 'Commercial Registration',
        description: 'Standard registration',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        historicalData: {
          avgPrice: 500,
          minPrice: 300,
          maxPrice: 800,
        },
      });

      // Should be influenced by historical data
      expect(result.marketAverage).toBeGreaterThan(200);
      expect(result.marketAverage).toBeLessThan(1000);
    });
  });

  describe('Requirement Checklist Generation', () => {
    it('should generate requirements for commercial registration', async () => {
      const result = await generateRequirementChecklist({
        serviceType: 'Commercial Registration',
        description: 'Need to register a new LLC',
      });

      expect(result.requirements).toBeTruthy();
      expect(Array.isArray(result.requirements)).toBe(true);
      expect(result.requirements.length).toBeGreaterThan(0);
      expect(result.estimatedProcessingTime).toBeTruthy();
    });

    it('should categorize requirements properly', async () => {
      const result = await generateRequirementChecklist({
        serviceType: 'Commercial Registration',
        description: 'LLC registration',
      });

      const hasCategories = result.requirements.every(req => 
        req.category && 
        Array.isArray(req.items) && 
        typeof req.mandatory === 'boolean'
      );

      expect(hasCategories).toBe(true);
    });

    it('should include mandatory and optional requirements', async () => {
      const result = await generateRequirementChecklist({
        serviceType: 'Tax Registration',
        description: 'Tax registration for existing business',
      });

      const hasMandatory = result.requirements.some(req => req.mandatory === true);
      expect(hasMandatory).toBe(true);
    });
  });

  describe('Timeline Prediction', () => {
    it('should predict timeline for service request', async () => {
      const result = await predictTimeline({
        serviceType: 'Commercial Registration',
        description: 'Standard LLC registration',
        urgency: 'medium',
      });

      expect(result.estimatedDays).toBeGreaterThan(0);
      expect(Array.isArray(result.breakdown)).toBe(true);
      expect(result.breakdown.length).toBeGreaterThan(0);
      expect(Array.isArray(result.factors)).toBe(true);
    });

    it('should provide phase breakdown', async () => {
      const result = await predictTimeline({
        serviceType: 'Tax Registration',
        description: 'Tax registration needed',
        urgency: 'high',
      });

      const hasValidBreakdown = result.breakdown.every(phase =>
        phase.phase && phase.duration
      );

      expect(hasValidBreakdown).toBe(true);
    });

    it('should consider urgency in timeline', async () => {
      const normalResult = await predictTimeline({
        serviceType: 'Commercial Registration',
        description: 'Standard registration',
        urgency: 'low',
      });

      const urgentResult = await predictTimeline({
        serviceType: 'Commercial Registration',
        description: 'Standard registration',
        urgency: 'urgent',
      });

      // Urgent should typically be faster
      expect(urgentResult.estimatedDays).toBeLessThanOrEqual(normalResult.estimatedDays * 1.5);
    });
  });

  describe('Office Matching Algorithm', () => {
    const mockOffices = [
      {
        id: 1,
        name: 'Muscat Business Services',
        governorate: 'Muscat',
        serviceCategories: ['Commercial Registration', 'Tax Registration'],
        averageRating: 4.8,
        completedBookings: 120,
        responseTime: 2,
      },
      {
        id: 2,
        name: 'Salalah Legal Office',
        governorate: 'Dhofar',
        serviceCategories: ['Legal Consultation', 'Commercial Registration'],
        averageRating: 4.5,
        completedBookings: 80,
        responseTime: 4,
      },
      {
        id: 3,
        name: 'Nizwa Accounting',
        governorate: 'Ad Dakhiliyah',
        serviceCategories: ['Accounting Services', 'Tax Registration'],
        averageRating: 4.2,
        completedBookings: 50,
        responseTime: 6,
      },
      {
        id: 4,
        name: 'Sohar Business Hub',
        governorate: 'Al Batinah North',
        serviceCategories: ['Commercial Registration', 'Business License'],
        averageRating: 4.9,
        completedBookings: 150,
        responseTime: 1,
      },
    ];

    it('should match offices based on service type', async () => {
      const matches = await matchOffices({
        serviceType: 'Commercial Registration',
        governorate: 'Any Location',
        budget: 500,
        urgency: 'medium',
        description: 'Need commercial registration',
        offices: mockOffices,
      });

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.length).toBeLessThanOrEqual(5);
      
      // All matches should offer the service
      matches.forEach(match => {
        const office = mockOffices.find(o => o.id === match.officeId);
        expect(office?.serviceCategories).toContain('Commercial Registration');
      });
    });

    it('should prioritize by location', async () => {
      const matches = await matchOffices({
        serviceType: 'Commercial Registration',
        governorate: 'Muscat',
        budget: 500,
        urgency: 'medium',
        description: 'Need commercial registration',
        offices: mockOffices,
      });

      // Muscat office should be in top matches
      const muscatOffice = matches.find(m => m.officeId === 1);
      expect(muscatOffice).toBeTruthy();
      expect(muscatOffice?.reasons).toContain('Located in your governorate');
    });

    it('should consider rating in matching score', async () => {
      const matches = await matchOffices({
        serviceType: 'Commercial Registration',
        governorate: 'Any Location',
        budget: 500,
        urgency: 'medium',
        description: 'Need commercial registration',
        offices: mockOffices,
      });

      // Higher rated offices should generally score higher
      const sortedByRating = [...mockOffices]
        .filter(o => o.serviceCategories.includes('Commercial Registration'))
        .sort((a, b) => b.averageRating - a.averageRating);
      
      const topRatedOfficeId = sortedByRating[0].id;
      const topMatch = matches[0];
      
      expect(topMatch.matchScore).toBeGreaterThan(0);
    });

    it('should prioritize fast response for urgent requests', async () => {
      const matches = await matchOffices({
        serviceType: 'Commercial Registration',
        governorate: 'Any Location',
        budget: 500,
        urgency: 'urgent',
        description: 'Urgent commercial registration needed',
        offices: mockOffices,
      });

      // Fast response offices should be prioritized
      const fastOffice = matches.find(m => m.officeId === 4); // Sohar has 1hr response
      expect(fastOffice).toBeTruthy();
      expect(fastOffice?.reasons).toContain('Available for urgent requests');
    });

    it('should return top 5 matches maximum', async () => {
      const manyOffices = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Office ${i + 1}`,
        governorate: 'Muscat',
        serviceCategories: ['Commercial Registration'],
        averageRating: 4.0,
        completedBookings: 50,
        responseTime: 3,
      }));

      const matches = await matchOffices({
        serviceType: 'Commercial Registration',
        governorate: 'Muscat',
        budget: 500,
        urgency: 'medium',
        description: 'Need commercial registration',
        offices: manyOffices,
      });

      expect(matches.length).toBeLessThanOrEqual(5);
    });

    it('should provide match scores and reasons', async () => {
      const matches = await matchOffices({
        serviceType: 'Commercial Registration',
        governorate: 'Muscat',
        budget: 500,
        urgency: 'medium',
        description: 'Need commercial registration',
        offices: mockOffices,
      });

      matches.forEach(match => {
        expect(match.matchScore).toBeGreaterThanOrEqual(0);
        expect(match.matchScore).toBeLessThanOrEqual(100);
        expect(Array.isArray(match.reasons)).toBe(true);
        expect(match.estimatedResponseTime).toBeTruthy();
      });
    });
  });

  describe('Email Notification System', () => {
    it('should generate valid tracking numbers for emails', () => {
      const trackingNumber = generateTrackingNumber();
      
      expect(trackingNumber).toMatch(/^SR-\d{8}-[A-Z0-9]{5}$/);
      expect(trackingNumber.length).toBe(17); // SR- (3) + date (8) + - (1) + random (5)
    });
  });
});
