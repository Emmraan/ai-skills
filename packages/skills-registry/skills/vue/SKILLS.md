---
name: Vue
version: 3.4.0
domains: [frontend, ui, frameworks]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: Vue

## Purpose
Best practices for building reactive, efficient user interfaces with Vue 3 composition API, reactivity system, and component composition patterns.

## Version
Vue 3.0–3.4, tested on latest 3.x. Vue 3 introduced composition API, improved TypeScript support, and better performance compared to Vue 2.

## Principles
- Reactivity should be fine-grained and automatic; Vue tracks dependencies implicitly
- Components are composable units; reuse logic through composables and props
- Templates are declarations of intent; logic-heavy templates signal poor abstraction
- Separation of concerns means component structure, not file separation

## Mandatory Rules
- Always use `<script setup>` in Vue 3 for cleaner, more concise components
- Use `ref()` for primitives, `reactive()` for objects; be consistent within component
- Never mutate props directly; emit events or use event handlers to communicate up
- Use scoped styles by default; avoid global CSS that causes style conflicts
- Extract reusable logic into composables; don't duplicate reactive state

## Recommended Patterns
- Use computed properties to derive state; they cache results and only recompute on dependency change
- Compose large pages from smaller, focused components with clear prop contracts
- Use provide/inject for cross-cutting concerns; avoid prop drilling through many levels
- Leverage watchers for side effects on reactive data changes
- Use v-if for conditional rendering; v-show only for frequently toggled elements

## Anti-Patterns
- Mutating state via direct property assignment instead of using state setters
- Creating new functions in templates; extract to methods or computed properties
- Deeply nested if-else in templates; extract conditional logic to computed properties
- Using object spread for reactivity in JavaScript; use reactive() or ref() instead
- Relying on component lifecycle hooks when watchers or lifecycle composition works better

## Security
- Sanitize user input before rendering with v-text or text interpolation; never use v-html with untrusted content
- Use templating for dynamic attributes; avoid binding raw HTML unless from trusted sources
- Validate props and events from child components; don't trust child data
- Use Content Security Policy headers to prevent XSS attacks

## Performance
- Use v-once for static content that never changes; skips reactivity overhead
- Lazy-load components with defineAsyncComponent for code splitting and faster initial loads
- Use keys in v-for to help Vue identify which items have changed
- Profile with Vue DevTools to identify slow components and unnecessary re-renders

## Tooling
- Vue DevTools extension for component tree inspection, state tracking, and event monitoring
- TypeScript: use Volar extension for IDE support and accurate type checking
- ESLint plugin: @vue/eslint-plugin-vue for linting Vue-specific issues
- Vite as build tool; official Vue project scaffolding supports TypeScript and composition API

## Last-Updated
2026-02-06T00:00:00Z

## Sources
- https://vuejs.org/ (official Vue 3 documentation)
- https://vuejs.org/guide/extras/composition-faq.html (composition API FAQs)
- https://github.com/vuejs/core/blob/main/CHANGELOG.md (Vue 3 changelog)
