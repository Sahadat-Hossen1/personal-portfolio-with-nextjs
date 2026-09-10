# 🚀 PortfolioOS — SaaS Portfolio Platform

> **From a single portfolio website → to a production-ready, multi-tenant SaaS platform.**

PortfolioOS is a SaaS platform for creating, customizing, publishing, and managing professional portfolio websites without requiring users to write code.

The platform is designed around a strict architectural principle:

> **DATA ≠ PRESENTATION**

User portfolio data is stored and resolved independently from profession-specific templates. Authentication, authorization, tenant isolation, entitlements, public rendering, and platform administration are treated as separate responsibilities.

---

## 📌 Project Status

| Area | Status |
|---|---|
| Core portfolio CMS | ✅ Complete |
| Authentication | ✅ Complete |
| Multi-tenant ownership | ✅ Complete |
| Public `/p/[username]` portfolios | ✅ Complete |
| Template registry/resolver | ✅ Complete |
| Developer template | ✅ Complete |
| Video Editor template | ✅ Complete |
| Digital Marketer template | ✅ Complete |
| Doctor template | ✅ Complete |
| SaaS onboarding/provisioning | ✅ Complete |
| SEO / OG / Sitemap / Robots / JSON-LD | ✅ Complete |
| Superadmin control plane | ✅ Complete |
| Feature entitlements | ✅ Complete |
| Account suspension / visibility | ✅ Complete |
| Portfolio publication lifecycle | ✅ Complete |
| SaaS landing page / showcase | ✅ Complete |
| Legacy decommissioning | ✅ Complete |
| Entitlement UX / plan awareness | ✅ Complete |
| Platform identity cleanup | ⏳ Next milestone |
| Admin page authorization hardening | ⏳ Planned |
| Public performance/scalability hardening | ⏳ Planned |
| Observability / reliability | ⏳ Planned |
| Billing / subscriptions | ⏳ Planned |
| Bangladesh payment gateway | ⏳ Planned |
| Production launch hardening | ⏳ Planned |

**Current milestone:** Phase 20 — **Approved & Locked**

The project is feature-rich and architecturally established, but it is **not yet considered production-ready for commercial launch**. The remaining phases focus on security hardening, identity purity, performance, observability, billing, payment verification, and final launch readiness.

---

# 🧭 Product Vision

PortfolioOS should ultimately become:

> **A Bangladesh-focused no-code professional portfolio SaaS where a user can create a professional portfolio, select a profession-specific template, publish it under a unique URL, receive inquiries, and optionally unlock premium capabilities.**

### Core user loop

```text
Register
   ↓
Onboarding
   ↓
Choose Profession
   ↓
Choose Template
   ↓
Fill Portfolio
   ↓
Customize
   ↓
Preview
   ↓
Publish
   ↓
Share / Search Engines
   ↓
Receive Leads
   ↓
Manage Leads
```

### Business loop

```text
Free User
   ↓
Uses platform
   ↓
Discovers premium feature
   ↓
Upgrade
   ↓
Local Payment
   ↓
Server Verification
   ↓
Subscription Activated
   ↓
Entitlements Updated
   ↓
Premium Feature Available
```

---

# 🏗️ Architecture at a Glance

```text
                    ┌─────────────────────┐
                    │     Public Visitor  │
                    └──────────┬──────────┘
                               │
                         /p/[username]
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Tenant Resolution   │
                    │ username → ownerId   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Owner-scoped Data   │
                    │ getPortfolioData... │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   PortfolioData     │
                    │ normalized contract │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Template Resolver   │
                    │ TEMPLATE_MAP        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         Developer       Video Editor     Digital Marketer
              │
              └──────────────┬─────────────────┘
                             ▼
                       Public Portfolio
```

### Dashboard / control plane

```text
User
 │
 ├── Dashboard
 │    ├── Profile
 │    ├── Projects
 │    ├── Skills
 │    ├── Experience
 │    ├── Messages
 │    ├── Settings
 │    └── Entitlements
 │
 └── Public Portfolio
      └── /p/[username]

Superadmin
 │
 └── Platform Control Plane
      ├── Users
      ├── Stats
      ├── Account Status
      ├── Plans
      ├── Feature Overrides
      └── Platform Monitoring
```

---

# 🔐 Core Architectural Rules

These rules are more important than any individual phase.

### 1. DATA ≠ PRESENTATION

Templates must never:

- query MongoDB directly
- perform authentication
- implement authorization
- contain tenant business rules
- decide who owns data

Templates receive normalized `PortfolioData` and render it.

### 2. User ownership is the tenant boundary

