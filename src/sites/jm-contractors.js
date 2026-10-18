// ─────────────────────────────────────────────────────────────
//  J M CONTRACTORS LTD: concept site for a pitch.
//
//  Confirmed from Companies House (company no. 06409626):
//    • Active private limited company, incorporated 25 October 2007
//    • Nature of business: construction of domestic buildings (SIC 41202)
//    • Registered office in Ampthill, Bedfordshire
//
//  Everything else below (services, wording, service area, phone) is a
//  proposal to confirm with the company before this goes live:
//    • The phone number is an Ofcom-reserved drama number (07700 900xxx).
//    • No email is set, so the form shows a "preview" message instead of sending.
//    • There are no reviews: add real ones to `testimonials` once you have them.
// ─────────────────────────────────────────────────────────────

const config = {
  company: {
    name: 'J M Contractors Ltd',
    short: 'JM',
    monogram: 'JM',
    tagline: 'Contractors Ltd',
    founded: 2007,
    phone: '07700 900461',
    email: '',
    address: 'Ampthill, Bedfordshire',
    city: 'Ampthill',
    serviceArea: ['Ampthill', 'Flitwick', 'Bedford', 'Woburn', 'Toddington', 'Shefford', 'Barton-le-Clay', 'Milton Keynes'],
    registration: 'Registered in England & Wales · Company No. 06409626',
    hours: '',
    formEndpoint: '',
    socials: {}
  },

  // Slate green and Bedfordshire brick: the county made a huge share of England's bricks
  // at Stewartby, a few miles from Ampthill.
  theme: {
    bg: '#F2F0EB',
    surface: '#FFFFFF',
    text: '#1C2421',
    accent: '#A3452B',
    dark: '#17211E',
    darkSurface: '#22302B',
    paper: '#E8E4DA',
    accentOnDark: '#DE8460'
  },

  units: 'metric',
  buildStyle: 'brick',
  concept: 'J M Contractors Ltd',

  hero: {
    model: 'house',
    eyebrow: 'Ampthill, Bedfordshire · Est. 2007',
    headline: 'Homes built properly.',
    rotating: ['Extensions', 'New Builds', 'Loft Conversions', 'Renovations', 'Garage Conversions'],
    sub: 'Building and extending homes around Ampthill and across Bedfordshire since 2007. One team takes your project from the first trench to the final handover.',
    image: '',
    trust: [
      ['shield', 'Limited company since 2007'],
      ['home', 'Domestic building specialists'],
      ['check', 'Clear, written quotes'],
      ['pin', 'Based in Ampthill']
    ]
  },

  credentials: [
    'J M Contractors Ltd',
    'Registered in England & Wales · No. 06409626',
    'Established 2007',
    'Domestic building specialists',
    'Ampthill · Bedfordshire',
    'Free site visits'
  ],

  stats: [
    { value: 2007, plain: true, label: 'Year established' },
    { value: 'years', suffix: '+', label: 'Years building homes' },
    { text: 'Ampthill', label: 'Based in Bedfordshire' }
  ],

  about:
    'We build homes, not sales pitches. Since 2007 J M Contractors has done one thing: domestic building work, done properly. You get a clear written quote, one point of contact from start to finish, and a site we keep tidy because we know you live next to it.',

  services: [
    { icon: 'plus', title: 'Extensions', text: 'Single and two-storey extensions, from open-plan kitchen-diners to extra bedrooms.' },
    { icon: 'home', title: 'New Builds', text: 'New homes and replacement dwellings, built from the foundations up.' },
    { icon: 'stairs', title: 'Loft Conversions', text: 'Dormer, hip-to-gable and roof-light lofts that add bedrooms without moving house.' },
    { icon: 'hammer', title: 'Renovations', text: 'Whole-house refurbishments, structural alterations and knock-throughs.' },
    { icon: 'roof', title: 'Garage Conversions', text: 'Turn the garage into a home office, gym or annexe with insulation and building control sign-off.' },
    { icon: 'layers', title: 'Groundworks & Brickwork', text: 'Foundations, drainage, driveways and garden walls laid to last.' }
  ],

  servicesTitle: 'From foundations to finishing touches.',
  servicesLead: 'One team for the whole job: one contract, one point of contact and one standard of work.',
  quoteLead: 'Tell us what you’re planning and we’ll call you back to arrange a free site visit.',

  projectsLabel: 'What we build',
  projectsTitle: 'Work we take on.',
  // type picks the drawing: house | extension | loft | interior
  // `location` is the subtitle; `size` and `year` fill the drawing's title block.
  projects: [
    { title: 'Rear & side extensions', type: 'extension', location: 'Kitchen-diners, family rooms and garden rooms', size: '15–40 m²', year: 'Typ. 10–14 wks', category: 'Extension', image: '' },
    { title: 'New-build homes', type: 'house', location: 'Self-builds and replacement dwellings', size: '2–4 bed', year: 'Typ. 6–9 months', category: 'New build', image: '' },
    { title: 'Loft conversions', type: 'loft', location: 'Dormer, hip-to-gable and roof-light lofts', size: '1–2 rooms + bath', year: 'Typ. 6–8 wks', category: 'Loft', image: '' },
    { title: 'Kitchens & renovations', type: 'interior', location: 'Full refurbishments while you live at home', size: 'Any size', year: 'Typ. 3–6 wks', category: 'Renovation', image: '' }
  ],

  process: [
    { title: 'Site visit', text: 'We come out, listen to what you want and measure up. No charge, no obligation.' },
    { title: 'Written quote', text: 'A detailed quote with clear stages and payment terms, so you know the cost before we start.' },
    { title: 'Build', text: 'One site lead from start to finish, regular updates, and a tidy site at the end of every day.' },
    { title: 'Handover', text: 'A final walk-round together, building control sign-off, and all the paperwork handed over.' }
  ],

  budgets: ['Under £20k', '£20k – £50k', '£50k – £100k', '£100k+'],
  phonePlaceholder: '07123 456789',

  // Shown instead of reviews until real testimonials are added
  reasons: [
    { icon: 'clock', title: 'Established 2007', text: 'A registered limited company that has focused on domestic building since October 2007.' },
    { icon: 'home', title: 'Homes only', text: 'Extensions, new builds and conversions. Your project is the kind of job we do every day.' },
    { icon: 'check', title: 'No surprises on price', text: 'A clear written quote with the work broken into stages before anything starts.' },
    { icon: 'pin', title: 'Local to you', text: 'Based in Ampthill, so we are close by for site visits, deliveries and aftercare.' }
  ],
  reasonsTitle: 'Why homeowners choose JM.',

  testimonials: [],

  seo: {
    title: 'J M Contractors Ltd · Builders in Ampthill, Bedfordshire',
    description: 'Domestic builders in Ampthill, Bedfordshire since 2007: extensions, new builds, loft conversions, renovations and garage conversions. Free site visits and written quotes.'
  }
};

export default config;
