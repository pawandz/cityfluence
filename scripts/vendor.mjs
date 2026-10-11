// Copies the pinned GSAP + Lenis builds from node_modules into js/vendor/
// so the deployed static site has no runtime CDN dependency.
import { copyFileSync, mkdirSync } from 'node:fs';

const files = [
  ['node_modules/gsap/dist/gsap.min.js', 'js/vendor/gsap.min.js'],
  ['node_modules/gsap/dist/ScrollTrigger.min.js', 'js/vendor/ScrollTrigger.min.js'],
  ['node_modules/lenis/dist/lenis.min.js', 'js/vendor/lenis.min.js'],
];

mkdirSync('js/vendor', { recursive: true });
for (const [from, to] of files) {
  copyFileSync(from, to);
  console.log(`vendored ${to}`);
}