```text
User._id
   ↓
ownerId
   ↓
Profile / Project / Skill / SkillTag / Experience / Message
```

Do **not** introduce parallel identifiers such as:

```text
tenant_id
workspace_id
portfolio_user_id
```

unless a future architectural decision explicitly requires them.

### 3. Client input is never trusted for ownership

A client may provide:

```text
username
```

but must never be trusted to provide:

```text
ownerId
userId
role
plan
entitlements
```

The server resolves ownership.

### 4. Backend is the security boundary

Frontend feature locks are UX only.

The actual rule is:

```text
Request
  ↓
Authentication
  ↓
Authorization
  ↓
Entitlement resolution
  ↓
Business operation
```

### 5. Superadmin controls the platform, not normal tenant content

Superadmin responsibilities:

- platform access
- user lifecycle
- plans
- feature availability
- overrides
- platform monitoring

Normal portfolio content remains owner-scoped.

---

# 🗺️ Full Roadmap — Development → Production

```text
FOUNDATION
   │
   ├── Phase 1
   ├── Phase 2
   │
CORE APPLICATION
   │
   ├── Phase 3
   ├── Phase 4
   ├── Phase 5
   ├── Phase 6
   ├── Phase 7
   ├── Phase 8
   └── Phase 9
   │
TEMPLATE + MULTI-TENANCY
   │
   ├── Phase 10
   ├── Phase 11
   └── Phase 12
   │
PUBLIC PLATFORM + CONTROL PLANE
   │
   ├── Phase 13
   ├── Phase 14
   ├── Phase 15
   ├── Phase 16
   ├── Phase 17
   └── Phase 18
   │
HARDENING
   │
   ├── Phase 19
   └── Phase 20
   │
PRODUCTION READINESS
   │
   ├── Phase 21
   ├── Phase 22
   ├── Phase 23
   ├── Phase 24
   └── Phase 25+
   │
COMMERCIAL LAUNCH
   │
   ├── Billing
   ├── Local Payment
   ├── Subscription lifecycle
   ├── Production hardening
   └── Beta → Production
```

---

# 🧱 Phase-by-Phase History

> **Important:** Phases 1–2 are retained as historical foundation phases. The current architecture/governance is based on the later multi-tenant SaaS phases.

---

## Phase 1 — Initial Portfolio Foundation

### 🎯 Why

The project originally needed a working portfolio application before becoming a SaaS platform.

### Implemented

- Initial portfolio application
- Basic portfolio presentation
- Initial project/profile structure
- Initial frontend foundation

### Status

✅ **Complete / Historical Foundation**

---

## Phase 2 — Core Portfolio Data & Application Foundation

### 🎯 Why

The portfolio needed a reusable data structure before CRUD and SaaS concerns could be introduced.

### Implemented

- Core portfolio data model
- Initial application structure
- Portfolio content foundation
- Early data loading architecture

### Status

✅ **Complete / Historical Foundation**

> Later phases intentionally replaced unsafe single-tenant assumptions with owner-scoped multi-tenant architecture.

---

# 🔐 Phase 3 — Authentication Foundation

### 🎯 Why

A SaaS platform needs a reliable identity boundary before users can own portfolio data.

### Implemented

- User authentication
- JWT-based authentication
- Password hashing
- Authenticated user resolution
- Protected user workflows
- User identity foundation

### Architectural result

```text
Request
  ↓
JWT
  ↓
Authenticated User
  ↓
ownerId
```

### Status

✅ **Complete**

---

# 🛡️ Phase 4 — Authorization Foundation

### 🎯 Why

Authentication answers:

> “Who are you?”

Authorization answers:

> “What are you allowed to do?”

### Implemented

- Central authorization helpers
- User ownership checks
- Superadmin authorization
- Protected API operations
- Ownership-based access control

### Status

✅ **Complete**

---

# 📊 Phase 5 — Dashboard Foundation

### 🎯 Why

Users needed a private control surface to manage their portfolio.

### Implemented

- Dashboard shell
- Dashboard navigation
- Authenticated dashboard workflows
- Portfolio management structure
- Protected dashboard API interaction

### Status

✅ **Complete**

---

# 📁 Phase 6 — Developer Portfolio Template

### 🎯 Why

The platform needed the first profession-specific presentation layer.

### Implemented

- Developer template
- Navbar
- Hero
- About
- Skills
- Projects
- Experience
- Contact
- Footer
- Interactive visual elements
- Template-specific presentation

### Architecture decision

The developer template became a presentation layer rather than the application itself.

### Status

