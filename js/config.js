/**
 * Chandigarhcitylyf site configuration.
 *
 * Shared by the browser (ES module) and the Node build script.
 * Every value that is `null` is an OUTSTANDING PRODUCTION SETTING —
 * the UI degrades honestly (it never pretends something works) until set.
 * See README.md → "Production configuration checklist".
 */
export const siteConfig = {
  name: 'Chandigarhcitylyf',
  tagline: 'Where Chandigarh Connects.',
  supportingTagline: 'Local Stories. Real Creators. Bigger Impact.',

  // Final canonical origin (no trailing slash). Used for canonical URLs,
  // Open Graph and sitemap.xml. Update once the domain is registered.
  siteUrl: 'https://pawandz.github.io/cityfluence',

  // Path the site is served from. '/' for a custom domain,
  // '/<repo-name>/' for a GitHub Pages project URL. Only 404.html needs it,
  // every other page uses relative links.
  basePath: '/cityfluence/',

  // While true, a discreet "Preview build" notice is shown site-wide.
  previewBuild: true,

  // Official contact details, shown in the footer, /contact/, /info/,
  // structured data and form fallback messages. Phones are 10-digit Indian
  // mobile numbers; the +91 prefix is added automatically for tel: links.
  contact: {
    emails: ['pawan1985chd@gmail.com', 'vikas1999chd@gmail.com'],
    phones: ['9888881405', '9988328149'],
  },
  social: {
    instagram: null, // e.g. 'https://www.instagram.com/chandigarhcitylyf/'
    youtube: null,
  },

  // All forms post to FormSubmit (formsubmit.co), which emails each
  // submission to the first address and copies the others (formCc).
  // ACTIVATION: the first submission triggers a one-time "Activate Form"
  // email to pawan1985chd@gmail.com — click it, then submissions flow.
  // FormSubmit then emails a random string; replace the address in the URL
  // with it (…/ajax/<random-string>) to keep the inbox out of the source.
  forms: {
    business: 'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
    creator: 'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
    partner: 'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
    advertise: 'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
  },
  formCc: ['vikas1999chd@gmail.com'],

  // Optional serverless endpoint that returns verified creator metrics
  // (see serverless/instagram-business-discovery/). Never put tokens here.
  creatorsApiEndpoint: null,
  creatorsApiTimeoutMs: 6000,

  // Campaign packages: prices are configurable, never invented.
  // Set `from` to a number (INR) to display "From ₹X"; null shows "Custom quote".
  packages: {
    starter: { from: null },
    growth: { from: null },
    signature: { from: null },
  },
};
