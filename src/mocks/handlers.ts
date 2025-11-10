import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  http.get('/api/properties', () => {
    return HttpResponse.json({
      properties: [
        {
          id: '1',
          name: 'Sample Property',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          units: 10,
          status: 'active',
        },
      ],
    });
  }),
];