✅ **Complete**

---

# 🎬 Phase 7 — Video Editor Template

### 🎯 Why

The SaaS concept requires multiple profession-specific experiences rather than one generic portfolio.

### Implemented

- Video Editor template
- Cinematic navigation
- Showreel presentation
- Video project gallery
- Skills / post-production section
- Video modal/player experience
- Profession-specific visual language

### Status

✅ **Complete**

---

# 📈 Phase 8 — Digital Marketer Template

### 🎯 Why

Marketing professionals require a presentation model different from developers and video editors.

### Implemented

- Digital Marketer template
- Marketing-focused sections
- Profession-specific presentation
- Shared `PortfolioData` contract

### Status

✅ **Complete**

---

# 💬 Phase 9 — Messages / Contact Management

### 🎯 Why

A portfolio is not only a CV; it should help the owner receive opportunities and inquiries.

### Implemented

- Contact message model
- Message API
- Dashboard inbox
- Read/unread state
- Owner-scoped message management
- Message update/delete workflows

### Status

✅ **Complete**

---

# 🎨 Phase 10 — Template Access & Switching

### 🎯 Why

Templates needed to become a platform-level system instead of hardcoded page variations.

### Implemented

- Template registry
- Template map
- Template resolver
- `selectedTemplate`
- Template switching
- Admin/platform template control
- Developer / Video Editor / Digital Marketer template availability
- Later Doctor template integration

### Architecture

```text
Profile.selectedTemplate
          ↓
      Resolver
          ↓
     TEMPLATE_MAP
          ↓
      Template
```

### Status

✅ **Complete**

---

# 🌐 Phase 11 — Public Multi-Tenant Portfolio Routing

### 🎯 Why

This was the major transition from:

> “one portfolio application”

to:

> “many users, many portfolios, one platform.”

### Implemented

- Public route:

```text
/p/[username]
```

- Username resolution
- Owner-scoped data loading
- `getPortfolioDataByOwnerId()`
- Public template resolution
- Public 404 handling
- Contact recipient resolution
- Tenant-isolated messages
- Reserved username protection
- Removal of original creator identity leakage
- No public query-parameter template override
- Sensitive user data protection

### Critical security model

```text
username
   ↓
User._id
   ↓
ownerId
   ↓
PortfolioData
```

### Status

✅ **Complete**

---

# 🚪 Phase 12 — SaaS Landing, Registration & Atomic Onboarding

### 🎯 Why

The platform needed a true SaaS lifecycle:

```text
Visitor
 ↓
Landing Page
 ↓
Register
 ↓
Onboarding
 ↓
Portfolio
```

New users must receive a valid initial portfolio state without partial database provisioning.

### Implemented

- SaaS landing/register flow
- Onboarding
- Automatic portfolio provisioning
- User + zero-state profile creation
- Atomic provisioning / rollback protection
- Multi-tenant registration flow
- No `tenant_id` duplication
- Clean new-user state

### Status

✅ **Complete**

---

# 🔎 Phase 13 — Public SEO & Social Sharing

### 🎯 Why

Public portfolios must be discoverable and shareable.

A SaaS portfolio without tenant-correct SEO would create incorrect search/social identities.

### Implemented

- Dynamic page metadata
- SEO title
- SEO description
- Open Graph metadata
- Twitter/social metadata
- Canonical/public identity handling
- Dynamic sitemap
- Robots configuration
- JSON-LD structured data
- `Person`
- `ProfilePage`

### Architecture rule

SEO data must come from the current tenant.

```text
/p/alice
   ↓
Alice data
   ↓
Alice SEO

/p/bob
   ↓
Bob data
   ↓
Bob SEO
```

### Status

✅ **Complete**

---

# 👑 Phase 14 — Superadmin Platform Control Plane

### 🎯 Why

A SaaS platform needs a platform operator separate from normal portfolio owners.

### Implemented

- Superadmin role
- `/admin`
- User management
- Platform statistics
- Platform overview
- User lifecycle controls
- Platform-level management
- Separation between tenant dashboard and platform administration

### Important principle

Superadmin is a **platform role**, not a shortcut to bypass tenant ownership.

### Status

✅ **Complete**

---

# 🧩 Phase 15 — Feature Entitlements & Overrides

### 🎯 Why

Once the platform becomes commercial, access cannot be hardcoded throughout the UI.

### Implemented

- Plans
- Feature definitions
- Feature entitlements
- User feature overrides
- Central entitlement resolver
- Plan defaults
- Override precedence
- Backend feature gating

### Current precedence

```text
Superadmin
    ↓
User Override
    ↓
Plan Default
```

