import type { ImageMetadata } from 'astro';
import referralHero from '../assets/referral/hero.png';
import onboardingHero from '../assets/onboarding/hero.png';
import filterHero from '../assets/filter/hero.png';
import dockReferral from '../assets/home/dock-referral.png';
import dockOnboarding from '../assets/home/dock-onboarding.png';
import dockFilters from '../assets/home/dock-filters.png';

export interface CaseStudy {
  slug: string;
  /** exact Figma frame name and node id this page is built from (file "portfolio projects", Page 1) */
  figmaFrame: string;
  figmaNode: string;
  href: string;
  /** name in the desktop window's footer bar and dock tooltip */
  name: string;
  title: string;
  lead: string;
  highlight: string;
  accent: string;
  accentBg: string;
  hero: ImageMetadata;
  /** hero art box in design px: x, y, w (height follows the image) */
  heroBox: [number, number, number];
  heroAlt: string;
  dockIcon: ImageMetadata;
  meta: string[];
}

export const cases: CaseStudy[] = [
  {
    slug: 'referral',
    figmaFrame: 'refrreral case study',
    figmaNode: '709:13811',
    href: '/work/referral/',
    name: 'Refferal-Led growth',
    title: 'Refferal-Led growth',
    lead: 'Building a referral loop that contributed to ~ ',
    highlight: '30% of user acquisition',
    accent: '#cb30e0',
    accentBg: '#faf4f9',
    hero: referralHero,
    heroBox: [40, 340, 1000],
    heroAlt:
      'Illustration: a hand holds out the “Invite a friend & Earn” screen while a stretched arm reaches a boy who thinks “This feels worth sharing.”',
    dockIcon: dockReferral,
    meta: ['UI/UX Designer', 'Figma', '2025'],
  },
  {
    slug: 'onboarding',
    figmaFrame: 'Onboarding case study',
    figmaNode: '1016:1724',
    href: '/work/onboarding/',
    name: 'Onboarding Case Study',
    title: 'Onboarding Case Study',
    lead: 'First 60 Seconds That Matter ~ ',
    highlight: 'Simplifying onboarding for a complex algo product',
    accent: '#ff6b48',
    accentBg: '#ffebe6',
    hero: onboardingHero,
    heroBox: [40, 340, 1000],
    heroAlt: 'Illustration: the Returns Wealth splash screen next to a cow saying “Moo-ve over manual investing.”',
    dockIcon: dockOnboarding,
    meta: ['UI/UX Designer', 'Figma', '2025'],
  },
  {
    slug: 'filter-and-search',
    figmaFrame: 'filter and search case study',
    figmaNode: '1021:1988',
    href: '/work/filter-and-search/',
    name: 'Filter & search case studies',
    title: 'Filter & search case studies',
    lead: 'Redesigned algo discovery ~ ',
    highlight: '20% increase in activation within the first 5 minutes.',
    accent: '#ffa73d',
    accentBg: '#fff2e2',
    hero: filterHero,
    heroBox: [40, 340, 1080],
    heroAlt: 'Illustration: the Explore Algos screen with filter chips, and a girl sifting options through a colander.',
    dockIcon: dockFilters,
    meta: ['UI/UX Designer', 'Figma', '2026'],
  },
];

export const caseBySlug = (slug: string) => {
  const c = cases.find((c) => c.slug === slug);
  if (!c) throw new Error(`unknown case ${slug}`);
  return c;
};
