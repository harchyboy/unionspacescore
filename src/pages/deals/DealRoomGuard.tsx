import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMockStore } from '../../store/useMockStore';

export function DealRoomGuard({ children }: { children: React.ReactNode }) {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useMockStore();

  useEffect(() => {
    const deal = state.deal;
    const dealRoom = state.dealRoom;

    // Guard: proposal must be Accepted
    if (deal.proposal.status !== 'Accepted') {
      navigate(`/deals/${dealId}/proposal`);
      return;
    }

    // Guard: if status is setup_pending and not on setup page, redirect to setup
    if (
      dealRoom.status === 'setup_pending' &&
      !location.pathname.includes('/deal-room/setup')
    ) {
      navigate(`/deals/${dealId}/deal-room/setup`);
      return;
    }
  }, [dealId, navigate, location.pathname, state]);

  return <>{children}</>;
}

