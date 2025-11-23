import { http, HttpResponse } from 'msw';
import { propertyHandlers } from './handlers/properties';
import { contactsHandlers } from './handlers/contacts';
import { matchingHandlers } from './handlers/matching';
import { dealsHandlers } from './handlers/deals';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
  ...propertyHandlers,
  ...contactsHandlers,
  ...matchingHandlers,
  ...dealsHandlers,
];

