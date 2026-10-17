import { siteConfig } from './config.js';
import { creators } from './data/creators.js';
import { escapeHtml } from './components/render.js';
import { getLenis } from './animations.js';

/** Focus an element and bring it into view without fighting smooth scrolling. */
function focusInView(el) {
  const lenis = getLenis();
  if (!lenis) return el.focus();
  el.focus({ preventScroll: true });
  lenis.scrollTo(el, { offset: -160, duration: 0.8 });
}

const MESSAGES = {
  valueMissing: 'This field is required.',
  typeMismatch: { email: 'Enter a valid email address, like name@example.com.', url: 'Enter a full link starting with https://' },
  tooShort: (el) => `Please write at least ${el.minLength} characters.`,
  tooLong: (el) => `Please keep this under ${el.maxLength} characters.`,
  patternMismatch: (el) => el.dataset.patternMessage || 'Please check the format.',
  consent: 'Please confirm you agree so we can respond.',
};

function errorFor(el) {
  const v = el.validity;
  if (v.valid) return '';
  if (el.type === 'checkbox' && v.valueMissing) return MESSAGES.consent;
  if (v.valueMissing) return MESSAGES.valueMissing;
  if (v.typeMismatch) return MESSAGES.typeMismatch[el.type] ?? 'Please check this value.';
  if (v.tooShort) return MESSAGES.tooShort(el);
  if (v.tooLong) return MESSAGES.tooLong(el);
  if (v.patternMismatch) return MESSAGES.patternMismatch(el);
  return el.validationMessage;
}

function showError(el, message) {
  const field = el.closest('.field');
  let err = field?.querySelector('.field__error');
  if (!message) {
    el.removeAttribute('aria-invalid');
    if (err) err.remove();
    const describedBy = (el.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => !id.endsWith('-error'));
    describedBy.length ? el.setAttribute('aria-describedby', describedBy.join(' ')) : el.removeAttribute('aria-describedby');
    return;
  }
  if (!err) {
    err = document.createElement('p');
    err.className = 'field__error';
    err.id = `${el.id}-error`;
    field.append(err);
  }
  err.textContent = message;
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', err.id);
}

const fieldsOf = (form) => [...form.querySelectorAll('input, select, textarea')].filter((el) => el.name && el.name !== '_gotcha' && !el.readOnly);

function validate(form) {
  let firstInvalid = null;
  fieldsOf(form).forEach((el) => {
    // Trim whitespace-only answers so they count as empty.
    if ((el.tagName === 'TEXTAREA' || el.type === 'text') && el.value.trim() === '') el.value = '';
    const msg = errorFor(el);
    showError(el, msg);
    if (msg && !firstInvalid) firstInvalid = el;
  });
  return firstInvalid;
}

function setStatus(form, type, html) {
  const status = form.querySelector('[data-form-status]');
  status.className = `form__status is-${type}`;
  status.innerHTML = html;
  focusInView(status);
}

const contactLine = () => {
  const email = siteConfig.contact?.emails?.[0];
  const phone = siteConfig.contact?.phones?.[0]?.replace(/\D/g, '').slice(-10);
  const parts = [];
  if (email) parts.push(`email <a class="link-underline" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`);
  if (phone) parts.push(`call <a class="link-underline" href="tel:+91${phone}">+91 ${phone.slice(0, 5)} ${phone.slice(5)}</a>`);
  return parts.length ? ` You can ${parts.join(' or ')}.` : '';
};

async function submit(form) {
  const type = form.dataset.form;
  const endpoint = siteConfig.forms[type];
  const button = form.querySelector('[data-submit]');
  const label = form.querySelector('[data-submit-label]');
  const original = label.textContent;

  // Honeypot: bots fill hidden fields. Quietly stop without sending.
  if (form.elements._gotcha?.value) {
    form.reset();
    setStatus(form, 'success', '<strong>Thank you.</strong>');
    return;
  }

  if (!endpoint) {
    setStatus(
      form,
      'info',
      `<strong>Your details look good — but this form isn’t connected yet.</strong> Online submissions are being set up, so nothing has been sent. Please reach us directly instead.${contactLine()}`,
    );
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload._gotcha;
  payload._subject = `Chandigarhcitylyf — new ${type} inquiry`;
  payload._template = 'table';
  payload._captcha = 'false';
  if (siteConfig.formCc?.length) payload._cc = siteConfig.formCc.join(',');
  if (payload.email) payload._replyto = payload.email;
  payload.inquiryType = type;
  payload.page = location.href;

  button.classList.add('is-loading');
  button.setAttribute('aria-busy', 'true');
  label.textContent = 'Sending…';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // FormSubmit answers 200 with { success: "false" } until the inbox is activated.
    const body = await res.json().catch(() => ({}));
    if (body.success === false || body.success === 'false') {
      throw new Error(body.message || 'Not delivered');
    }
    form.reset();
    fieldsOf(form).forEach((el) => showError(el, ''));
    setStatus(form, 'success', '<strong>Thank you — your message has been sent.</strong> We read every inquiry and will reply if there’s a fit.');
  } catch {
    setStatus(form, 'error', `<strong>Sorry, your message couldn’t be sent.</strong> Please check your connection and try again.${contactLine()}`);
  } finally {
    button.classList.remove('is-loading');
    button.removeAttribute('aria-busy');
    label.textContent = original;
  }
}

function prefill() {
  const id = new URLSearchParams(location.search).get('creator');
  if (!id) return;
  const creator = creators.find((c) => c.id === id);
  if (!creator) return;
  document.querySelectorAll('[data-prefill="creator"]').forEach((el) => {
    el.value = creator.username ? `${creator.name} (@${creator.username})` : `${creator.name} [${creator.id}]`;
  });
}

function initTabs() {
  const tablist = document.querySelector('[data-tabs]');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const select = (name, focus = false) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) tab.focus();
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      select(tab.dataset.tab);
      const url = new URL(location.href);
      url.searchParams.set('type', tab.dataset.tab);
      history.replaceState(null, '', url);
    });
    tab.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (dir) { e.preventDefault(); select(tabs[(i + dir + tabs.length) % tabs.length].dataset.tab, true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0].dataset.tab, true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1].dataset.tab, true); }
    });
  });
  const requested = new URLSearchParams(location.search).get('type');
  select(tabs.some((t) => t.dataset.tab === requested) ? requested : tabs[0].dataset.tab);
}

export function initForms() {
  prefill();
  initTabs();
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = validate(form);
      if (invalid) {
        focusInView(invalid);
        return;
      }
      submit(form);
    });
    // Re-validate a field once the user leaves it, after a first attempt.
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.matches('[aria-invalid="true"]')) showError(el, errorFor(el));
    });
    form.addEventListener('change', (e) => {
      const el = e.target;
      if (el.matches('[aria-invalid="true"]')) showError(el, errorFor(el));
    });
  });
}
