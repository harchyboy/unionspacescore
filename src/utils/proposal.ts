/**
 * Utility function to determine if "Send Proposal" action is allowed in a given context.
 * 
 * Rules:
 * - Send Proposal should only appear on Pipeline deal screens, never in the Leads module
 * - Valid contexts: Deal/Opportunity view, Deal Room, Matching view (must have dealId)
 * - Invalid contexts: Lead Qualification, Lead list, any screen with only leadId
 * 
 * @param context - The context object containing type and stage information
 * @returns true if Send Proposal is allowed, false otherwise
 */
export interface ProposalContext {
  type: 'deal' | 'opportunity' | 'lead' | 'pipeline';
  stage?: string;
  dealId?: string;
  leadId?: string;
}

export function canSendProposal(context: ProposalContext): boolean {
  // Must be a deal or opportunity context
  if (context.type !== 'deal' && context.type !== 'opportunity' && context.type !== 'pipeline') {
    return false;
  }

  // Must have a dealId (not just a leadId)
  if (!context.dealId && context.leadId) {
    return false;
  }

  // If stage exists and is Won or Lost, don't allow proposals
  if (context.stage) {
    const stageLower = context.stage.toLowerCase();
    if (stageLower === 'won' || stageLower === 'lost' || stageLower === 'closed') {
      return false;
    }
  }

  return true;
}

