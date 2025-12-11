import { http, HttpResponse } from 'msw';

export const syncHandlers = [
  http.post('/api/sync', () => {
    return HttpResponse.json({
      success: true,
      results: {
        contacts: { synced: 5 },
        accounts: { synced: 2 }
      },
      timestamp: new Date().toISOString(),
    });
  }),
];