### Status

✅ **Complete**

---

# 🚦 Phase 16 — Account Status & Visibility Foundation

### 🎯 Why

A real SaaS needs lifecycle controls.

Users may need to be:

```text
active
suspended
```

while portfolio publication has its own independent state.

### Implemented

- Account status
- Suspension controls
- Active state
- Lifecycle-aware access behavior
- Separation of account lifecycle from portfolio publication

### Status

✅ **Complete**

---

# 📢 Phase 17 — Portfolio Publication & Visibility

### 🎯 Why

Account status and public portfolio visibility are different concepts.

A user may be:

```text
Account: active
Portfolio: unpublished
```

or:

```text
Account: suspended
Portfolio: unavailable
```

### Implemented

- Publication state
- `published`
- `unpublished`
- Public visibility enforcement
- Separation between account status and publication status

### Status

✅ **Complete**

---

# 🏠 Phase 18 — SaaS Landing Page & Template Showcase

### 🎯 Why

The product needs to communicate value before registration.

### Implemented

- SaaS landing page
- Product positioning
- Template showcase
- Template discovery
- Public product experience
- Conversion-oriented entry point

### Status

✅ **Complete**

---

# 🧹 Phase 19 — Legacy Decommissioning & Security Hardening

### 🎯 Why

As the architecture evolved, legacy single-tenant/admin systems became dangerous technical debt.

Keeping two competing authorization systems creates:

- security ambiguity
- maintenance cost
- inconsistent behavior
- accidental bypass paths

### Implemented

- Removed legacy `Admin` model
- Removed legacy admin JWT flow
- Removed legacy admin auth helpers
- Removed legacy admin CMS routes
- Removed `/api/seed`
- Removed dormant unscoped portfolio loader
- Modern-only `/api/auth/me`
- Unified logout behavior
- Public contact security cleanup
- Rebuilt `/admin` as platform control plane
- Unified dashboard/admin separation

### Verification

- Phase 19 suite: **20/20**
- TypeScript: **0 errors**
- Production build: **passed**
- Earlier regression suites: **passed**

### Status

✅ **Approved & Locked**

---

# 💳 Phase 20 — Entitlement UX & Plan Awareness

### 🎯 Why

The entitlement engine existed, but users could not clearly understand:

- what plan they were on
- which features were premium
- why something was locked
- what upgrading would unlock

Backend entitlement logic without good UX creates confusion.

### Implemented

- Entitlements provider
- Plan badge
- Feature status cards
- Upgrade discovery modal
- Premium feature lock states
- Dashboard plan awareness
- Settings plan awareness
- Humanized entitlement errors
- `floating_chat` premium state
- `custom_sections` premium state
- `advanced_seo` premium state

### Important rule

No fake payment flow was introduced.

The UX explicitly communicates that self-service billing is not yet available.

### Verification

- Phase 20 tests: **10/10**
- Phase 15 tests: **18/18**
- Phase 19 tests: **20/20**
- TypeScript: **0 errors**

### Status

✅ **Approved & Locked**

---

# 🧭 Remaining Roadmap

The next phases are intentionally **not implemented yet**.

This is deliberate.

The platform already has a strong feature foundation. The next work should reduce production risk before adding commercial complexity.

---

# 🔥 Phase 21 — Platform Identity Remediation & Multi-Tenant SEO Purity

### Why this is next

The architecture is multi-tenant, but discovery identified residual single-tenant identity assumptions that can contaminate:

- public metadata
- JSON-LD
- profile defaults
- shared fallbacks
- public components

This is dangerous because a SaaS portfolio must never accidentally expose the original platform creator's identity as another tenant's identity.

### Planned work

Audit and remove remaining hardcoded identity from:

- root layout
- JSON-LD
- Profile defaults
- public data helpers
- public page
- sitemap
- robots
- Navbar/Footer
- shared public components
- initial/sample data paths

### Goal

```text
Tenant A → A identity
Tenant B → B identity
Tenant C → C identity
```

Never:

```text
Tenant B → original creator identity
```

### Status

⏳ **NOT IMPLEMENTED**

### Strong reason for leaving it incomplete

This is a security/data-integrity and SEO-purity concern. It should be completed before commercial launch because incorrect tenant identity can damage user trust and create incorrect search/social metadata.

---

# 🛡️ Phase 22 — Admin Page Authorization & Security Posture Hardening

### Why

API authorization is already strong, but the discovery found that some admin page-layer protection is weaker than the API layer.

### Planned work

