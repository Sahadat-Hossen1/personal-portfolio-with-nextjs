# Multi-Tenant SaaS Portfolio Platform — Comprehensive User Guide

Welcome to the **Multi-Tenant SaaS Portfolio Platform**. This platform enables professionals across various industries (Software Developers, Video Editors, Digital Marketers, and Healthcare Professionals) to create, manage, and showcase modern portfolios under their own custom URLs (`/p/[username]`), while providing administrators with a central Platform Control Plane (`/admin`).

---

## 📑 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Platform Roles & Access Levels](#2-platform-roles--access-levels)
3. [End-to-End User Journeys](#3-end-to-end-user-journeys)
   - [A. Registration & Onboarding](#a-registration--onboarding)
   - [B. Managing Your Portfolio (Creator Dashboard)](#b-managing-your-portfolio-creator-dashboard)
   - [C. Template Selection & Instant Switching](#c-template-selection--instant-switching)
   - [D. Publication & Visibility Control](#d-publication--visibility-control)
   - [E. Public Portfolio & Client Contact Flow](#e-public-portfolio--client-contact-flow)
   - [F. Superadmin Platform Control Plane](#f-superadmin-platform-control-plane)
   - [G. Secure Logout](#g-secure-logout)
4. [Templates Reference](#4-templates-reference)
5. [Feature Entitlements & Plan Tiers](#5-feature-entitlements--plan-tiers)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Automated Verification & Regression Testing](#7-automated-verification--regression-testing)

---

## 1. Architecture Overview

The platform strictly adheres to the core axiom: **DATA ≠ PRESENTATION**.

* **Data Layer**: All tenant content (Bio, Roles, Projects, Skills, Experiences, Contact info) is stored in a normalized database structure associated strictly with an `ownerId`.
* **Presentation Layer**: The portfolio data is dynamically rendered through one of four profession-specific templates based on `Profile.selectedTemplate`.
* **Platform Separation**:
  * **Platform Control Plane (`/admin`)**: Dedicated exclusively to system administration, tenant supervision, feature provisioning, and platform-wide analytics.
  * **Portfolio Management (`/dashboard`)**: Dedicated to individual creator content authoring and portfolio configuration.
  * **SaaS Landing Page (`/`)**: Public homepage presenting platform features, interactive static template previews, and pricing tiers.
  * **Tenant Portfolios (`/p/[username]`)**: Public-facing portfolio URLs dynamically resolved by unique username.

---

## 2. Platform Roles & Access Levels

| Role | Permitted Areas | Capabilities |
| :--- | :--- | :--- |
| **Guest / Visitor** | `/`, `/login`, `/register`, `/p/[username]` | Browse SaaS landing page, view published tenant portfolios, submit contact messages. |
| **Normal User (`role: "user"`)** | `/dashboard/*`, `/p/[username]` | Author profile, manage projects/skills/experience, view received messages, switch allowed templates, toggle publication. |
| **Superadmin (`role: "superadmin"`)** | `/admin/*`, `/dashboard/*`, `/p/[username]` | Full platform control plane access, manage all tenants, change plan tiers, grant template permissions, toggle feature overrides, suspend accounts, plus own creator portfolio. |

---

## 3. End-to-End User Journeys

### A. Registration & Onboarding

1. **Sign Up**:
   - Navigate to `/register` (or click **"Get Started Free"** on `/`).
   - Enter your **Full Name**, **Email**, and **Password**.
   - Select your initial **Profession** (Developer, Video Editor, Digital Marketer, or Doctor).
   - The platform automatically generates a normalized, collision-safe username (e.g., `alex-smith`, `alex-smith-2`) while preventing collisions with system reserved keywords.
2. **Onboarding Wizard**:
   - After registration, you are immediately routed to `/onboarding`.
   - Provide your **Short Bio**, **Location**, and optional **Availability Status**.
   - Click **"Complete Setup"** to atomically provision your profile and enter the Creator Dashboard.

---

### B. Managing Your Portfolio (Creator Dashboard)

All portfolio management happens within `/dashboard/*`:

* **Profile Management (`/dashboard/profile`)**:
  - Edit your display name, professional roles, bio paragraphs, and location.
  - Configure social links (GitHub, LinkedIn, Twitter/X, YouTube, Instagram, etc.).
  - Enter WhatsApp and Messenger contact numbers/links.
  - Toggle section visibility (e.g., enable/disable Hero, About, Skills, Projects, Experience, or Floating Chat).
* **Projects Showcase (`/dashboard/projects`)**:
  - Add, edit, or remove showcase projects.
  - Set project title, description, tags, GitHub link, live preview URL, and feature badges.
  - Reorder projects or highlight featured items.
* **Skills Management (`/dashboard/skills`)**:
  - Add technical and creative skills with proficiency ratings (0–100%).
  - Group skills with custom tags.
* **Experience Timeline (`/dashboard/experience`)**:
  - Add career history items, company names, job titles, start/end dates, and accomplishments.
* **Messages Inbox (`/dashboard/messages`)**:
  - View client inquiries submitted via your public portfolio contact form.
  - Read full message content, sender name, and email address.

---

### C. Template Selection & Instant Switching

1. Navigate to `/dashboard/settings`.
2. Locate the **"Template Selection"** section.
3. Choose any template currently permitted by your plan or superadmin entitlement.
4. Click **"Save Template"**.
5. Your public portfolio at `/p/[username]` immediately updates to the selected visual presentation without requiring any data re-entry.

---

### D. Publication & Visibility Control

The platform provides independent control over whether your portfolio is live:

1. Navigate to `/dashboard/settings`.
2. Locate the **"Portfolio Visibility"** section.
3. Toggle between:
   - **`Published`**: Portfolio is publicly accessible at `/p/[username]`, discoverable via `/sitemap.xml`, and indexed by search engines.
   - **`Unpublished`**: Portfolio returns a clean HTTP 404 ("Portfolio Not Found") to all public visitors, protecting draft content until you are ready to launch.

> **Note on Visibility Rules**:
> A public portfolio is ONLY visible if:
> `User.accountStatus === "active"` **AND** `Profile.publicationStatus === "published"`.
> If either condition is not met, the route returns an unpersonalized 404 response.

---

### E. Public Portfolio & Client Contact Flow

1. Click **"View Portfolio"** in your dashboard sidebar, or share your public link:
   ```text
   https://<your-domain>/p/<username>
   ```
2. Visitors can read your background, explore projects, inspect skills, and review experience timelines.
3. Visitors can submit inquiries through the contact form at the bottom of the page.
4. Inquiries are stored strictly under your `ownerId` and appear in `/dashboard/messages`. Client-supplied owner IDs are ignored to prevent IDOR attacks.

---

### F. Superadmin Platform Control Plane

*(Available only to authenticated users with `role: "superadmin"`)*

#### Accessing Platform Admin
* Superadmins will see a highlighted **"Platform Admin"** button in their dashboard sidebar.
* Alternatively, navigate directly to `/admin`.

#### Administrative Features:
1. **Executive Hub (`/admin`)**:
   - Platform KPI cards: Total Tenants, Active/Published Portfolios, Total Showcase Content, and Total Inquiries.
   - Real-time breakdown of Free vs. Premium accounts.
   - Recent tenant registrations table with direct management links.
2. **Tenant Directory (`/admin/users`)**:
   - Search tenants by name, email, or username.
   - Filter by account status (`active` vs `suspended`) or subscription plan (`free` vs `premium`).
   - **Edit Tenant Modal**:
     - Change plan tier (Free ⇄ Premium).
     - Update allowed templates (e.g., grant access to additional templates).
     - Configure granular **Feature Overrides** (e.g., grant `floating_chat` or `advanced_seo` to a Free user).
     - **Suspend / Reactivate Account**: Suspending an account instantly blocks the tenant's login, disables their public portfolio, and shuts off contact intake without destroying their data.
3. **Platform Analytics (`/admin/stats`)**:
   - Template adoption distribution charts.
   - Profession breakdown across the user base.
   - Total content creation statistics.
4. **Returning to Creator Mode**:
   - Click **"Return to My Portfolio Dashboard"** in the sidebar to switch from platform management back to personal portfolio authoring (`/dashboard`).

---

### G. Secure Logout

* Click **"Sign Out"** in either the `/dashboard` or `/admin` sidebar.
* The system executes `POST /api/auth/logout`, clearing both `portfolio_user_token` and `portfolio_admin_token` cookies with `maxAge: 0`.
* You are redirected safely to `/login`.

---

## 4. Templates Reference

| Template | Slug | Target Audience | Visual Style | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **Developer** | `developer` | Software Engineers, Full-Stack Devs | Dark terminal aesthetic, cyan/indigo accents | Syntax highlighting, GitHub badges, tech stack tags |
| **Video Editor** | `video-editor` | Video Creators, Motion Designers | Cinematic dark canvas, purple/gold accents | Video reel embeds, aspect ratio badges, visual project cards |
| **Digital Marketer** | `digital-marketer` | SEO Specialists, Growth Hackers | High-contrast modern SaaS, emerald/teal accents | KPI metric counters, ROI callouts, campaign case studies |
| **Doctor** | `doctor` | Healthcare Providers, Clinicians | Trust-first clinical light/soft-dark, blue accents | Consultation hours, specialty badges, clinic locations |

---

## 5. Feature Entitlements & Plan Tiers

The platform uses a centralized feature registry (`src/lib/entitlements/features.ts`):

| Feature Key | Description | Free Tier | Premium Tier |
| :--- | :--- | :---: | :---: |
| `projects` | Projects showcase creation and editing | ✅ Enabled | ✅ Enabled |
| `skills` | Skills matrix and categorization | ✅ Enabled | ✅ Enabled |
| `experience` | Career milestones and timeline | ✅ Enabled | ✅ Enabled |
| `messages` | Client inquiry inbox and notifications | ✅ Enabled | ✅ Enabled |
| `custom_sections`| Custom section visibility toggles | ❌ Gated | ✅ Enabled |
| `floating_chat` | WhatsApp / Messenger floating action widget | ❌ Gated | ✅ Enabled |
| `advanced_seo` | Custom meta tags and rich search previews | ❌ Gated | ✅ Enabled |

*Superadmins can override any feature key for any specific tenant via `/admin/users`.*

---

## 6. API Endpoints Reference

### Authentication & Session
* `POST /api/auth/register` — Create new tenant account and atomic profile.
* `POST /api/auth/login` — Authenticate with email/password; receives HTTP-only JWT cookie.
* `POST /api/auth/logout` — Clear all session cookies.
* `GET /api/auth/me` — Inspect current session identity.

### Tenant Portfolio Operations
* `GET / PUT /api/profile` — Fetch or update owner profile.
* `GET / PATCH /api/profile/publication` — Read or toggle publication state (`published` / `unpublished`).
* `GET / POST /api/projects` — List or create showcase projects.
* `PUT / DELETE /api/projects/[id]` — Edit or delete specific project.
* `GET / POST /api/skills` — List or create skills.
* `GET / POST /api/experiences` — List or create experience entries.
* `GET / PUT /api/messages` — Read received client inquiries.
* `POST /api/messages` — Public contact intake (requires valid `username`).

### Platform Control Plane (Superadmin Only)
* `GET /api/admin/users` — Paginated tenant list with search and filtering.
* `GET / PUT /api/admin/users/[id]` — Inspect or update tenant plan, allowed templates, overrides, and account status.
* `GET /api/admin/stats` — Platform-wide aggregation metrics and adoption figures.

---

## 7. Automated Verification & Regression Testing

The codebase includes an extensive suite of automated test scripts to ensure stability across releases:

```powershell
# Phase 19: Security Hardening & Platform Control Plane Unification (20/20)
npx tsx scripts/test-hardening-phase19.ts

# Phase 18: SaaS Landing Page & Template Showcase (18/18)
npx tsx scripts/test-landing-phase18.ts

# Phase 17: Portfolio Publication & Visibility Control (20/20)
npx tsx scripts/test-publication-phase17.ts

# Phase 16: Account Status & Suspension Enforcement (20/20)
npx tsx scripts/test-account-status-phase16.ts

# Phase 15: Feature Entitlements & Overrides (18/18)
npx tsx scripts/test-entitlements-phase15.ts

# Phase 14: Superadmin Platform Control Plane (18/18)
npx tsx scripts/test-superadmin-phase14.ts

# Phase 13: SEO, Dynamic OG Images & Sitemap (10/10)
npx tsx scripts/test-seo-phase13.ts

# Phase 12: Atomic Provisioning & Onboarding (10/10)
npx tsx scripts/test-phase12-architecture-verification.ts

# Phase 11: Multi-Tenant Public Routing & Contact Ownership (16/16)
npx tsx scripts/test-public-portfolio-phase11.ts

# Phase 10: Template Access Authorization & Resolver (24/24)
npx tsx scripts/test-template-access-phase10.ts

# Full TypeScript Compiler Check
npx tsc --noEmit

# Production Build
npm run build
```
