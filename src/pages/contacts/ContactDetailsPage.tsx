import { useParams, useNavigate } from 'react-router-dom';
import { ContactDetails } from './Details';
import { Button } from '../../components/ui/Button';
import { useContact } from '../../api/contacts';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading, error } = useContact(id || '');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-secondary">Contact not found</p>
          <Button onClick={() => navigate('/contacts')} className="mt-4">
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ContactDetails contact={contact} onBack={() => navigate('/contacts')} />
      </div>
    </div>
  );
}

