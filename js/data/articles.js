/**
 * Stories & Guides — editorial content.
 *
 * Each article becomes a static page at /stories/<slug>/ via `npm run build:html`
 * and also powers the client-side archive filters.
 *
 * Body blocks: { type: 'p' | 'h2' | 'list' | 'quote' | 'note', text | items }
 * `sponsored` must be true for any paid placement — the template then shows
 * a disclosure. Dates are ISO (YYYY-MM-DD) and must be accurate.
 *
 * Facts used are general, long-established public information. Opening hours,
 * prices and event dates are intentionally NOT stated — verify before adding.
 */
export const CATEGORIES = [
  'City Guides',
  'Food Guides',
  'Creator Interviews',
  'Local Business',
  'Culture',
  'Events',
  'Case Studies',
  'For Creators',
  'For Businesses',
];

export const articles = [
  {
    slug: 'a-different-side-of-the-city-beautiful',
    title: 'A Different Side of the City Beautiful',
    category: 'City Guides',
    excerpt:
      'Beyond the postcard views: how to see Chandigarh’s best-known landmarks as a local would — slowly, on foot, and with a little context.',
    intro:
      'Chandigarh is often described in a single line — the planned city, the City Beautiful. Spend a weekend here and you notice something more interesting: a place where modernist architecture, gardens and everyday life sit unusually close together.',
    author: 'Chandigarhcitylyf Editorial',
    published: '2026-10-11',
    updated: '2026-10-11',
    readingTime: 5,
    image: 'assets/images/capitol.svg',
    imageAlt: 'Illustration of the sweeping concrete roof forms of the Capitol Complex under an afternoon sun',
    caption: 'Illustration inspired by the Capitol Complex. Photography to follow.',
    featured: true,
    sponsored: false,
    body: [
      { type: 'h2', text: 'Start at the Capitol Complex' },
      { type: 'p', text: 'The Capitol Complex in Sector 1 is the clearest expression of Le Corbusier’s vision for the city. The Legislative Assembly, Secretariat and High Court, together with the Open Hand Monument, form an ensemble that is part of “The Architectural Work of Le Corbusier”, inscribed as a UNESCO World Heritage Site in 2016.' },
      { type: 'p', text: 'Look for the details as much as the scale: raw concrete surfaces, deep sun-breakers and the way the buildings frame the Shivalik foothills behind them. Access arrangements change from time to time, so check the current visitor process before you go.' },
      { type: 'h2', text: 'Then walk into the Rock Garden' },
      { type: 'p', text: 'Nek Chand, a road inspector with the government’s public works department, began building his garden in secret in the late 1950s, using stones, broken ceramics and industrial waste collected from around the region. Once it was discovered by the authorities, it was opened to the public in 1976 rather than demolished.' },
      { type: 'p', text: 'Today it reads as a counterpoint to the Capitol’s order — winding, intimate, playful, and entirely handmade.' },
      { type: 'h2', text: 'Slow down at Sukhna Lake' },
      { type: 'p', text: 'Created in 1958 by damming the Sukhna Choe, a seasonal stream from the Shivaliks, Sukhna Lake is where the city goes to walk, run, meet and watch the light change. Early mornings belong to walkers; evenings are busier and more social.' },
      { type: 'quote', text: 'The landmarks are famous. The way people use them every day is what makes them Chandigarh.' },
      { type: 'h2', text: 'Finish among the roses' },
      { type: 'p', text: 'The Zakir Hussain Rose Garden in Sector 16, established in 1967, is one of the largest rose gardens in Asia and the home of the city’s annual Rose Festival. Even outside the festival it is one of the most peaceful green spaces at the centre of the city.' },
      { type: 'list', items: [
        'Capitol Complex — architecture and the Open Hand Monument.',
        'Rock Garden — Nek Chand’s handmade sculptural landscape.',
        'Sukhna Lake — the city’s favourite promenade.',
        'Rose Garden — a calm, central green space.',
      ] },
      { type: 'note', text: 'We deliberately do not list timings or ticket prices here. They change — always check the official source before visiting.' },
    ],
  },
  {
    slug: 'reading-the-sector-grid',
    title: 'Reading the Sector Grid: A Beginner’s Guide to Chandigarh’s Plan',
    category: 'Culture',
    excerpt:
      'Sectors, “V” roads and green belts: the simple logic behind how Chandigarh is laid out — and why it still shapes daily life.',
    intro:
      'New to Chandigarh? The city’s layout can feel abstract at first. Once you understand a few principles behind the plan, finding your way — and understanding the city’s character — becomes much easier.',
    author: 'Chandigarhcitylyf Editorial',
    published: '2026-10-11',
    updated: '2026-10-11',
    readingTime: 4,
    image: 'assets/images/sector-grid.svg',
    imageAlt: 'Abstract illustration of a rectangular street grid with green belts and numbered sectors',
    caption: 'An abstract map illustration of the sector system.',
    featured: false,
    sponsored: false,
    body: [
      { type: 'h2', text: 'A city designed from scratch' },
      { type: 'p', text: 'Chandigarh was planned after Partition as a new capital for Punjab. Early plans were drawn up by the American planner Albert Mayer with architect Matthew Nowicki; after Nowicki’s death in 1950, Le Corbusier took over, working with Pierre Jeanneret, Maxwell Fry and Jane Drew. Today Chandigarh is a Union Territory and serves as the capital of both Punjab and Haryana.' },
      { type: 'h2', text: 'Sectors are self-contained neighbourhoods' },
      { type: 'p', text: 'The city is divided into numbered sectors, most of them rectangles of roughly 800 by 1,200 metres. Each was intended to have homes, schools, shops and green space within walking distance, with a commercial street running through it. The original plan famously skipped the number 13.' },
      { type: 'h2', text: 'The hierarchy of roads' },
      { type: 'p', text: 'Le Corbusier’s plan organised movement through a hierarchy of roads — often called the “7 Vs” — ranging from fast arterial routes to neighbourhood streets and pedestrian paths. It is why major roads run along sector edges and the interiors feel calmer.' },
      { type: 'list', items: [
        'Sector 1 holds the Capitol Complex at the head of the city.',
        'Sector 17 is the city centre, with its pedestrian plaza.',
        'Leisure Valley threads green space through several sectors.',
      ] },
      { type: 'p', text: 'Understanding the grid also explains why local recommendations are so often given by sector number — “the café in 35”, “the market in 8”. It is the city’s shared language.' },
    ],
  },
  {
    slug: 'tricity-explained',
    title: 'Tricity, Explained: Chandigarh, Mohali and Panchkula',
    category: 'City Guides',
    excerpt:
      'Three cities, two states and one Union Territory. A quick guide to how the Tricity fits together.',
    intro:
      'Locals talk about the “Tricity” as one place — and in daily life it often is. Officially, though, Chandigarh, Mohali and Panchkula sit under three different administrations.',
    author: 'Chandigarhcitylyf Editorial',
    published: '2026-10-11',
    updated: '2026-10-11',
    readingTime: 3,
    image: 'assets/images/sukhna.svg',
    imageAlt: 'Illustration of a calm lake with layered Shivalik hills on the horizon',
    caption: 'Illustration inspired by Sukhna Lake and the Shivalik foothills.',
    featured: false,
    sponsored: false,
    body: [
      { type: 'h2', text: 'Chandigarh' },
      { type: 'p', text: 'A Union Territory administered by the central government, and the shared capital of Punjab and Haryana. Home to the Capitol Complex, Sector 17, Sukhna Lake and the Rock Garden.' },
      { type: 'h2', text: 'Mohali (SAS Nagar)' },
      { type: 'p', text: 'Officially Sahibzada Ajit Singh Nagar, Mohali lies to the west in Punjab. It has grown quickly as a residential, education and IT hub, and has its own café and food scene.' },
      { type: 'h2', text: 'Panchkula' },
      { type: 'p', text: 'To the east in Haryana, Panchkula sits closer to the Shivalik foothills, making it a natural starting point for weekend drives into the hills.' },
      { type: 'note', text: 'For businesses, this matters: audiences move freely across all three, so a well-chosen local creator can reach the whole Tricity.' },
    ],
  },
  {
    slug: 'working-with-creators-without-wasting-budget',
    title: 'How Local Businesses Can Work With Creators Without Wasting Budget',
    category: 'For Businesses',
    excerpt:
      'A practical checklist for cafés, studios and local brands planning their first creator collaboration.',
    intro:
      'Creator marketing works best when it is treated like any other investment: clear objectives, the right partners, honest disclosure and a realistic way to judge results.',
    author: 'Chandigarhcitylyf Editorial',
    published: '2026-10-11',
    updated: '2026-10-11',
    readingTime: 6,
    image: 'assets/images/cafe.svg',
    imageAlt: 'Top-down illustration of a coffee cup and pastry on a café table',
    caption: 'Illustration.',
    featured: false,
    sponsored: false,
    body: [
      { type: 'h2', text: '1. Decide what success means' },
      { type: 'p', text: 'Footfall for a new café, bookings for a studio, awareness for a launch — each needs a different kind of creator and content. Write down one primary objective before you contact anyone.' },
      { type: 'h2', text: '2. Choose fit over follower count' },
      { type: 'p', text: 'A creator whose audience is genuinely local and whose style suits your brand will usually do more for a neighbourhood business than a bigger account with a scattered audience. Ask creators for audience location and recent performance data from their own platform insights.' },
      { type: 'h2', text: '3. Agree the details in writing' },
      { type: 'list', items: [
        'Deliverables: formats, number of posts, timelines.',
        'Usage rights: can you reuse the content in ads or on your website, and for how long?',
        'Approvals: how many rounds of feedback are included.',
        'Fees and what happens if a post is delayed.',
      ] },
      { type: 'h2', text: '4. Always disclose' },
      { type: 'p', text: 'In India, the Advertising Standards Council of India (ASCI) guidelines for influencer advertising and the government’s endorsement guidelines require paid or gifted collaborations to be clearly disclosed with labels such as “#ad”, “#collab” or “Sponsored”. Disclosure protects your brand’s credibility as much as the creator’s.' },
      { type: 'h2', text: '5. Measure honestly' },
      { type: 'p', text: 'Use what you can actually observe: unique offer codes, booking sources, link clicks and the creator’s shared insights. Avoid judging a campaign on a single vanity metric.' },
      { type: 'note', text: 'This article is general information, not legal advice. Check the latest ASCI and government guidelines before launching a campaign.' },
    ],
  },
  {
    slug: 'build-a-media-kit-brands-read',
    title: 'Creators: How to Build a Media Kit Brands Actually Read',
    category: 'For Creators',
    excerpt:
      'One page, honest numbers, clear services. What local businesses look for when they review a creator.',
    intro:
      'Most local businesses spend less than a minute on a creator’s media kit. Make that minute count with clarity rather than decoration.',
    author: 'Chandigarhcitylyf Editorial',
    published: '2026-10-11',
    updated: '2026-10-11',
    readingTime: 4,
    image: 'assets/images/fashion.svg',
    imageAlt: 'Abstract editorial illustration with a figure silhouette, camera frame and lime accent shapes',
    caption: 'Illustration.',
    featured: false,
    sponsored: false,
    body: [
      { type: 'h2', text: 'Lead with who you are' },
      { type: 'p', text: 'Name, handle, niche and location in one line. Then a two-sentence description of the kind of content you make and who it is for.' },
      { type: 'h2', text: 'Share real, recent numbers' },
      { type: 'p', text: 'Use screenshots or exports from your platform’s own insights, with the date they were taken. Include audience location if a large share is in the Tricity — local businesses care about that more than total reach.' },
      { type: 'h2', text: 'Show three pieces of your best work' },
      { type: 'p', text: 'Pick work that matches the brand you are pitching. Link to the original posts so they can see the comments and context.' },
      { type: 'h2', text: 'Make services and terms easy to understand' },
      { type: 'list', items: [
        'What you offer: reels, photo sets, stories, event coverage.',
        'Typical turnaround times.',
        'Whether usage rights are included or priced separately.',
        'How brands should contact you.',
      ] },
      { type: 'quote', text: 'A clear, honest one-pager beats a beautiful twenty-page deck.' },
    ],
  },
];

export const sortedArticles = () =>
  [...articles].sort((a, b) => b.published.localeCompare(a.published) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
