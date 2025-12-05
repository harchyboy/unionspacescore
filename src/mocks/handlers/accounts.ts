import { http, HttpResponse } from 'msw';

const mockAccounts = [
  { id: 'acc1', Account_Name: 'Knight Frank', Billing_City: 'London', Website: 'https://knightfrank.com' },
  { id: 'acc2', Account_Name: 'Savills', Billing_City: 'London', Website: 'https://savills.com' },
  { id: 'acc3', Account_Name: 'Premier Cleaning Services', Billing_City: 'Manchester', Website: 'https://premier-cs.com' },
  { id: 'acc4', Account_Name: 'TechStartup Ltd', Billing_City: 'London', Website: 'https://techstartup.com' },
  { id: 'acc5', Account_Name: 'Green Interior Plants', Billing_City: 'Bristol', Website: 'https://greenplants.co.uk' },
];

export const accountsHandlers = [
  http.get('/api/accounts', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    
    if (!search) {
        return HttpResponse.json({ items: [] });
    }

    const filtered = mockAccounts.filter(acc => 
      acc.Account_Name.toLowerCase().includes(search)
    ).map(acc => ({
      id: acc.id,
      name: acc.Account_Name,
      city: acc.Billing_City,
      website: acc.Website
    }));

    return HttpResponse.json({ items: filtered });
  }),

  http.post('/api/accounts', async ({ request }) => {
    const body = (await request.json()) as { name: string; city?: string };
    const newAccount = {
        id: `acc${mockAccounts.length + 1}`,
        Account_Name: body.name,
        Billing_City: body.city,
        Website: ''
    };
    mockAccounts.push(newAccount);
    return HttpResponse.json({
        id: newAccount.id,
        name: newAccount.Account_Name,
        city: newAccount.Billing_City,
        website: newAccount.Website
    }, { status: 201 });
  })
];

