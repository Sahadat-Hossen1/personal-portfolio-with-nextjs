Searched for files: *
Searched for files: *
Viewed package.json:1-39
Searched for files: *.tsx
Searched for files: *
Viewed index.ts:1-82
Viewed portfolio.ts:1-149
Viewed page.tsx:1-29
Searched for "selectedTemplate"
Searched for "TemplateId"
Viewed Profile.ts:1-182
Viewed index.tsx:1-69
Viewed index.tsx:1-90
Viewed index.tsx:1-75
Viewed page.tsx:1-800
Viewed route.ts:1-94
Viewed initialData.ts:1-259
Viewed page.tsx:1-150
Viewed MarketingHero.tsx:1-100
Viewed MarketingProjects.tsx:1-60
Viewed MarketingSkills.tsx:1-60
Viewed getData.ts:1-94
Viewed DevContact.tsx:1-60
Viewed DevContact.tsx:80-140
Viewed globals.css:1-100
Created implementation_plan.md

I have completed the architectural inspection and prepared a detailed design for adding the **Doctor Template** and **Lawyer Template**.

The detailed technical proposal is documented in the [implementation plan](file:///C:/Users/Sahadat%20Hossen/.gemini/antigravity/brain/6dfcdac0-9400-455a-9bf4-5f88f518924d/implementation_plan.md).

### Summary of Architectural Findings

1. **Existing Architecture**: The application uses Next.js 16 (App Router), Tailwind CSS v4, and MongoDB/Mongoose. A normalized data contract (`PortfolioData`) is fetched via [`getPortfolioData()`](file:///c:/Web-dev-Projects/CODING/personal-portfolio/src/lib/getData.ts#L18-L93) and cleanly decoupled from presentation.
2. **Current Template System**: Uses a centralized Registry Pattern in [`src/templates/index.ts`](file:///c:/Web-dev-Projects/CODING/personal-portfolio/src/templates/index.ts). [`src/app/page.tsx`](file:///c:/Web-dev-Projects/CODING/personal-portfolio/src/app/page.tsx) dynamically resolves templates using either URL query (`?template=...`) or the saved DB setting (`profile.selectedTemplate`).
3. **Safest Way to Add Doctor & Lawyer**:
   - Extend the `TemplateId` union type (`"developer" | "doctor" | "lawyer" | ...`) and Mongoose schema enum.
   - Register the new templates in `SUPPORTED_TEMPLATE_IDS` and `TEMPLATE_MAP`.
   - Add template selector cards to [`src/app/admin/settings/page.tsx`](file:///c:/Web-dev-Projects/CODING/personal-portfolio/src/app/admin/settings/page.tsx).
   - Zero modifications to the existing `DeveloperTemplate` or database schema.
4. **Data Reusability**: 100% of the existing portfolio fields (`name`, `roles`, `bioBlurb`, `stats`, `highlights`, `floatingBadges`, `projects`, `skills`, `skillTags`, `experiences`, `socials`, `sections`, contact details) are reused directly, semantically translated for medical and legal contexts.
5. **Missing Fields / Domain Requirements**: No database schema changes are needed. Domain-specific requirements (such as medical office hours, clinical trial modals, patient appointment triage, attorney advertising disclaimers, and legal matter breakdowns) are handled cleanly at the presentation layer.
6. **Component Architecture**: Two modular, self-contained template trees in `src/templates/doctor/` and `src/templates/lawyer/`, each with dedicated Navbars, Heros, About, Specialties/Practice Areas, Case Studies/Matters with interactive detail modals, Career Timelines, and Contact/Inquiry forms.
7. **Files to Modify / Create**:
   - **4 existing files to modify** (non-breaking type/registry/settings additions): `src/types/portfolio.ts`, `src/models/Profile.ts`, `src/templates/index.ts`, `src/app/admin/settings/page.tsx`.
   - **20 new template presentation files** across `src/templates/doctor/` and `src/templates/lawyer/`.

Please review the [implementation plan](file:///C:/Users/Sahadat%20Hossen/.gemini/antigravity/brain/6dfcdac0-9400-455a-9bf4-5f88f518924d/implementation_plan.md) and let me know if you would like me to proceed with the implementation.