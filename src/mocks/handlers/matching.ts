import { http, HttpResponse } from 'msw';
import type { MatchingResult, PropertyMatch } from '../../types/matching';
import type { Property } from '../../types/property';
import { seedProperties } from './properties';

// Mock matching logic - in production this would call a real matching service
function generateMatches(dealId: string, properties: Property[]): MatchingResult {
  // Filter out private properties and those hidden from tenant
  const visibleProperties = properties.filter(
    (p) => p.marketing.visibility === 'Public'
  );

  // Simple matching algorithm - in production this would be more sophisticated
  const matches: PropertyMatch[] = visibleProperties.slice(0, 10).map((property, index) => {
    // Calculate a mock match score
    const baseScore = 85 - index * 5;
    const matchScore = Math.max(60, Math.min(100, baseScore));

    // Determine category based on score
    let category: 'best-match' | 'good-match' | 'fair-match';
    if (matchScore >= 85) {
      category = 'best-match';
    } else if (matchScore >= 70) {
      category = 'good-match';
    } else {
      category = 'fair-match';
    }

    // Generate mock match reasons
    const reasons = [
      {
        type: 'location' as const,
        description: 'Prime location in requested area',
        score: 20,
      },
      {
        type: 'size' as const,
        description: 'Size matches requirements',
        score: 15,
      },
      {
        type: 'amenities' as const,
        description: 'Includes requested amenities',
        score: 10,
      },
    ];

    // Pick a unit if available
    const unit = property.units.length > 0 ? property.units[0] : undefined;

    return {
      property,
      unit,
      matchScore,
      category,
      reasons,
      isShortlisted: false,
    };
  });

  return {
    dealId,
    matches,
    totalMatches: matches.length,
    lastUpdated: new Date().toISOString(),
  };
}

export const matchingHandlers = [
  // Get matches for a deal
  http.get('/api/deals/:dealId/matches', ({ params }) => {
    const dealId = params.dealId as string;
    const matches = generateMatches(dealId, seedProperties);
    return HttpResponse.json(matches);
  }),

  // Add to shortlist
  http.post('/api/deals/:dealId/shortlist', async ({ params, request }) => {
    const dealId = params.dealId as string;
    const body = (await request.json()) as { propertyId: string; unitId?: string };
    
    // In production, this would update the deal's shortlist
    // For now, just return success
    return HttpResponse.json({ success: true, dealId, propertyId: body.propertyId, unitId: body.unitId });
  }),
];

