import type { DealType, ServiceCategory, ServiceLine, Deal, ServiceRoute } from '../types/deal';

/**
 * Check if a service category must always be routed to UNION agreement
 */
export const isAlwaysUnionCategory = (category: ServiceCategory): boolean => {
  return (
    category === 'AV' ||
    category === 'MeetingRooms' ||
    category === 'Printing' ||
    category === 'FoodBeverage' ||
    category === 'OtherVariable'
  );
};

/**
 * Normalize a service line according to deal type and business rules
 */
export function normaliseServiceLine(dealType: DealType, line: ServiceLine): ServiceLine {
  if (isAlwaysUnionCategory(line.category)) {
    return { ...line, route: 'UnionAgreement' };
  }

  if (dealType === 'BoltOn' && line.route === 'BundledInRent') {
    return { ...line, route: 'UnionAgreement' };
  }

  return line;
}

/**
 * Add a service to a deal, applying post-sign rules if applicable
 */
export function addServiceToDeal(
  deal: Deal,
  input: { name: string; category: ServiceCategory }
): Deal {
  const postSign = deal.stage === 'Signed' || deal.stage === 'Live';

  const newLine: ServiceLine = {
    id: crypto.randomUUID(),
    dealId: deal.id,
    name: input.name,
    category: input.category,
    included: true,
    isPostSignAddition: postSign,
    route: 'UnionAgreement',
  };

  return {
    ...deal,
    serviceLines: [...(deal.serviceLines || []), newLine],
  };
}

/**
 * Summarize agreement plan from service lines
 */
export function summariseAgreementPlan(serviceLines: ServiceLine[]) {
  return {
    bundledInRent: serviceLines.filter((l) => l.route === 'BundledInRent').length,
    landlordAgreements: serviceLines.filter((l) => l.route === 'LandlordAgreement').length,
    unionAgreements: serviceLines.filter((l) => l.route === 'UnionAgreement').length,
  };
}

/**
 * Get available routes for a service based on deal type and category
 */
export function getAvailableRoutes(
  dealType: DealType,
  category: ServiceCategory
): ServiceRoute[] {
  // Always UNION for variable/AV services
  if (isAlwaysUnionCategory(category)) {
    return ['UnionAgreement'];
  }

  if (dealType === 'AllInclusive') {
    // For All Inclusive, allow BundledInRent, UnionAgreement, and optionally LandlordAgreement
    // LandlordAgreement is allowed for certain categories like Cleaning, Plants
    const landlordAllowedCategories: ServiceCategory[] = ['Cleaning', 'Plants', 'Internet'];
    const routes: ServiceRoute[] = ['BundledInRent', 'UnionAgreement'];
    if (landlordAllowedCategories.includes(category)) {
      routes.push('LandlordAgreement');
    }
    return routes;
  } else {
    // Bolt On: no BundledInRent option
    const landlordAllowedCategories: ServiceCategory[] = ['Cleaning', 'Plants', 'Internet'];
    const routes: ServiceRoute[] = ['UnionAgreement'];
    if (landlordAllowedCategories.includes(category)) {
      routes.push('LandlordAgreement');
    }
    return routes;
  }
}

