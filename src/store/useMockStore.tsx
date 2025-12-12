/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppState, DealRoomStatus, AgreementPlan, Agreement, FileDoc, ActivityItem, TaskItem } from '../types/dealRoom';

const STORAGE_KEY = 'union.dealroom.mock';

// Helper utilities
export const now = () => new Date().toISOString();
export const uid = () => Math.random().toString(36).slice(2);

// Seed fixtures
function seedState(): AppState {
  return {
    deal: {
      id: 'D-001',
      tenant: { id: 'T-1', name: 'Acme Ltd' },
      property: { id: 'P-1', name: '99 Bishopsgate', unit: 'Level 12' },
      proposal: { status: 'Accepted', totals: { monthly: 24500, setup: 6000 } },
      stage: 'deal_room',
    },
    dealRoom: {
      dealId: 'D-001',
      status: 'setup_pending',
      agreementPlan: undefined,
      agreements: [],
      hots: {
        id: 'H-1',
        version: 1,
        fields: { Term: '24 months', Break: '12 months', Indexation: 'RPI' },
        updatedAt: now(),
      },
      docs: [],
      activity: [],
      tasks: [
        {
          id: 'T1',
          title: 'Create draft landlord agreement',
          assignee: 'Max',
          status: 'Open',
          group: 'Legal',
        },
        {
          id: 'T2',
          title: 'Confirm internet provisional order',
          assignee: 'Dani',
          status: 'Open',
          group: 'Ops',
        },
      ],
    },
  };
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return seedState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

interface StoreContextType {
  state: AppState;
  confirmSetup: (plan: AgreementPlan) => void;
  generateLegalPack: () => void;
  advanceAgreementStatus: (id: string) => void;
  uploadAgreementVersion: (id: string) => void;
  handoffToOps: () => void;
  updateHots: (fields: Record<string, string>) => void;
  uploadDocument: (name: string, tag: FileDoc['tag']) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTaskStatus: (id: string, status: TaskItem['status']) => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'at'>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  const confirmSetup = useCallback(
    (plan: AgreementPlan) => {
      updateState((prev) => {
        const activity: ActivityItem = {
          id: uid(),
          at: now(),
          actor: 'System',
          type: 'Comment',
          note: 'Setup confirmed',
        };
        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            agreementPlan: plan,
            status: 'setup_confirmed',
            activity: [activity, ...prev.dealRoom.activity],
          },
        };
      });
    },
    [updateState]
  );

  const generateLegalPack = useCallback(() => {
    updateState((prev) => {
      if (!prev.dealRoom.agreementPlan) return prev;

      const plan = prev.dealRoom.agreementPlan;
      const agreements: Agreement[] = [];

      // Generate Landlord agreements
      for (let i = 0; i < plan.summary.landlordAgreements; i++) {
        agreements.push({
          id: uid(),
          kind: 'Landlord',
          name: `Landlord Agreement ${i + 1}`,
          status: 'Drafting',
          versions: [{ id: uid(), name: 'v1', uploadedAt: now() }],
          requiredSigners: [
            { id: 'TR-1', name: 'Tenant Rep' },
            { id: 'LR-1', name: 'Landlord Rep' },
          ],
        });
      }

      // Generate Union agreements
      for (let i = 0; i < plan.summary.unionAgreements; i++) {
        agreements.push({
          id: uid(),
          kind: 'Union',
          name: `Union Agreement ${i + 1}`,
          status: 'Drafting',
          versions: [{ id: uid(), name: 'v1', uploadedAt: now() }],
          requiredSigners: [
            { id: 'TR-1', name: 'Tenant Rep' },
            { id: 'UR-1', name: 'Union Rep' },
          ],
        });
      }

      // Generate Supplier agreements
      for (let i = 0; i < plan.summary.supplierAgreements; i++) {
        agreements.push({
          id: uid(),
          kind: 'Supplier',
          name: `Supplier Agreement ${i + 1}`,
          status: 'Drafting',
          versions: [{ id: uid(), name: 'v1', uploadedAt: now() }],
          requiredSigners: [
            { id: 'TR-1', name: 'Tenant Rep' },
            { id: 'SR-1', name: 'Supplier Rep' },
          ],
        });
      }

      const activity: ActivityItem = {
        id: uid(),
        at: now(),
        actor: 'System',
        type: 'PackGenerated',
        note: 'Legal pack generated',
      };

      return {
        ...prev,
        dealRoom: {
          ...prev.dealRoom,
          agreements,
          status: 'contracts_pending',
          activity: [activity, ...prev.dealRoom.activity],
        },
      };
    });
  }, [updateState]);

  const advanceAgreementStatus = useCallback(
    (id: string) => {
      updateState((prev) => {
        const statusOrder: Agreement['status'][] = ['Drafting', 'InReview', 'WithLegal', 'ReadyToSign', 'Signed'];
        const agreement = prev.dealRoom.agreements.find((a) => a.id === id);
        if (!agreement) return prev;

        const currentIndex = statusOrder.indexOf(agreement.status);
        if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return prev;

        const nextStatus = statusOrder[currentIndex + 1];
        const updatedAgreements = prev.dealRoom.agreements.map((a) =>
          a.id === id ? { ...a, status: nextStatus } : a
        );

        const activity: ActivityItem = {
          id: uid(),
          at: now(),
          actor: 'User',
          type: 'AgreementStatus',
          note: `${agreement.name} → ${nextStatus}`,
        };

        // Check if all agreements are Signed
        const allSigned = updatedAgreements.length > 0 && updatedAgreements.every((a) => a.status === 'Signed');
        const newStatus: DealRoomStatus = allSigned ? 'handoff_ready' : prev.dealRoom.status;

        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            agreements: updatedAgreements,
            status: newStatus,
            activity: [activity, ...prev.dealRoom.activity],
          },
        };
      });
    },
    [updateState]
  );

  const uploadAgreementVersion = useCallback(
    (id: string) => {
      updateState((prev) => {
        const agreement = prev.dealRoom.agreements.find((a) => a.id === id);
        if (!agreement) return prev;

        const newVersion = {
          id: uid(),
          name: `v${agreement.versions.length + 1}`,
          uploadedAt: now(),
        };

        const updatedAgreements = prev.dealRoom.agreements.map((a) =>
          a.id === id ? { ...a, versions: [...a.versions, newVersion] } : a
        );

        const activity: ActivityItem = {
          id: uid(),
          at: now(),
          actor: 'User',
          type: 'DocUploaded',
          note: `New version for ${agreement.name}`,
        };

        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            agreements: updatedAgreements,
            activity: [activity, ...prev.dealRoom.activity],
          },
        };
      });
    },
    [updateState]
  );

  const handoffToOps = useCallback(() => {
    updateState((prev) => {
      const activity: ActivityItem = {
        id: uid(),
        at: now(),
        actor: 'System',
        type: 'Handoff',
        note: 'Handoff to Ops',
      };
      return {
        ...prev,
        deal: {
          ...prev.deal,
          stage: 'onboarding',
        },
        dealRoom: {
          ...prev.dealRoom,
          activity: [activity, ...prev.dealRoom.activity],
        },
      };
    });
  }, [updateState]);

  const updateHots = useCallback(
    (fields: Record<string, string>) => {
      updateState((prev) => {
        const activity: ActivityItem = {
          id: uid(),
          at: now(),
          actor: 'User',
          type: 'Comment',
          note: 'Heads of Terms updated',
        };
        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            hots: {
              ...prev.dealRoom.hots,
              fields: { ...prev.dealRoom.hots.fields, ...fields },
              version: prev.dealRoom.hots.version + 1,
              updatedAt: now(),
            },
            activity: [activity, ...prev.dealRoom.activity],
          },
        };
      });
    },
    [updateState]
  );

  const uploadDocument = useCallback(
    (name: string, tag: FileDoc['tag']) => {
      updateState((prev) => {
        const existingDoc = prev.dealRoom.docs.find((d) => d.name === name);
        const newDoc: FileDoc = existingDoc
          ? { ...existingDoc, version: existingDoc.version + 1, uploadedAt: now() }
          : {
              id: uid(),
              name,
              tag,
              version: 1,
              uploadedAt: now(),
            };

        const updatedDocs = existingDoc
          ? prev.dealRoom.docs.map((d) => (d.id === existingDoc.id ? newDoc : d))
          : [...prev.dealRoom.docs, newDoc];

        const activity: ActivityItem = {
          id: uid(),
          at: now(),
          actor: 'User',
          type: 'DocUploaded',
          note: `${existingDoc ? 'Updated' : 'Uploaded'} document: ${name}`,
        };

        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            docs: updatedDocs,
            activity: [activity, ...prev.dealRoom.activity],
          },
        };
      });
    },
    [updateState]
  );

  const addTask = useCallback(
    (task: Omit<TaskItem, 'id'>) => {
      updateState((prev) => {
        const newTask: TaskItem = {
          id: uid(),
          ...task,
        };
        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            tasks: [...prev.dealRoom.tasks, newTask],
          },
        };
      });
    },
    [updateState]
  );

  const updateTaskStatus = useCallback(
    (id: string, status: TaskItem['status']) => {
      updateState((prev) => {
        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            tasks: prev.dealRoom.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
          },
        };
      });
    },
    [updateState]
  );

  const addActivity = useCallback(
    (activity: Omit<ActivityItem, 'id' | 'at'>) => {
      updateState((prev) => {
        const newActivity: ActivityItem = {
          id: uid(),
          at: now(),
          ...activity,
        };
        return {
          ...prev,
          dealRoom: {
            ...prev.dealRoom,
            activity: [newActivity, ...prev.dealRoom.activity],
          },
        };
      });
    },
    [updateState]
  );

  return (
    <StoreContext.Provider
      value={{
        state,
        confirmSetup,
        generateLegalPack,
        advanceAgreementStatus,
        uploadAgreementVersion,
        handoffToOps,
        updateHots,
        uploadDocument,
        addTask,
        updateTaskStatus,
        addActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useMockStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useMockStore must be used within MockStoreProvider');
  }
  return context;
}

