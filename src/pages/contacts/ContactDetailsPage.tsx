import { useParams, useNavigate } from 'react-router-dom';
import { ContactDetails } from './Details';
import { Button } from '../../components/ui/Button';

export function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-secondary">Contact ID is required</p>
          <Button onClick={() => navigate('/contacts')} className="mt-4">
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <Button variant="ghost" size="sm" icon="fa-arrow-left" onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ContactDetails id={id} />
      </div>
    </div>
  );
}

