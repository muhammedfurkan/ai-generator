---
name: i18n Implementation
overview: Implement comprehensive English/Turkish language support by consolidating translations into `LanguageContext` and replacing hardcoded strings across key components.
todos:
  - id: create-translations
    content: Create client/src/i18n/translations.ts and consolidate translations
    status: in_progress
  - id: update-context
    content: Update LanguageContext.tsx to use the new translations file
    status: completed
    dependencies:
      - create-translations
  - id: refactor-nav
    content: Refactor Header.tsx and MobileBottomNav.tsx
    status: completed
    dependencies:
      - update-context
  - id: refactor-modal
    content: Refactor CreateModal.tsx
    status: completed
    dependencies:
      - update-context
  - id: refactor-profile
    content: Refactor Profile.tsx
    status: completed
    dependencies:
      - update-context
  - id: refactor-generate
    content: Refactor Generate.tsx
    status: completed
    dependencies:
      - update-context
  - id: delete-tr
    content: Delete client/src/lib/tr.ts
    status: in_progress
    dependencies:
      - refactor-profile
  - id: todo-1768889935616-ol3y6ghso
    content: all page should be supported the translation feature.
    status: pending
  - id: todo-1768889958174-cqh7cxgq0
    content: analyze all pages and translate all files.
    status: pending
---

# i18n Implementation Plan

The goal is to enable full English/Turkish support across the application by centralizing translations and refactoring components to use the `useLanguage` hook.

## 1. Centralize Translations

- Create a new file `client/src/i18n/translations.ts` to hold the master translation object (merged from `LanguageContext.tsx` and `lib/tr.ts`).
- Ensure all keys from `lib/tr.ts` are present in the new structure with English equivalents.
- Update `client/src/contexts/LanguageContext.tsx` to import from this new file.
- Delete `client/src/lib/tr.ts`.

## 2. Refactor Components

Refactor the following components to replace hardcoded strings with `t('key')`:

### Core Components

- **Header**: [`client/src/components/Header.tsx`](client/src/components/Header.tsx) - Ensure all nav items and buttons are translated.
- **Mobile Navigation**: [`client/src/components/MobileBottomNav.tsx`](client/src/components/MobileBottomNav.tsx) - Translate bottom bar labels.
- **Create Modal**: [`client/src/components/CreateModal.tsx`](client/src/components/CreateModal.tsx) - Translate modal titles, tabs, and buttons.

### Pages

- **Profile Page**: [`client/src/pages/Profile.tsx`](client/src/pages/Profile.tsx) - Replace all hardcoded texts (UserInfo, Credits, Referral, PaymentHistory, Feedback) with translation keys.
- **Generate Page**: [`client/src/pages/Generate.tsx`](client/src/pages/Generate.tsx) - Translate all UI elements including toasts, error messages, and dynamic labels.
- **Home Page**: [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) - Verify existing translations and add any missing ones (e.g., viral apps section if active).

## 3. Implementation Details

- Translation keys will follow a nested structure (e.g., `profile.userInfo.name`, `generate.errors.insufficientCredits`) for better organization.
- `LanguageContext` will be updated to handle the expanded translation object.

## 4. Verification

- Verify that switching languages updates all text in the modified components.
- Ensure no TypeScript errors regarding missing keys.
