import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../hooks/useToast';
import type { Property, PropertyId } from '../../../types/property';

interface MarketingTabProps {
  property: Property;
}

async function updatePropertyMarketing(
  propertyId: PropertyId,
  updates: {
    visibility?: 'Private' | 'Public';
    status?: 'Draft' | 'Broker-Ready' | 'On Market';
    brokerSet?: string;
  }
): Promise<Property> {
  const response = await fetch(`/api/properties/${propertyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marketing: updates }),
  });

  if (!response.ok) {
    throw new Error('Failed to update marketing settings');
  }

  return response.json();
}

async function pushToValve(propertyId: PropertyId): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/properties/${propertyId}/valve/push`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to push to Valve' }));
    throw new Error(error.error || 'Failed to push to Valve');
  }

  return response.json();
}

export function MarketingTab({ property }: MarketingTabProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [visibility, setVisibility] = useState(property.marketing.visibility);
  const [status, setStatus] = useState(property.marketing.status);
  const [brokerSet, setBrokerSet] = useState(property.marketing.brokerSet || '');

  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof updatePropertyMarketing>[1]) =>
      updatePropertyMarketing(property.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      showToast('Marketing settings updated successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const pushMutation = useMutation({
    mutationFn: () => pushToValve(property.id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['property', property.id] });
        showToast('Successfully pushed to Valve', 'success');
      } else {
        showToast(data.error || 'Failed to push to Valve', 'error');
      }
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      visibility,
      status,
      brokerSet: brokerSet || undefined,
    });
  };

  const handlePushToValve = () => {
    pushMutation.mutate();
  };

  const hasChanges =
    visibility !== property.marketing.visibility ||
    status !== property.marketing.status ||
    brokerSet !== (property.marketing.brokerSet || '');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#252525] mb-2">
              Marketing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Draft' | 'Broker-Ready' | 'On Market')}
              className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
            >
              <option value="Draft">Internal Only</option>
              <option value="Broker-Ready">Broker-Ready</option>
              <option value="On Market">On Market</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#252525] mb-2">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'Private' | 'Public')}
              className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
            >
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#252525] mb-2">
              Broker Set
            </label>
            <select
              value={brokerSet}
              onChange={(e) => setBrokerSet(e.target.value)}
              className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
            >
              <option value="">None</option>
              <option value="premium">Premium Set</option>
              <option value="standard">Standard Set</option>
              <option value="budget">Budget Set</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-[#E6E6E6]">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
            {hasChanges && (
              <Button
                variant="ghost"
                onClick={() => {
                  setVisibility(property.marketing.visibility);
                  setStatus(property.marketing.status);
                  setBrokerSet(property.marketing.brokerSet || '');
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valve Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#252525] mb-1">Sync Status</p>
              {property.marketing.valveSyncStatus ? (
                <div className="flex items-center space-x-2">
                  <Badge
                    className={
                      property.marketing.valveSyncStatus === 'synced'
                        ? 'bg-green-100 text-green-800'
                        : property.marketing.valveSyncStatus === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {property.marketing.valveSyncStatus === 'synced'
                      ? 'Synced'
                      : property.marketing.valveSyncStatus === 'error'
                        ? 'Error'
                        : 'Pending'}
                  </Badge>
                  {property.marketing.lastSyncedAt && (
                    <span className="text-xs text-[#8e8e8e]">
                      Last synced: {new Date(property.marketing.lastSyncedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#8e8e8e]">Not synced</p>
              )}
              {property.marketing.valveSyncError && (
                <p className="text-sm text-red-600 mt-2">{property.marketing.valveSyncError}</p>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handlePushToValve}
              isLoading={pushMutation.isPending}
            >
              Push to Valve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

