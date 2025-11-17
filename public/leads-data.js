;(function () {
  const PROPERTY_LIBRARY = {
    '99-bishopsgate': {
      id: '99-bishopsgate',
      name: '99 Bishopsgate',
      location: 'City Core',
      size: '28,500 sq ft',
      type: 'Prime Grade A floors',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2a04833416-c73dfcb3955e8c8d5f62.png'
    },
    'one-canada': {
      id: 'one-canada',
      name: 'One Canada Square',
      location: 'Canary Wharf',
      size: '24,000 sq ft',
      type: 'Iconic tower floors',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/71ec98b403-4d78e412d1a56ddf8015.png'
    },
    leadenhall: {
      id: 'leadenhall',
      name: 'The Leadenhall Building',
      location: 'City Core',
      size: '22,000 sq ft',
      type: 'Premium sky floors',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/8a2df2cabf-6e968c9424109620c5f5.png'
    },
    'principal-place': {
      id: 'principal-place',
      name: 'Principal Place',
      location: 'Shoreditch',
      size: '18,000 sq ft',
      type: 'Creative campus',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c4d01238b7-5dffcd72a27d96967a5e.png'
    },
    shard: {
      id: 'shard',
      name: 'The Shard',
      location: 'Southwark',
      size: '32,000 sq ft',
      type: 'Skyline statement floors',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/67fd6c1e72-86ec3a1c33a0cad7a78d.png'
    },
    'tides-arverne': {
      id: 'tides-arverne',
      name: 'The Tides At Arverne',
      location: 'Shoreditch',
      size: '19,500 sq ft',
      type: 'Waterfront-inspired space',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/4a1fa12ae2-0df310617941ad5e1e43.png'
    },
    'shoreditch-exchange': {
      id: 'shoreditch-exchange',
      name: 'Shoreditch Exchange',
      location: 'Shoreditch',
      size: '17,000 sq ft',
      type: 'Flexible innovation suites',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80'
    },
    'kings-cross-hub': {
      id: 'kings-cross-hub',
      name: "King's Cross Hub",
      location: "King's Cross",
      size: '16,200 sq ft',
      type: 'Hybrid campus floor',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
    }
  };

  const gradeScale = [
    {
      grade: 'A',
      min: 85,
      color: 'bg-emerald-100 text-emerald-800',
      description: 'Hot Lead — high budget, decision maker, urgent requirement.',
      priority: 'Immediate contact within 1 hour.'
    },
    {
      grade: 'B',
      min: 70,
      color: 'bg-sky-100 text-sky-800',
      description: 'Warm Lead — good budget, strong influence, near-term move.',
      priority: 'Follow-up within 24 hours.'
    },
    {
      grade: 'C',
      min: 50,
      color: 'bg-amber-100 text-amber-800',
      description: 'Cool Lead — moderate budget, limited authority, exploring.',
      priority: 'Schedule touchpoint within 3 days.'
    },
    {
      grade: 'D',
      min: 25,
      color: 'bg-slate-100 text-slate-700',
      description: 'Cold Lead — low budget or distant timeline.',
      priority: 'Add to nurture campaign.'
    },
    {
      grade: 'U',
      min: 0,
      color: 'bg-rose-100 text-rose-700',
      description: 'Unqualified — insufficient information.',
      priority: 'Request missing data or disqualify.'
    }
  ];

  const leadsSeed = [
    {
      id: 'LD-001',
      reference: 'LD-001',
      contact: { name: 'Sophie Blake', email: 'sophie.blake@arcadia.com', phone: '+44 20 7123 9001' },
      company: 'Arcadia Retail',
      source: 'Broker Referral',
      status: 'New',
      date: '2025-11-10',
      responseTimeHours: 1.2,
      requirement: {
        size: '28,000-32,000 sq ft',
        locations: ['City Core', 'Canary Wharf'],
        budgetRange: '£100k+ annual',
        timeline: 'Immediate',
        notes: 'Flagship HQ relocation for UK retail leadership.'
      },
      bant: { budget: 25, authority: 25, need: 25, timeline: 20 },
      bonus: { propertyFit: 10, sourceQuality: 5, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 95 },
        { id: 'leadenhall', fit: 88 },
        { id: 'one-canada', fit: 82 },
        { id: 'principal-place', fit: 78 }
      ],
      alternatives: [
        { id: 'shard', fit: 74 },
        { id: 'shoreditch-exchange', fit: 70 },
        { id: 'kings-cross-hub', fit: 68 }
      ],
      qualificationStatus: ['Budget verified', 'Decision team engaged', 'Urgency confirmed']
    },
    {
      id: 'LD-002',
      reference: 'LD-002',
      contact: { name: 'Marcus Reed', email: 'marcus@fintronics.ai', phone: '+44 20 7811 3404' },
      company: 'Fintronics AI',
      source: 'Web Form',
      status: 'In Qualification',
      date: '2025-11-08',
      responseTimeHours: 5.5,
      requirement: {
        size: '15,000-18,000 sq ft',
        locations: ['Shoreditch'],
        budgetRange: '£50k-£99k annual',
        timeline: '1-3 months',
        notes: 'AI scale-up consolidating two satellite offices.'
      },
      bant: { budget: 20, authority: 20, need: 20, timeline: 15 },
      bonus: { propertyFit: 5, sourceQuality: 3, companyProfile: 3 },
      propertyMatches: [
        { id: 'principal-place', fit: 88 },
        { id: 'tides-arverne', fit: 82 },
        { id: 'shoreditch-exchange', fit: 78 },
        { id: '99-bishopsgate', fit: 70 }
      ],
      alternatives: [
        { id: 'one-canada', fit: 65 },
        { id: 'kings-cross-hub', fit: 60 },
        { id: 'leadenhall', fit: 58 }
      ],
      qualificationStatus: ['Budget validated', 'Director approval pending']
    },
    {
      id: 'LD-003',
      reference: 'LD-003',
      contact: { name: 'Priya Patel', email: 'priya@luminacreative.co.uk', phone: '+44 20 3001 1220' },
      company: 'Lumina Creative',
      source: 'Email',
      status: 'Nurture',
      date: '2025-11-04',
      responseTimeHours: 18,
      requirement: {
        size: '8,000-10,000 sq ft',
        locations: ['Shoreditch', 'Southwark'],
        budgetRange: '£25k-£49k annual',
        timeline: '3-6 months',
        notes: 'Creative agency exploring hybrid studio concepts.'
      },
      bant: { budget: 15, authority: 15, need: 10, timeline: 10 },
      bonus: { propertyFit: 5, sourceQuality: 2, companyProfile: 2 },
      propertyMatches: [
        { id: 'principal-place', fit: 76 },
        { id: 'tides-arverne', fit: 72 },
        { id: 'shoreditch-exchange', fit: 70 }
      ],
      alternatives: [
        { id: 'one-canada', fit: 60 },
        { id: 'shard', fit: 58 },
        { id: 'kings-cross-hub', fit: 55 }
      ],
      qualificationStatus: ['Budget indicative', 'Need emerging']
    },
    {
      id: 'LD-004',
      reference: 'LD-004',
      contact: { name: 'Daniel Cho', email: 'daniel.cho@medivance.com', phone: '+44 20 7555 4471' },
      company: 'Medivance Health',
      source: 'Phone Call',
      status: 'Assigned',
      date: '2025-11-09',
      responseTimeHours: 3.2,
      requirement: {
        size: '20,000 sq ft',
        locations: ['City Core', 'Southwark'],
        budgetRange: '£50k-£99k annual',
        timeline: '2-4 weeks',
        notes: 'Clinical innovation lab & office combined program.'
      },
      bant: { budget: 20, authority: 20, need: 20, timeline: 20 },
      bonus: { propertyFit: 8, sourceQuality: 2, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 90 },
        { id: 'shard', fit: 85 },
        { id: 'leadenhall', fit: 80 },
        { id: 'one-canada', fit: 74 }
      ],
      alternatives: [
        { id: 'tides-arverne', fit: 68 },
        { id: 'principal-place', fit: 65 },
        { id: 'shoreditch-exchange', fit: 60 }
      ],
      qualificationStatus: ['Budget approved', 'Ops lead onboard', 'Timeline locked']
    },
    {
      id: 'LD-005',
      reference: 'LD-005',
      contact: { name: 'Hannah Osei', email: 'hannah.osei@greenwave.energy', phone: '+44 20 8123 9933' },
      company: 'Greenwave Energy',
      source: 'Broker Referral',
      status: 'Proposal Sent',
      date: '2025-11-02',
      responseTimeHours: 1.8,
      requirement: {
        size: '26,000 sq ft',
        locations: ['City Core'],
        budgetRange: '£100k+ annual',
        timeline: '1 month',
        notes: 'Sustainability-focused HQ with showcase lab.'
      },
      bant: { budget: 25, authority: 25, need: 20, timeline: 20 },
      bonus: { propertyFit: 10, sourceQuality: 5, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 96 },
        { id: 'leadenhall', fit: 90 },
        { id: 'shard', fit: 88 },
        { id: 'one-canada', fit: 82 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 75 },
        { id: 'tides-arverne', fit: 72 },
        { id: 'kings-cross-hub', fit: 70 }
      ],
      qualificationStatus: ['C-suite engaged', 'ESG brief approved']
    },
    {
      id: 'LD-006',
      reference: 'LD-006',
      contact: { name: 'Luca Romano', email: 'luca.romano@craftgrain.co', phone: '+44 20 3222 1101' },
      company: 'CraftGrain',
      source: 'Web Form',
      status: 'Nurture',
      date: '2025-10-28',
      responseTimeHours: 26,
      requirement: {
        size: '5,000 sq ft',
        locations: ['Shoreditch'],
        budgetRange: '£10k-£24k annual',
        timeline: '6+ months',
        notes: 'Artisan consumer brand exploring future London flagship.'
      },
      bant: { budget: 10, authority: 10, need: 5, timeline: 5 },
      bonus: { propertyFit: 2, sourceQuality: 3, companyProfile: 2 },
      propertyMatches: [
        { id: 'tides-arverne', fit: 68 },
        { id: 'shoreditch-exchange', fit: 64 },
        { id: 'principal-place', fit: 60 }
      ],
      alternatives: [
        { id: 'kings-cross-hub', fit: 58 },
        { id: 'one-canada', fit: 55 },
        { id: 'leadenhall', fit: 50 }
      ],
      qualificationStatus: ['Budget draft only', 'Need exploratory']
    },
    {
      id: 'LD-007',
      reference: 'LD-007',
      contact: { name: 'Mei Tanaka', email: 'mei.tanaka@zenbiopharm.com', phone: '+44 20 7999 2333' },
      company: 'Zen Biopharm',
      source: 'Email',
      status: 'In Qualification',
      date: '2025-11-06',
      responseTimeHours: 6.3,
      requirement: {
        size: '18,500 sq ft',
        locations: ['Canary Wharf', 'City Core'],
        budgetRange: '£50k-£99k annual',
        timeline: '3 months',
        notes: 'Lab-enabled office with GMP adjacency.'
      },
      bant: { budget: 20, authority: 20, need: 15, timeline: 15 },
      bonus: { propertyFit: 8, sourceQuality: 3, companyProfile: 5 },
      propertyMatches: [
        { id: 'one-canada', fit: 90 },
        { id: '99-bishopsgate', fit: 84 },
        { id: 'leadenhall', fit: 80 },
        { id: 'shard', fit: 78 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 70 },
        { id: 'tides-arverne', fit: 66 },
        { id: 'kings-cross-hub', fit: 64 }
      ],
      qualificationStatus: ['Regulatory review', 'Science lead sign-off']
    },
    {
      id: 'LD-008',
      reference: 'LD-008',
      contact: { name: 'Oliver West', email: 'oliver.west@orbitpay.com', phone: '+44 20 7000 8888' },
      company: 'OrbitPay',
      source: 'Broker Referral',
      status: 'Qualified',
      date: '2025-10-30',
      responseTimeHours: 2.1,
      requirement: {
        size: '21,000 sq ft',
        locations: ['City Core'],
        budgetRange: '£50k-£99k annual',
        timeline: '2 months',
        notes: 'Payments scale-up consolidating multi-floor lease.'
      },
      bant: { budget: 20, authority: 20, need: 20, timeline: 15 },
      bonus: { propertyFit: 10, sourceQuality: 5, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 94 },
        { id: 'leadenhall', fit: 88 },
        { id: 'one-canada', fit: 85 },
        { id: 'shard', fit: 80 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 76 },
        { id: 'tides-arverne', fit: 72 },
        { id: 'shoreditch-exchange', fit: 69 }
      ],
      qualificationStatus: ['Finance approved', 'Board review scheduled']
    },
    {
      id: 'LD-009',
      reference: 'LD-009',
      contact: { name: 'Amelia Price', email: 'amelia.price@novumdesign.studio', phone: '+44 20 8123 9987' },
      company: 'Novum Design Studio',
      source: 'Web Form',
      status: 'Disqualified',
      date: '2025-10-18',
      responseTimeHours: 30,
      requirement: {
        size: '4,500 sq ft',
        locations: ['Shoreditch'],
        budgetRange: 'Under £10k annual',
        timeline: '6+ months',
        notes: 'Early-stage studio exploring co-working alternatives.'
      },
      bant: { budget: 5, authority: 5, need: 5, timeline: 5 },
      bonus: { propertyFit: 2, sourceQuality: 0, companyProfile: 2 },
      propertyMatches: [
        { id: 'shoreditch-exchange', fit: 58 },
        { id: 'tides-arverne', fit: 55 },
        { id: 'principal-place', fit: 52 }
      ],
      alternatives: [
        { id: 'kings-cross-hub', fit: 50 },
        { id: 'one-canada', fit: 48 },
        { id: 'leadenhall', fit: 45 }
      ],
      qualificationStatus: ['Budget insufficient', 'Authority limited']
    },
    {
      id: 'LD-010',
      reference: 'LD-010',
      contact: { name: 'Jamal Carter', email: 'jamal.carter@metrocapital.co', phone: '+44 20 7554 2211' },
      company: 'Metro Capital',
      source: 'Phone Call',
      status: 'Follow-up',
      date: '2025-11-05',
      responseTimeHours: 4.5,
      requirement: {
        size: '12,000 sq ft',
        locations: ['City Core', 'Mayfair'],
        budgetRange: '£25k-£49k annual',
        timeline: '1-3 months',
        notes: 'Private credit team seeking prestige floors.'
      },
      bant: { budget: 15, authority: 20, need: 15, timeline: 15 },
      bonus: { propertyFit: 5, sourceQuality: 2, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 82 },
        { id: 'leadenhall', fit: 78 },
        { id: 'one-canada', fit: 74 },
        { id: 'shard', fit: 72 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 68 },
        { id: 'tides-arverne', fit: 66 },
        { id: 'kings-cross-hub', fit: 60 }
      ],
      qualificationStatus: ['Budget approved', 'Need validated']
    },
    {
      id: 'LD-011',
      reference: 'LD-011',
      contact: { name: 'Eva Klein', email: 'eva.klein@polar-logix.com', phone: '+44 20 6006 9812' },
      company: 'Polar Logix',
      source: 'Email',
      status: 'Proposal Sent',
      date: '2025-10-27',
      responseTimeHours: 2.8,
      requirement: {
        size: '19,000 sq ft',
        locations: ['Canary Wharf'],
        budgetRange: '£50k-£99k annual',
        timeline: '1 month',
        notes: 'Logistics software player adding London command centre.'
      },
      bant: { budget: 20, authority: 20, need: 20, timeline: 20 },
      bonus: { propertyFit: 8, sourceQuality: 3, companyProfile: 3 },
      propertyMatches: [
        { id: 'one-canada', fit: 92 },
        { id: '99-bishopsgate', fit: 86 },
        { id: 'leadenhall', fit: 82 },
        { id: 'principal-place', fit: 78 }
      ],
      alternatives: [
        { id: 'shard', fit: 74 },
        { id: 'tides-arverne', fit: 70 },
        { id: 'kings-cross-hub', fit: 66 }
      ],
      qualificationStatus: ['Budget confirmed', 'Tech lead involved']
    },
    {
      id: 'LD-012',
      reference: 'LD-012',
      contact: { name: 'Ben Jarvis', email: 'b.jarvis@northstar.solutions', phone: '+44 20 7555 3200' },
      company: 'Northstar Solutions',
      source: 'Cold Outreach',
      status: 'Unqualified',
      date: '2025-10-15',
      responseTimeHours: 40,
      requirement: {
        size: 'Unknown',
        locations: ['City Core'],
        budgetRange: 'Unknown',
        timeline: 'Unknown',
        notes: 'Initial exploration. Needs discovery workshop.'
      },
      bant: { budget: 0, authority: 5, need: 0, timeline: 0 },
      bonus: { propertyFit: 0, sourceQuality: 0, companyProfile: 2 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 60 },
        { id: 'one-canada', fit: 58 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 55 },
        { id: 'tides-arverne', fit: 50 }
      ],
      qualificationStatus: ['Awaiting intake form']
    },
    {
      id: 'LD-013',
      reference: 'LD-013',
      contact: { name: 'Clara Mendes', email: 'clara@aetherlabs.io', phone: '+44 20 3899 7788' },
      company: 'Aether Labs',
      source: 'Broker Referral',
      status: 'New',
      date: '2025-11-11',
      responseTimeHours: 1,
      requirement: {
        size: '24,000 sq ft',
        locations: ['Southwark', 'City Core'],
        budgetRange: '£100k+ annual',
        timeline: 'Immediate',
        notes: 'Biotech unicorn establishing European HQ + lab suites.'
      },
      bant: { budget: 25, authority: 25, need: 25, timeline: 25 },
      bonus: { propertyFit: 10, sourceQuality: 5, companyProfile: 5 },
      propertyMatches: [
        { id: 'shard', fit: 97 },
        { id: '99-bishopsgate', fit: 92 },
        { id: 'leadenhall', fit: 90 },
        { id: 'one-canada', fit: 86 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 80 },
        { id: 'tides-arverne', fit: 76 },
        { id: 'kings-cross-hub', fit: 74 }
      ],
      qualificationStatus: ['Budget secured', 'Global exec sponsor', 'Need critical']
    },
    {
      id: 'LD-014',
      reference: 'LD-014',
      contact: { name: 'Yusuf Ibrahim', email: 'y.ibrahim@stratusrisk.com', phone: '+44 20 8899 1100' },
      company: 'Stratus Risk',
      source: 'Phone Call',
      status: 'In Qualification',
      date: '2025-11-07',
      responseTimeHours: 3.8,
      requirement: {
        size: '14,000 sq ft',
        locations: ['City Core'],
        budgetRange: '£50k-£99k annual',
        timeline: '2 months',
        notes: 'Insurance analytics team upgrading from serviced offices.'
      },
      bant: { budget: 20, authority: 20, need: 15, timeline: 20 },
      bonus: { propertyFit: 8, sourceQuality: 2, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 90 },
        { id: 'leadenhall', fit: 86 },
        { id: 'one-canada', fit: 80 }
      ],
      alternatives: [
        { id: 'shard', fit: 78 },
        { id: 'principal-place', fit: 72 },
        { id: 'tides-arverne', fit: 70 }
      ],
      qualificationStatus: ['Budget approved', 'Need defined']
    },
    {
      id: 'LD-015',
      reference: 'LD-015',
      contact: { name: 'Natalie Summers', email: 'natalie@northwind.studio', phone: '+44 20 9011 2233' },
      company: 'Northwind Studio',
      source: 'Web Form',
      status: 'Nurture',
      date: '2025-10-29',
      responseTimeHours: 12,
      requirement: {
        size: '9,000 sq ft',
        locations: ['Shoreditch', 'Southwark'],
        budgetRange: '£25k-£49k annual',
        timeline: '4 months',
        notes: 'Digital production studio evaluating flexible leases.'
      },
      bant: { budget: 15, authority: 15, need: 10, timeline: 10 },
      bonus: { propertyFit: 5, sourceQuality: 3, companyProfile: 2 },
      propertyMatches: [
        { id: 'principal-place', fit: 75 },
        { id: 'shoreditch-exchange', fit: 72 },
        { id: 'tides-arverne', fit: 70 }
      ],
      alternatives: [
        { id: 'shard', fit: 66 },
        { id: 'one-canada', fit: 62 },
        { id: 'kings-cross-hub', fit: 60 }
      ],
      qualificationStatus: ['Creative lead engaged']
    },
    {
      id: 'LD-016',
      reference: 'LD-016',
      contact: { name: 'Victor Lang', email: 'victor.lang@solarray.com', phone: '+44 20 3111 7780' },
      company: 'Solar Ray',
      source: 'Email',
      status: 'Nurture',
      date: '2025-10-20',
      responseTimeHours: 22,
      requirement: {
        size: '6,000 sq ft',
        locations: ['Southwark'],
        budgetRange: '£10k-£24k annual',
        timeline: '6 months',
        notes: 'Cleantech satellite office exploring incentives.'
      },
      bant: { budget: 10, authority: 10, need: 10, timeline: 5 },
      bonus: { propertyFit: 2, sourceQuality: 2, companyProfile: 2 },
      propertyMatches: [
        { id: 'tides-arverne', fit: 65 },
        { id: 'shoreditch-exchange', fit: 60 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 58 },
        { id: 'kings-cross-hub', fit: 55 }
      ],
      qualificationStatus: ['Need exploratory']
    },
    {
      id: 'LD-017',
      reference: 'LD-017',
      contact: { name: 'Stella Moreau', email: 'stella.moreau@skylytics.com', phone: '+44 20 7321 4500' },
      company: 'SkyLytics',
      source: 'Broker Referral',
      status: 'New',
      date: '2025-11-12',
      responseTimeHours: 1.4,
      requirement: {
        size: '30,000 sq ft',
        locations: ['City Core', 'Canary Wharf'],
        budgetRange: '£100k+ annual',
        timeline: 'Immediate',
        notes: 'Data infrastructure HQ with enhanced resilience spec.'
      },
      bant: { budget: 25, authority: 25, need: 25, timeline: 25 },
      bonus: { propertyFit: 10, sourceQuality: 5, companyProfile: 5 },
      propertyMatches: [
        { id: '99-bishopsgate', fit: 98 },
        { id: 'one-canada', fit: 94 },
        { id: 'leadenhall', fit: 92 },
        { id: 'shard', fit: 88 }
      ],
      alternatives: [
        { id: 'principal-place', fit: 84 },
        { id: 'tides-arverne', fit: 80 },
        { id: 'kings-cross-hub', fit: 78 }
      ],
      qualificationStatus: ['Exec sponsor engaged', 'Security cleared', 'Need critical']
    },
    {
      id: 'LD-018',
      reference: 'LD-018',
      contact: { name: 'Henry Walsh', email: 'henry@pilgrimfoods.co.uk', phone: '+44 20 4090 2211' },
      company: 'Pilgrim Foods',
      source: 'Email',
      status: 'In Qualification',
      date: '2025-11-03',
      responseTimeHours: 7.5,
      requirement: {
        size: '13,500 sq ft',
        locations: ['Canary Wharf', 'City Core'],
        budgetRange: '£25k-£49k annual',
        timeline: '3 months',
        notes: 'Food tech HQ with product show kitchen.'
      },
      bant: { budget: 15, authority: 20, need: 15, timeline: 15 },
      bonus: { propertyFit: 6, sourceQuality: 2, companyProfile: 3 },
      propertyMatches: [
        { id: 'one-canada', fit: 86 },
        { id: '99-bishopsgate', fit: 80 },
        { id: 'principal-place', fit: 78 }
      ],
      alternatives: [
        { id: 'tides-arverne', fit: 72 },
        { id: 'shoreditch-exchange', fit: 70 },
        { id: 'shard', fit: 68 }
      ],
      qualificationStatus: ['Budget reviewed', 'Need validated']
    }
  ];

  function buildProperties(refs) {
    return refs
      .map((ref) => {
        const property = PROPERTY_LIBRARY[ref.id];
        if (!property) return null;
        return {
          ...property,
          fit: ref.fit,
          actions: {
            view: 'Properties Detailed Card.html',
            proposal: 'Proposal Builder.html'
          }
        };
      })
      .filter(Boolean);
  }

  function determineGradeFromScore(score, hasUnknown = false) {
    if (hasUnknown) {
      const unqualified = gradeScale.find((grade) => grade.grade === 'U');
      return { ...unqualified, grade: 'U' };
    }
    for (const tier of gradeScale) {
      if (score >= tier.min) {
        return tier;
      }
    }
    return gradeScale[gradeScale.length - 1];
  }

  function computeLeadScores(lead) {
    lead.propertyMatches = buildProperties(lead.propertyMatches || []);
    lead.alternativeProperties = buildProperties(lead.alternatives || []);
    delete lead.alternatives;

    const bantScore = lead.bant.budget + lead.bant.authority + lead.bant.need + lead.bant.timeline;
    const bonusScore = lead.bonus.propertyFit + lead.bonus.sourceQuality + lead.bonus.companyProfile;
    const hasUnknown = Object.values(lead.bant).some((value) => value === 0);
    const gradeInfo = determineGradeFromScore(bantScore, hasUnknown);

    lead.bantScore = bantScore;
    lead.bonusScore = bonusScore;
    lead.totalScore = bantScore + bonusScore;
    lead.grade = gradeInfo.grade;
    lead.gradeInfo = gradeInfo;
    lead.priority = gradeInfo.priority;
    lead.hasUnknown = hasUnknown;
  }

  leadsSeed.forEach(computeLeadScores);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  }

  function getHotLeadCount() {
    return leadsSeed.filter((lead) => lead.grade === 'A').length;
  }

  function getConversionRate() {
    const converted = leadsSeed.filter((lead) => ['A', 'B'].includes(lead.grade)).length;
    return Math.round((converted / leadsSeed.length) * 100);
  }

  window.LEADS_DATA = leadsSeed;
  window.LEAD_UTILS = {
    gradeScale,
    determineGradeFromScore,
    formatDate,
    getHotLeadCount,
    getConversionRate,
    propertyLibrary: PROPERTY_LIBRARY
  };
})();