- Server-side admin page authorization
- Superadmin-only page enforcement
- Consistent unauthorized handling
- Admin navigation protection
- Security regression tests
- Review all platform-control-plane routes

### Important principle

```text
UI hiding ≠ authorization
```

The server must enforce access.

### Status

⏳ **NOT IMPLEMENTED**

### Strong reason

A platform-control page should not depend only on client-side navigation or API protection. Defense in depth reduces accidental exposure and creates a cleaner security boundary.

---

# ⚡ Phase 23 — Public Portfolio Performance & Scalability

### Why

The public portfolio is the highest-traffic surface.

Every visitor potentially triggers:

```text
username lookup
+
profile query
+
projects query
+
skills query
+
tags query
+
experience query
```

The system must remain efficient as tenant count and traffic grow.

### Planned work

- Query optimization
- Compound indexes where justified
- Public rendering strategy review
- Caching/revalidation strategy
- Pagination where needed
- Message query pagination
- Image/performance review
- Avoid unnecessary dynamic rendering
- Measure before optimizing

### Important rule

Do not optimize based on guesses.

```text
Measure
 ↓
Identify bottleneck
 ↓
Optimize
 ↓
Measure again
```

### Status

⏳ **NOT IMPLEMENTED**

### Strong reason

Performance work should be based on real query/rendering behavior. Premature optimization can make the architecture more complex without solving an actual bottleneck.

---

# 📡 Phase 24 — Reliability, Observability & Production Operations

### Why

The application currently has limited observability.

Production failures need to answer:

```text
What failed?
Where?
For whom?
When?
Why?
```

### Planned work

- Structured logging
- Request/correlation IDs
- Error monitoring
- Production error tracking
- Health/readiness endpoint
- Database connectivity monitoring
- Operational dashboards
- Audit events for important platform actions
- Production-safe logging policy

### Status

⏳ **NOT IMPLEMENTED**

### Strong reason

A production SaaS cannot rely on `console.error()` alone. Observability is required to diagnose authentication failures, payment failures, tenant issues, and platform incidents.

---

# 💰 Phase 25+ — Commercialization & Billing

This phase should begin only after the security/performance/reliability foundation is sufficiently hardened.

---

## 💵 Recommended Initial Pricing Hypothesis

> **Pricing is a business hypothesis, not an architecture lock.**

### Free

```text
৳0
```

Potential capabilities:

- Account
- One portfolio
- Basic template access
- Core profile
- Projects
- Skills
- Experience
- Contact
- Basic SEO
- Public portfolio URL

### Premium

```text
৳199 / month
```

Potential capabilities:

- Premium templates/features
- Floating chat
- Advanced SEO
- Custom sections
- Additional premium capabilities as validated

### Annual

```text
৳1,990 / year
```

The exact price should be validated against:

- local market
- competitor pricing
- conversion
- operating cost
- payment fees
- support cost
- customer willingness to pay

---

# 🇧🇩 Bangladesh Payment Architecture

The platform should initially prioritize a Bangladesh-friendly payment provider rather than building the business around international payments.

A gateway such as **SSLCOMMERZ** can be evaluated as the primary gateway, subject to merchant onboarding, supported methods, fees, settlement rules, and production verification.

Potential payment methods may include:

- bKash
- Nagad
- Rocket
- Cards
- Internet banking

Exact supported methods must be confirmed during commercialization.

---

## 🔐 Correct Payment Flow

Never:

```text
Frontend says "Payment Success"
        ↓
Activate Premium
```

Instead:

```text
User
 ↓
Select Premium
 ↓
Create payment session/order
 ↓
Gateway
 ↓
User completes payment
 ↓
Gateway callback/webhook
 ↓
Server verifies payment
 ↓
Validate amount/order/status
 ↓
Persist Payment
 ↓
Update Subscription
 ↓
Resolve Entitlements
 ↓
Premium activated
```

### Critical security rule

> **Payment success must be server-authoritative.**

The frontend is not allowed to grant premium access.

---

# 🧾 Future Billing Domain

Commercialization will likely introduce concepts such as:

```text
Payment
Subscription
Plan
Invoice / Receipt
PaymentEvent
```

The relationship should be conceptually:

```text
Payment
   ↓
Subscription
   ↓
Plan
   ↓
Entitlement Resolver
   ↓
Feature Access
```

Billing should not be mixed directly into template components or random dashboard pages.

---

# 👑 Final Admin Capabilities

When the commercial platform is complete, the superadmin control plane should provide:

### User Management

- View users
- Search users
- Account status
- Suspend/activate
- Inspect plan
- Inspect entitlement state

