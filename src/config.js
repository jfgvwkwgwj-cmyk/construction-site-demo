// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE FOR EACH COMPANY.
//  Everything on the site (text, phone, services, projects,
//  colors, SEO) comes from here. Photos go in /public/images.
// ─────────────────────────────────────────────────────────────

const config = {
  company: {
    name: 'Ironline Builders',
    short: 'Ironline', // used in the logo + giant footer word
    tagline: 'General Contractors',
    founded: 2004,
    phone: '(555) 214-7800',
    email: 'office@ironlinebuilders.com',
    address: '1180 Foundry Rd, Springfield, ST 00000',
    city: 'Springfield',
    serviceArea: ['Springfield', 'Riverton', 'Oak Hill', 'Maple Grove', 'Eastport', 'Cedar Falls'],
    license: 'Lic. #GC-000000',
    hours: 'Mon–Fri 7am–6pm · Sat 8am–1pm',
    // Optional: a Formspree / Getform endpoint. If empty, the quote form opens the visitor's email app.
    formEndpoint: '',
    socials: { facebook: '#', instagram: '#', google: '#' }
  },

  theme: {
    // Light "paper" sections + deep navy sections, with brass as the accent.
    bg: '#F3F3EF', // page background (light)
    surface: '#FFFFFF', // cards on light sections
    text: '#0E1B2C', // navy ink
    accent: '#9A7438', // brass, readable on light backgrounds
    navy: '#0B1828', // dark sections (hero, estimate, footer)
    navySurface: '#12243A',
    paper: '#ECE9E1',
    brass: '#C9A267' // brighter brass for dark sections
  },

  hero: {
    eyebrow: 'General Contractor · Est. 2004',
    headline: 'Built right. Built to last.',
    rotating: ['Custom Homes', 'Commercial', 'Renovations', 'Additions', 'Concrete'],
    sub: 'From the first footing to the final walkthrough, one crew owns your project — on schedule, on budget, built to outlast the mortgage.',
    // Optional background photo, e.g. '/images/hero.jpg'. Leave empty for the animated blueprint.
    image: ''
  },

  stats: [
    { value: 20, suffix: '+', label: 'Years building' },
    { value: 640, suffix: '+', label: 'Projects completed' },
    { value: 98, suffix: '%', label: 'On-time delivery' },
    { value: 4.9, suffix: '★', decimals: 1, label: 'Average review' }
  ],

  about:
    'We are builders, not salespeople. Every job is run by a dedicated project lead, priced in writing before we break ground, and finished with the same care whether it is a back deck or a 40,000 square foot warehouse.',

  services: [
    { icon: 'home', title: 'Custom Homes', text: 'Ground-up residential builds designed around how you actually live.' },
    { icon: 'building', title: 'Commercial', text: 'Retail, office and light-industrial shells and tenant improvements.' },
    { icon: 'hammer', title: 'Renovations', text: 'Kitchens, baths and whole-home remodels without the chaos.' },
    { icon: 'plus', title: 'Additions', text: 'More room that looks like it was always part of the house.' },
    { icon: 'layers', title: 'Concrete & Foundations', text: 'Slabs, footings, driveways and retaining walls poured right.' },
    { icon: 'roof', title: 'Roofing & Exteriors', text: 'Roofing, siding and windows that stand up to every season.' }
  ],

  // type picks the blueprint drawing when no image is set: house | tower | warehouse | interior | bridge
  projects: [
    { title: 'Ridgeview Residence', type: 'house', location: 'Oak Hill', year: 2025, size: '4,200 sq ft', category: 'Custom Home', image: '' },
    { title: 'Foundry Office Block', type: 'tower', location: 'Downtown Springfield', year: 2024, size: '5 stories', category: 'Commercial', image: '' },
    { title: 'Eastport Logistics Hub', type: 'warehouse', location: 'Eastport', year: 2024, size: '38,000 sq ft', category: 'Industrial', image: '' },
    { title: 'Maple Grove Kitchen', type: 'interior', location: 'Maple Grove', year: 2025, size: 'Full remodel', category: 'Renovation', image: '' },
    { title: 'Cedar Creek Crossing', type: 'bridge', location: 'Cedar Falls', year: 2023, size: '120 ft span', category: 'Civil', image: '' }
  ],

  // Instant price calculator. Rates are per unit, before the finish multiplier. Tune per company.
  estimator: {
    note: 'Ballpark only, based on recent local jobs. Your exact price comes after a free site visit.',
    types: [
      { name: 'New Home', icon: 'home', service: 'Custom Homes', unit: 'sq ft', min: 1000, max: 6000, step: 100, default: 2400, low: 185, high: 260, weeksBase: 16, weeksPer1000: 6 },
      { name: 'Addition', icon: 'plus', service: 'Additions', unit: 'sq ft', min: 150, max: 1500, step: 25, default: 450, low: 210, high: 340, weeksBase: 6, weeksPer1000: 10 },
      { name: 'Remodel', icon: 'hammer', service: 'Renovations', unit: 'sq ft', min: 80, max: 3000, step: 10, default: 300, low: 120, high: 260, weeksBase: 3, weeksPer1000: 9 },
      { name: 'Commercial', icon: 'building', service: 'Commercial', unit: 'sq ft', min: 1500, max: 40000, step: 500, default: 8000, low: 140, high: 230, weeksBase: 14, weeksPer1000: 1.2 }
    ],
    finishes: [
      { name: 'Standard', mult: 0.9, hint: 'Durable builder-grade materials. Smart value.' },
      { name: 'Premium', mult: 1.15, hint: 'Upgraded fixtures, hardwood, quartz counters.' },
      { name: 'Luxury', mult: 1.55, hint: 'Custom millwork, stone, designer everything.' }
    ]
  },

  process: [
    { title: 'Site Visit', text: 'We walk the site with you, listen, and measure — free of charge.' },
    { title: 'Fixed Proposal', text: 'A detailed, line-item price in writing. No surprise change orders.' },
    { title: 'Build', text: 'One project lead, weekly photo updates, a clean jobsite every day.' },
    { title: 'Walkthrough', text: 'Final punch list together, then a written workmanship warranty.' }
  ],

  testimonials: [
    { quote: 'They finished our addition two weeks early and the site was cleaner than our driveway. Unreal.', name: 'Dana R.', role: 'Homeowner, Oak Hill' },
    { quote: 'Clear pricing, zero drama. They built our retail shell on a brutal timeline and hit every date.', name: 'Marcus T.', role: 'Owner, Foundry Coffee' },
    { quote: 'Third project with this crew. I don’t get quotes from anyone else anymore.', name: 'Priya S.', role: 'Property Manager' }
  ],

  seo: {
    title: 'Ironline Builders — General Contractors in Springfield',
    description: 'Licensed general contractor in Springfield building custom homes, commercial spaces, renovations and additions. Free on-site estimates.'
  }
};

export default config;
