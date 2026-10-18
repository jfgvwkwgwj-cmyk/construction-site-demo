// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE FOR EACH COMPANY.
//  Everything on the site (text, phone, services, projects,
//  colors, SEO) comes from here. Photos go in /public/images.
// ─────────────────────────────────────────────────────────────

const config = {
  company: {
    name: 'Ironline Builders',
    short: 'Ironline', // used in the logo + giant footer word
    tagline: 'Homes & Extensions',
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
    eyebrow: 'Residential Builder · Est. 2004',
    headline: 'Built right. Built to last.',
    rotating: ['Extensions', 'New Homes', 'Renovations', 'Loft Conversions', 'Kitchens & Baths'],
    sub: 'Extensions, new homes and renovations, built by one local crew from the first footing to the final walkthrough. On schedule, on budget, and built to outlast the mortgage.',
    // Optional background photo, e.g. '/images/hero.jpg'. Leave empty for the animated blueprint.
    image: ''
  },

  stats: [
    { value: 20, suffix: '+', label: 'Years building' },
    { value: 640, suffix: '+', label: 'Homes & extensions' },
    { value: 98, suffix: '%', label: 'On-time delivery' },
    { value: 4.9, suffix: '★', decimals: 1, label: 'Average review' }
  ],

  about:
    'We are builders, not salespeople. Every job is run by a dedicated project lead, priced in writing before we break ground, and finished with the same care whether it is a garden room or a brand-new family home.',

  services: [
    { icon: 'plus', title: 'Extensions', text: 'Single and double-storey extensions that look like they were always part of the house.' },
    { icon: 'home', title: 'New Homes', text: 'Custom family homes built from the ground up, designed around how you actually live.' },
    { icon: 'hammer', title: 'Renovations', text: 'Whole-home refurbishments and remodels, managed so you can keep living there.' },
    { icon: 'stairs', title: 'Loft & Garage Conversions', text: 'Turn unused space into bedrooms, offices and en-suites without moving house.' },
    { icon: 'bath', title: 'Kitchens & Bathrooms', text: 'Full kitchen and bathroom fit-outs: plumbing, electrics, tiling and finishing.' },
    { icon: 'roof', title: 'Roofing & Exteriors', text: 'Roofs, siding, windows and doors that stand up to every season.' }
  ],

  // type picks the blueprint drawing when no image is set: house | extension | loft | interior | tower | warehouse | bridge
  projects: [
    { title: 'Oak Hill Rear Extension', type: 'extension', location: 'Oak Hill', year: 2025, size: '450 sq ft', category: 'Extension', image: '' },
    { title: 'Ridgeview Family Home', type: 'house', location: 'Riverton', year: 2024, size: '2,800 sq ft', category: 'New Home', image: '' },
    { title: 'Cedar Lane Loft Conversion', type: 'loft', location: 'Cedar Falls', year: 2025, size: '2 bed + bath', category: 'Loft Conversion', image: '' },
    { title: 'Maple Grove Kitchen', type: 'interior', location: 'Maple Grove', year: 2024, size: 'Full remodel', category: 'Kitchen', image: '' }
  ],

  process: [
    { title: 'Site Visit', text: 'We walk the site with you, listen, and measure — free of charge.' },
    { title: 'Fixed Proposal', text: 'A detailed, line-item price in writing. No surprise change orders.' },
    { title: 'Build', text: 'One project lead, weekly photo updates, a clean jobsite every day.' },
    { title: 'Walkthrough', text: 'Final punch list together, then a written workmanship warranty.' }
  ],

  testimonials: [
    { quote: 'They finished our addition two weeks early and the site was cleaner than our driveway. Unreal.', name: 'Dana R.', role: 'Homeowner, Oak Hill' },
    { quote: 'They turned our loft into two bedrooms and a bathroom in six weeks, and we lived in the house the whole time.', name: 'Marcus T.', role: 'Homeowner, Riverton' },
    { quote: 'Third project with this crew. I don’t get quotes from anyone else anymore.', name: 'Priya S.', role: 'Homeowner, Maple Grove' }
  ],

  seo: {
    title: 'Ironline Builders — Extensions, New Homes & Renovations in Springfield',
    description: 'Local residential builder in Springfield for house extensions, new homes, loft conversions, kitchens and renovations. Free site visits and fixed written quotes.'
  }
};

export default config;