### Platform Management

- Platform statistics
- Template availability
- Feature availability
- Plan configuration
- Feature overrides

### Billing

- Payments
- Subscriptions
- Payment status
- Failed payments
- Refund-related state where supported
- Revenue reporting
- Subscription lifecycle

### Operations

- Health
- Error monitoring
- Important audit events
- Platform activity

---

# 👤 Final User Capabilities

A normal user should eventually be able to:

### Account

- Register
- Login/logout
- Manage account

### Portfolio

- Profile
- About
- Skills
- Projects
- Experience
- Contact
- Social links
- Section visibility

### Templates

- Choose profession
- Choose available template
- Preview
- Switch templates according to entitlement

### Publishing

- Publish/unpublish
- Public URL
- Share portfolio

### SEO

- Basic SEO
- Advanced SEO depending on plan
- Open Graph
- Structured data

### Leads

- Receive contact inquiries
- Read messages
- Mark messages
- Delete messages

### Premium

- View current plan
- See feature availability
- Upgrade
- Manage subscription once billing exists

---

# 🎨 Template Roadmap

Current:

```text
Developer
Video Editor
Digital Marketer
Doctor
```

Potential future templates:

```text
Lawyer
Designer
Photographer
Student
Freelancer
Content Creator
Teacher
Consultant
```

These should be added **only when product demand justifies them**.

Do not create 20+ templates before validating the core product.

---

# 🚫 Deliberately Deferred Features

The following are not part of the immediate production path:

### ❌ Figma/Canva-style drag-and-drop builder

Why:

- huge complexity
- difficult responsive behavior
- difficult persistence model
- difficult template compatibility
- unnecessary for MVP

### ❌ Complex RBAC

Current platform needs:

```text
user
superadmin
```

More roles should be introduced only when a real business requirement appears.

### ❌ Team collaboration

Not necessary for the initial portfolio SaaS model.

### ❌ Template marketplace

Requires creator economics, review/moderation, versioning, licensing, and marketplace infrastructure.

### ❌ AI portfolio generator

Potential future feature, but not required for the core product.

### ❌ International billing

Local-first product strategy makes Bangladesh payment support the priority.

### ❌ Microservices

The current monolithic Next.js architecture is appropriate until scale demonstrates a real need to split services.

---

# 🧪 Production Definition of Done

The product should not be called **production-ready** merely because:

```text
npm run build
```

passes.

Production readiness should cover:

## Security

- [ ] Authentication hardened
- [ ] Authorization hardened
- [ ] Tenant isolation verified
- [ ] Admin page authorization verified
- [ ] Rate limiting
- [ ] Input validation
- [ ] Message size limits
- [ ] Sensitive data exposure review
- [ ] Secure cookie configuration
- [ ] Security headers reviewed

## Multi-Tenancy

- [ ] Every tenant query is owner-scoped
- [ ] No cross-tenant leakage
- [ ] No hardcoded creator identity
- [ ] Tenant-correct SEO
- [ ] Tenant-correct JSON-LD
- [ ] Tenant-correct contact ownership

## Performance

- [ ] Public portfolio performance measured
- [ ] Database queries reviewed
- [ ] Indexes validated
- [ ] Caching strategy validated
- [ ] Images optimized
- [ ] Dynamic rendering decisions validated

## Reliability

- [ ] Structured logging
- [ ] Error monitoring
- [ ] Health check
- [ ] Database monitoring
- [ ] Production alerts
- [ ] Backup/recovery plan

## Billing

- [ ] Plan model
- [ ] Payment model
- [ ] Subscription lifecycle
- [ ] Gateway integration
- [ ] Server-side payment verification
- [ ] Webhook verification
- [ ] Failed payment handling
- [ ] Cancellation/expiry handling
- [ ] Entitlement synchronization

## Quality

- [ ] Regression suite
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Production build passes
- [ ] Critical user journeys tested
- [ ] Security scenarios tested
- [ ] Payment scenarios tested
- [ ] Production smoke test

---

# 🧑‍💻 Developer Handoff Guide

This section exists specifically for new developers joining the project.

## First rule

**Do not start coding immediately.**

First understand:

```text
Product
  ↓
Architecture
  ↓
Current phase
  ↓
Existing contracts
  ↓
Security rules
  ↓
Task scope
  ↓
Implementation
  ↓
Tests
```

---

# 🤖 How to Explain This Project to a New GPT/AI

Give the AI this context:

