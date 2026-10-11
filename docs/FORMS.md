# Forms

There are four forms: the campaign inquiry (`/for-businesses/#inquiry`), plus business, creator and partner forms on `/contact/`.

All of them have:
- Accessible labels, inline errors and focus moving to the first invalid field.
- A hidden honeypot field for basic spam protection.
- A required privacy-consent checkbox.
- A live-region status message.

## Delivery: FormSubmit → two inboxes

Submissions are sent with `fetch` (JSON) to [FormSubmit](https://formsubmit.co/), which emails them. There's no server and no account. The settings live in `js/config.js`:

```js
forms: {
  business: 'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
  creator:  'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
  partner:  'https://formsubmit.co/ajax/pawan1985chd@gmail.com',
},
formCc: ['vikas1999chd@gmail.com'],
```

Each email goes to **pawan1985chd@gmail.com** with a copy (`_cc`) to **vikas1999chd@gmail.com**. Each submission also includes:
- `_subject`: "Cityfluence — new business inquiry", or the creator/partner equivalent.
- `_replyto`: the visitor's email, so you can reply directly.
- `_template: table`: a readable table layout.
- `inquiryType`, `page`, and every field from the form.

### One-time activation (required)

FormSubmit holds submissions until the inbox owner confirms it:

1. Submit any form once, on the live site or locally.
2. **pawan1985chd@gmail.com** receives an "Activate Form" email from FormSubmit. Click the link. Check the spam folder too.
3. Submit again. Both inboxes should now receive it.
4. FormSubmit then emails a **random string**. Replace the email address in the three URLs above with it (`https://formsubmit.co/ajax/<random-string>`), so the address isn't sitting in the site's code. Rebuild and deploy.

Until activation, FormSubmit answers `{"success":"false"}`. The site treats that as a failure and shows "Sorry, your message couldn't be sent", along with your phone and email. It never shows a false success.

### Notes

- The visitor's browser talks to FormSubmit directly. Their privacy terms apply, and the Privacy Policy names them.
- If spam becomes a problem, consider FormSubmit's captcha (`_captcha`), or move to a provider with stronger spam filtering (Formspree, Web3Forms, or a Cloudflare Worker). The site accepts any endpoint that takes JSON and returns 2xx.
- Automated tests must mock `formsubmit.co`. Real test submissions send real emails.
