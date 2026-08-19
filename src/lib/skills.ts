/**
 * Gia-co-Design — Design Skill Presets
 *
 * Curated skill definitions that inject domain expertise into AI calls.
 * Skills are shareable via gzip+base64 encoded URLs (like share links).
 */

import { DesignSkill } from '../types';

// ---------------------------------------------------------------------------
// Built-in skill presets
// ---------------------------------------------------------------------------

export const BUILTIN_SKILLS: DesignSkill[] = [
  {
    id: 'skill-dashboard',
    name: 'Dashboard Expert',
    description: 'Data-rich dashboards with KPI cards, charts, tables, and sidebar navigation. Focuses on information hierarchy, data density, and professional SaaS aesthetics.',
    category: 'Dashboard',
    icon: '📊',
    systemPrompt: `You are a world-class dashboard UI designer. When generating designs:
- Use a sidebar navigation pattern with collapsible sections
- Include 4 KPI stat cards at the top with large numbers, trend indicators (% change), and subtle icons
- Use Chart.js-style chart containers (line charts, bar charts, donut charts) with realistic data
- Include a data table with sortable columns, status pills (Active/Pending/Inactive), and row hover states
- Use a professional SaaS color palette: neutral backgrounds (#f8f9fa / #1a1b1e), accent blue or indigo for primary actions
- Ensure all stat cards use consistent sizing (min-w-[200px]) and proper spacing (gap-4 or gap-6)
- Add subtle shadows (shadow-sm) and rounded corners (rounded-xl) to cards
- Include a header with breadcrumbs, search bar, and user avatar dropdown
- Make the layout responsive: sidebar collapses on tablet, stacks on mobile
- Use Tailwind CSS classes throughout`,
    tags: ['dashboard', 'charts', 'KPI', 'data', 'SaaS', 'analytics'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-mobile-app',
    name: 'Mobile App UI',
    description: 'Native-feeling mobile app screens with bottom tab bars, large touch targets, card-based layouts, and thumb-friendly navigation.',
    category: 'Mobile',
    icon: '📱',
    systemPrompt: `You are an expert mobile app UI designer. When generating designs:
- Design for 375px width (iPhone standard)
- Use bottom tab navigation (5 tabs max) with icons and labels
- Large touch targets (minimum 44px tap area)
- Card-based content layouts with generous padding (p-4 to p-6)
- Use a mobile-native color scheme: clean white/dark backgrounds, vibrant accent colors for CTAs
- Include realistic app elements: status bar space (h-12), notification badges, pull-to-refresh hints
- Use mobile patterns: swipeable cards, horizontal scroll sections, floating action buttons
- Typography: large headlines (text-2xl to text-3xl), body text (text-base), small labels (text-xs)
- Add subtle animations: fade-in for content, slide-up for modals
- Use proper spacing: 16px horizontal padding, 12px+ between interactive elements
- Include empty states and loading skeletons where appropriate
- Tailwind CSS only, no external libraries`,
    tags: ['mobile', 'app', 'iOS', 'Android', 'touch', 'native'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-landing-page',
    name: 'Landing Page Pro',
    description: 'High-converting landing pages with hero sections, social proof, feature grids, pricing tables, and strong CTAs. Marketing-focused design.',
    category: 'Marketing',
    icon: '🚀',
    systemPrompt: `You are a conversion-focused landing page designer. When generating designs:
- Start with a bold hero section: large headline (text-5xl to text-6xl), subheadline, dual CTA buttons (primary filled + secondary outline)
- Add social proof: logo cloud (6 company logos), testimonial cards with avatars and quotes, star ratings
- Feature grid: 3-column layout with icon + title + description cards
- Pricing table: 3 tiers (Basic/Pro/Enterprise) with the middle one highlighted as "Most Popular"
- Include a FAQ accordion section with smooth expand/collapse
- End with a final CTA section (newsletter signup or demo booking)
- Use a gradient hero background (subtle, not overwhelming)
- Color strategy: one primary accent color (blue, purple, or teal), neutral grays for text
- Add micro-interactions: button hover scale, card hover lift, smooth scroll between sections
- Use scroll-triggered fade-in animations for sections
- Responsive: single column on mobile, 2-col tablet, 3-col desktop
- Include a sticky header with transparent-to-solid scroll effect
- Tailwind CSS, clean semantic HTML`,
    tags: ['landing', 'marketing', 'SaaS', 'conversion', 'hero', 'pricing'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-e-commerce',
    name: 'E-Commerce Store',
    description: 'Product listings, shopping carts, product detail pages, and checkout flows. Clean product photography layout with conversion-optimized UI.',
    category: 'Commerce',
    icon: '🛒',
    systemPrompt: `You are an e-commerce UI specialist. When generating designs:
- Product grid: 2-4 columns with clean product cards (image placeholder, title, price, rating stars, Add to Cart button)
- Product detail page: large image area (left 60%), details panel (right 40%) with title, price, variant selectors (size/color swatches), quantity picker, Add to Cart + Buy Now buttons
- Shopping cart: item list with thumbnails, quantity +/- controls, subtotal per item, order summary sidebar with total, promo code input, Checkout button
- Use a clean, premium aesthetic: white backgrounds, subtle borders, refined typography
- Price display: large bold price, strikethrough original price, discount badge in red/green
- Include: breadcrumb navigation, product image carousel dots, wishlist heart icons
- Color palette: neutral base with one accent (black for luxury, green for organic, blue for tech)
- Trust signals: secure checkout badge, free shipping banner, return policy link
- Mobile: stacked layout, sticky Add to Cart bar at bottom
- Tailwind CSS, realistic placeholder content`,
    tags: ['ecommerce', 'shop', 'product', 'cart', 'checkout', 'store'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-data-viz',
    name: 'Data Visualization',
    description: 'Charts, graphs, data tables, and infographics. Focuses on clear data presentation with proper axes, legends, tooltips, and accessible color schemes.',
    category: 'Charts',
    icon: '📈',
    systemPrompt: `You are a data visualization expert. When generating designs:
- Create realistic SVG/HTML charts: line charts with multiple series, bar charts (vertical/horizontal), donut/pie charts, area charts, scatter plots
- Use proper chart conventions: labeled axes with units, grid lines, legends, data point markers
- Color palette for data: use a consistent 5-color categorical palette that is colorblind-friendly
- Include interactive-looking elements: hover highlights, tooltip-style labels on data points
- Data tables: sortable headers, alternating row colors, cell alignment (numbers right-aligned, text left-aligned)
- Dashboard layout: arrange 4-6 charts in a responsive grid with clear titles and subtitle descriptions
- Use realistic data: financial figures, user metrics, time-series data with actual dates
- Add summary statistics cards above charts (total, average, trend, comparison)
- Ensure proper spacing between chart elements (not cramped)
- Accessibility: sufficient contrast, pattern fills as alternative to color-only encoding
- Tailwind CSS for layout, inline SVG for chart rendering
- Do NOT use external chart libraries — draw charts with pure HTML/CSS/SVG`,
    tags: ['charts', 'data', 'visualization', 'graphs', 'analytics', 'SVG'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-motion-ux',
    name: 'Motion & Animation',
    description: 'Micro-interactions, page transitions, loading states, scroll animations, and animated UI components. Polished motion design.',
    category: 'Motion',
    icon: '✨',
    systemPrompt: `You are a motion design specialist for web UIs. When generating designs:
- Include CSS @keyframes animations for: fade-in, slide-up, scale-in, bounce, pulse, spin (loading)
- Design animated page transitions between states (e.g., card flip, slide carousel)
- Create animated loading states: skeleton screens with shimmer effect, progress bars, spinner variants
- Add hover animations: button scale (hover:scale-105), card lift (hover:-translate-y-1), icon rotation
- Design scroll-triggered animations: elements that fade/slide in as they enter viewport (use CSS animation with animation-delay)
- Include animated counters (numbers counting up), typing effects, or typewriter text
- Create animated navigation: hamburger menu morph to X, dropdown slide-down, tab indicator slide
- Design animated form states: input focus ring expansion, validation checkmark animation, error shake
- Use Tailwind's transition utilities (transition-all duration-300) and custom @keyframes in <style>
- Motion principles: ease-out for entries, ease-in for exits, 200-300ms for micro, 400-600ms for page transitions
- Every animation should feel purposeful — guide attention, provide feedback, or show state change
- Include both light and dark mode variants
- Pure CSS animations, no JavaScript animation libraries`,
    tags: ['animation', 'motion', 'transitions', 'micro-interactions', 'loading', 'CSS'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-form-design',
    name: 'Form & Input Design',
    description: 'Multi-step forms, login/signup flows, complex validation UI, file uploads, and accessible form patterns.',
    category: 'Forms',
    icon: '📝',
    systemPrompt: `You are a form UX specialist. When generating designs:
- Design multi-step forms with progress indicator (numbered steps with active/completed states)
- Login/signup forms: email + password fields, social login buttons (Google, GitHub, Apple), "or continue with" divider
- Complex form patterns: address fields (auto-complete style), date pickers, time selectors, color pickers
- Validation states: success (green border + checkmark), error (red border + message), warning (amber)
- Input styles: floating labels, prefix/suffix icons, character counters, password strength meter
- File upload: drag-and-drop zone with dashed border, file preview thumbnails, progress bars
- Accessible design: proper label associations, fieldset/legend for grouped inputs, aria-describedby for help text
- Use consistent spacing: 16px between fields, 24px between sections
- Button states: default, hover, focus, disabled, loading (spinner)
- Include helper text below inputs, inline validation messages, and required field indicators (asterisk)
- Responsive: single column on mobile, two-column on desktop for parallel fields
- Tailwind CSS, semantic HTML with proper form elements`,
    tags: ['forms', 'inputs', 'validation', 'login', 'signup', 'accessibility'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-admin-panel',
    name: 'Admin & Settings',
    description: 'Admin dashboards, settings pages, user management, and configuration panels. Clean CRUD interfaces with tables, modals, and forms.',
    category: 'Admin',
    icon: '⚙️',
    systemPrompt: `You are an admin panel UI designer. When generating designs:
- Settings page layout: left sidebar with setting categories (General, Security, Notifications, Billing, Team), right content area
- User management table: avatar, name, email, role badge, status indicator, last active, action menu (dropdown)
- CRUD operations: list view with filters/sort, create/edit modal form, delete confirmation dialog
- Include bulk actions toolbar (select all, delete selected, export)
- Role-based badges: Admin (red), Editor (blue), Viewer (gray), with subtle background colors
- Toggle switches for boolean settings with labels and descriptions
- Notification preferences: grouped checkboxes with category headers
- Billing section: current plan card, usage meters, invoice table, payment method display
- Clean data-dense layout: compact tables (py-2), smaller text (text-sm), efficient use of space
- Include empty states ("No users yet", "No invoices") with illustrations
- Modal patterns: centered overlay, header with close button, body scroll, footer with action buttons
- Use a neutral professional palette: slate grays, one accent color for primary actions
- Tailwind CSS, responsive (sidebar collapses to hamburger on mobile)`,
    tags: ['admin', 'settings', 'CRUD', 'table', 'dashboard', 'management'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-social-media',
    name: 'Social & Community',
    description: 'Social feeds, profile pages, comment threads, notification centers, and community platforms. Engagement-focused design.',
    category: 'Social',
    icon: '💬',
    systemPrompt: `You are a social platform UI designer. When generating designs:
- Feed layout: center-aligned content column (max-w-2xl), each post card with avatar, name, timestamp, content, image, action bar (like, comment, share, bookmark)
- Post creation: textarea with character count, media attachment buttons, audience selector dropdown
- Profile page: cover photo, avatar (overlapping cover), bio, stats (posts/followers/following), tab navigation (Posts/Media/Likes)
- Comment thread: nested replies with indentation, like/reply actions, "Show more replies" expand
- Notification center: grouped notifications (Today, This Week, Earlier), unread dot indicators, notification types (like, comment, follow, mention) with distinct icons
- Real-time indicators: "typing..." animation, online status dots (green), read receipts (double checkmarks)
- Engagement elements: animated like button (heart fill animation), retweet/repost with count, share sheet
- Use a modern social aesthetic: rounded cards, generous whitespace, vibrant accent colors
- Mobile-first: bottom navigation (Home, Search, Create, Notifications, Profile)
- Include dark mode variant with deep navy/black backgrounds
- Tailwind CSS, realistic mock content (names, timestamps, engagement counts)`,
    tags: ['social', 'feed', 'profile', 'comments', 'notifications', 'community'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
  {
    id: 'skill-presentation',
    name: 'Slides & Presentations',
    description: 'Slide decks, presentation layouts, speaker notes areas, and pitch deck designs. Clean visual hierarchy with impactful typography.',
    category: 'Presentation',
    icon: '🎯',
    systemPrompt: `You are a presentation/slide deck designer. When generating designs:
- Design at 16:9 aspect ratio (w-[960px] h-[540px] or proportional)
- Title slide: bold centered headline, subtitle, presenter name, date — with a dramatic background (gradient or large geometric shape)
- Content slides: clean layout with maximum 6 lines of text, use icons or illustrations to support key points
- Data slides: single large chart or metric that tells a story, minimal labels
- Comparison slides: two-column layout with clear visual separation (VS divider, before/after)
- Section divider slides: large number or icon + section title on a colored background
- Use dramatic typography: huge bold numbers, oversized quotes, minimal body text
- Color strategy: dark backgrounds with light text for impact, or light backgrounds with bold accent colors
- Include slide numbers in bottom-right corner
- Design for projection: high contrast, large text (minimum 24pt equivalent), no fine details
- Each slide should communicate ONE idea clearly
- Add subtle background patterns or geometric shapes for visual interest
- Tailwind CSS, self-contained HTML (each slide is a complete view)`,
    tags: ['slides', 'presentation', 'pitch', 'deck', 'speaker', 'keynote'],
    author: 'Gia',
    version: '1.0.0',
    downloads: 0,
    createdAt: Date.now(),
    isBuiltin: true,
  },
];

// ---------------------------------------------------------------------------
// Skill store — localStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'gia-design-skills';
const ACTIVE_SKILL_KEY = 'gia-active-skill';

function loadSkills(): DesignSkill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...BUILTIN_SKILLS];
    const saved: DesignSkill[] = JSON.parse(raw);
    // Merge: keep builtins (updated) + user skills
    const userSkills = saved.filter((s) => !s.isBuiltin);
    return [...BUILTIN_SKILLS, ...userSkills];
  } catch {
    return [...BUILTIN_SKILLS];
  }
}

function saveSkills(skills: DesignSkill[]) {
  const userSkills = skills.filter((s) => !s.isBuiltin);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userSkills));
}

let _skills: DesignSkill[] = loadSkills();

export function getAllSkills(): DesignSkill[] {
  return _skills;
}

export function getSkillById(id: string): DesignSkill | undefined {
  return _skills.find((s) => s.id === id);
}

export function getActiveSkill(): DesignSkill | null {
  try {
    const id = localStorage.getItem(ACTIVE_SKILL_KEY);
    if (!id) return null;
    return _skills.find((s) => s.id === id) || null;
  } catch {
    return null;
  }
}

export function setActiveSkill(skill: DesignSkill | null) {
  if (skill) {
    localStorage.setItem(ACTIVE_SKILL_KEY, skill.id);
  } else {
    localStorage.removeItem(ACTIVE_SKILL_KEY);
  }
}

export function addCustomSkill(skill: DesignSkill) {
  // Remove existing with same ID (replace)
  _skills = _skills.filter((s) => s.id !== skill.id);
  _skills.push(skill);
  saveSkills(_skills);
}

export function removeCustomSkill(id: string) {
  _skills = _skills.filter((s) => s.id !== id || s.isBuiltin);
  saveSkills(_skills);
  // If the removed skill was active, deactivate
  const active = getActiveSkill();
  if (active?.id === id) setActiveSkill(null);
}

export function duplicateSkill(id: string): DesignSkill | null {
  const original = _skills.find((s) => s.id === id);
  if (!original) return null;
  const copy: DesignSkill = {
    ...original,
    id: `skill-${Date.now()}`,
    name: `${original.name} (Copy)`,
    isBuiltin: false,
    author: 'Custom',
    downloads: 0,
    createdAt: Date.now(),
  };
  addCustomSkill(copy);
  return copy;
}

// ---------------------------------------------------------------------------
// Import / Export via shareable URLs
// ---------------------------------------------------------------------------

async function compressToBase64(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  // Use gzip compression via CompressionStream
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const compressed = await new Response(cs.readable).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

async function decompressFromBase64(b64: string): Promise<string> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const decompressed = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(decompressed);
}

export async function exportSkillAsUrl(skill: DesignSkill): Promise<string> {
  const payload = JSON.stringify({
    n: skill.name,
    d: skill.description,
    c: skill.category,
    i: skill.icon,
    p: skill.systemPrompt,
    r: skill.referenceHtml || '',
    t: skill.tags,
    a: skill.author,
    v: skill.version,
  });
  const compressed = await compressToBase64(payload);
  const base = window.location.origin + window.location.pathname;
  return `${base}#skill=${compressed}`;
}

export async function importSkillFromUrl(url: string): Promise<DesignSkill | null> {
  try {
    const hash = new URL(url).hash;
    const match = hash.match(/^#skill=(.+)$/);
    if (!match) return null;
    const json = await decompressFromBase64(match[1]);
    const data = JSON.parse(json);
    const skill: DesignSkill = {
      id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.n || 'Imported Skill',
      description: data.d || '',
      category: data.c || 'Custom',
      icon: data.i || '🎨',
      systemPrompt: data.p || '',
      referenceHtml: data.r || undefined,
      tags: data.t || [],
      author: data.a || 'Community',
      version: data.v || '1.0.0',
      downloads: 0,
      createdAt: Date.now(),
      isBuiltin: false,
    };
    addCustomSkill(skill);
    return skill;
  } catch (err) {
    console.warn('Failed to import skill from URL:', err);
    return null;
  }
}

// Check if the current URL contains a skill to import (on page load)
export function checkUrlForSkillImport(): DesignSkill | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#skill=')) return null;
  // Async import — caller should handle this
  return null; // Handled via importSkillFromUrl in App.tsx init
}

export async function importSkillFromCurrentUrl(): Promise<DesignSkill | null> {
  const hash = window.location.hash;
  if (!hash.startsWith('#skill=')) return null;
  const url = window.location.href;
  const skill = await importSkillFromUrl(url);
  if (skill) {
    // Clear the hash after importing
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  return skill;
}