```text
You are working on PortfolioOS, a multi-tenant SaaS portfolio platform.

Stack:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- MongoDB
- Mongoose
- JWT
- bcryptjs
- jose

Architecture:
DATA ≠ PRESENTATION.

Portfolio data is normalized into PortfolioData and passed into profession-specific templates.

Templates must never:
- query the database
- perform authentication
- perform authorization
- implement tenant business rules

Tenant boundary:
User._id → ownerId.

All tenant-owned queries must be scoped by ownerId.

Public portfolios use:
 /p/[username]

The server resolves:
username → User._id → owner-scoped PortfolioData → selectedTemplate → template resolver.

Never trust client-supplied ownerId/userId.

Roles:
- user
- superadmin

Account status:
- active
- suspended

Portfolio publication:
- published
- unpublished

Entitlements are resolved centrally:
Superadmin override > User Override > Plan Default.

Frontend feature locks are UX only.
Backend authorization and entitlement checks are the real security boundary.

Current completed milestone:
Phase 20 — Entitlement UX & Plan Awareness.
Phase 20 is APPROVED and LOCKED.

Next planned milestone:
Phase 21 — Platform Identity Remediation & Multi-Tenant SEO Purity.

Do not implement anything outside the assigned phase.
Do not expand scope without explicit approval.
Before coding, inspect the existing architecture and provide evidence.
After implementation, provide a detailed implementation report with:
- files created
- files modified
- behavior changed
- tests executed
- regression results
- TypeScript/build results
- known limitations
- deferred items.
```

---

# 🧭 Developer Workflow

For every new phase:

```text
1. Read this README
        ↓
2. Read the current architecture/report
        ↓
3. Perform discovery
        ↓
4. Identify exact scope
        ↓
5. Architecture approval
        ↓
6. Implement only approved scope
        ↓
7. Run targeted tests
        ↓
8. Run regression tests
        ↓
9. TypeScript check
        ↓
10. Production build
        ↓
11. Write implementation report
        ↓
12. Architecture review
        ↓
13. Lock phase
        ↓
14. Start next phase
```

---

# 🚨 Scope Control Rules

A developer must **not** silently introduce:

- new database architecture
- new tenant identifiers
- new roles
- billing
- payment gateway
- custom domains
- teams
- microservices
- new major features
- template redesigns
- unrelated refactors

unless the current phase explicitly requires them.

### Why?

Because SaaS architecture becomes fragile when every developer adds “small improvements” outside the approved milestone.

---

# 🧪 Verification Standard

Every completed phase should report:

```text
Targeted tests
       +
Regression tests
       +
TypeScript
       +
Lint
       +
Production build
```

If something was not executed, report it honestly.

Never report:

```text
PASS
```

without evidence.

---

# 🧠 Evidence Standard

Use this hierarchy:

```text
Runtime behavior / tests
        ↓
Production code
        ↓
Configuration / schema
        ↓
Inference
        ↓
Hypothesis
```

For important findings:

```text
Verdict
Evidence
Reasoning
Impact
Severity
Confidence
Recommendation
```

### Severity

```text
P0 — Critical
P1 — High
P2 — Medium
P3 — Low
```

Do not call something P0/P1 without concrete evidence.

---

# 📦 Current Domain Model

Conceptually:

```text
User
 │
 ├── username
 ├── role
 ├── accountStatus
 └── plan / featureOverrides
       │
       ▼
     Profile
       │
       ├── selectedTemplate
       ├── publication state
       └── SEO configuration
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
    Project         Skill       SkillTag       Experience
       │
       └─────────────── Message
```

All tenant-owned portfolio entities use:

```text
ownerId
```

as the ownership boundary.

---

# 🔄 Public Request Lifecycle

```text
GET /p/[username]
        ↓
Normalize username
        ↓
Find User
        ↓
Resolve ownerId
        ↓
Load owner-scoped data
        ↓
Sanitize/normalize PortfolioData
        ↓
Read selectedTemplate
        ↓
Resolve template
        ↓
Render public portfolio
        ↓
Generate tenant-correct metadata
```

---

# ✉️ Public Contact Lifecycle

```text
Visitor
   ↓
POST /api/messages
   ↓
username
   ↓
Server resolves User
   ↓
ownerId
   ↓
Create Message
   ↓
Target user's inbox
```

Never:

```text
Visitor
 ↓
ownerId from request
 ↓
Message
```

---

# 🔑 Entitlement Lifecycle

```text
User
 ↓
Plan
 +
Feature Overrides
 ↓
Entitlement Resolver
 ↓
Effective Entitlements
 ↓
Frontend UX
 +
Backend Authorization
```

The frontend may say:

```text
🔒 Premium Feature
```

