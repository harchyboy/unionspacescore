import { http, HttpResponse } from 'msw';
import { propertyHandlers } from './handlers/properties';
import { contactsHandlers } from './handlers/contacts';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
  ...propertyHandlers,
  ...contactsHandlers,
];