but the backend must independently verify:

```text
Can this user use the feature?
```

---

# 🛣️ Final Production Journey

The intended finished product should feel like this:

```text
                    VISITOR
                       │
                       ▼
                ┌─────────────┐
                │ Landing Page│
                └──────┬──────┘
                       │
                       ▼
                 Register/Login
                       │
                       ▼
                  Onboarding
                       │
                       ▼
                Choose Profession
                       │
                       ▼
                 Choose Template
                       │
                       ▼
                 Build Portfolio
                       │
                       ▼
                  Customize
                       │
                       ▼
                    Preview
                       │
                       ▼
                   Publish
                       │
                       ▼
              /p/[username]
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Search Engines       Visitors
                                 │
                                 ▼
                              Contact
                                 │
                                 ▼
                           User Inbox
                                 │
                                 ▼
                         Business Lead
```

Premium:

```text
Free
 ↓
Premium feature discovery
 ↓
Upgrade
 ↓
Bangladesh payment gateway
 ↓
Server verification
 ↓
Subscription
 ↓
Entitlement update
 ↓
Premium access
```

---

# 🎯 Final Product Definition

PortfolioOS is complete when it can reliably provide:

```text
                    PortfolioOS
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
  Portfolio CMS   Public Websites   SaaS Platform
       │                │                │
       ▼                ▼                ▼
   User Data        Templates        Plans
   Projects         SEO              Entitlements
   Skills           Sharing          Billing
   Experience       Leads            Admin
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                Production SaaS
```

### The product promise

> **Create → Customize → Publish → Share → Receive Leads → Upgrade when needed.**

---

# 🏁 Launch Roadmap

```text
Phase 20
Entitlement UX
       │
       ▼
Phase 21
Identity + SEO Purity
       │
       ▼
Phase 22
Admin Security
       │
       ▼
Phase 23
Performance + Scalability
       │
       ▼
Phase 24
Reliability + Observability
       │
       ▼
Phase 25+
Billing + Subscription
       │
       ▼
Bangladesh Payment Gateway
       │
       ▼
Payment Verification
       │
       ▼
Production Security Audit
       │
       ▼
Production Smoke Testing
       │
       ▼
Private Beta
       │
       ▼
Public Launch 🚀
```

---

# 🧩 What Is Intentionally Not Locked Yet

These decisions should remain product/business decisions until validated:

- Exact pricing
- Annual discount
- Final premium feature list
- Payment gateway provider
- Payment fees
- Refund policy
- Subscription cancellation policy
- Trial period
- Custom domain pricing
- Future template count
- AI features
- Analytics features

Architecture should support these decisions without prematurely hardcoding them.

---

# 📋 Current Handoff Checklist

Before assigning a new developer:

- [x] Read this README
- [x] Understand DATA ≠ PRESENTATION
- [x] Understand `ownerId`
- [x] Understand `/p/[username]`
- [x] Understand template resolver
- [x] Understand user/superadmin separation
- [x] Understand account vs publication status
- [x] Understand entitlement precedence
- [x] Understand current completed phases
- [ ] Read Phase 21 discovery/architecture decision
- [ ] Receive exact implementation scope
- [ ] Implement only approved scope
- [ ] Produce implementation report
- [ ] Pass review
- [ ] Lock phase

---

# 🏆 Project Governance

This project follows:

> **Discovery → Architecture Approval → Implementation → Verification → Review → Lock**

Not:

> “Developer sees issue → immediately changes code.”

The purpose is to keep the SaaS architecture understandable, secure, maintainable, and easy for new developers and AI coding agents to continue.

---

## Current Decision

**Completed through:** Phase 20  
**Current state:** Feature-complete foundation + hardening in progress  
**Next milestone:** Phase 21 — Platform Identity Remediation & Multi-Tenant SEO Purity  
**Commercialization:** Phase 25+  
**Production launch:** After security, performance, observability, billing, payment verification, and final smoke testing are complete.

---

## 📚 Related Architecture Material

The repository should keep the detailed phase plans/reports alongside this README.

Recommended structure:

```text
/
├── README.md
├── plan/
│   ├── architecture/
│   ├── discovery/
│   └── implementation/
├── src/
├── scripts/
└── ...
```

The README is the **high-level project map**.

Phase reports are the **implementation evidence**.

Architecture decisions are the **source of truth for scope and design**.

---

> **PortfolioOS is not just a portfolio website.**
>
> It is being built as a real multi-tenant SaaS product, with tenant isolation, centralized authorization, reusable templates, entitlements, platform administration, and a path toward verified local subscriptions.
