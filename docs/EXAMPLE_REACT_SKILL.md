---
name: React
version: 18.2.0
domains: [frontend, ui, frameworks]
lastGenerated: 2026-02-11T00:00:00Z
---

# Skill: React

## Purpose

Essential patterns and best practices for building scalable React applications with hooks, state management, and performance optimization.

## Version

React 16.8+ (hooks required), tested on 18.0–18.2. Breaking changes from 17→18: automatic batching now applies outside event handlers. Concurrent features enable smoother UI updates.

## Principles

- Unidirectional data flow ensures predictability and debuggability
- Composition over inheritance promotes component reusability
- Immutable state prevents silent bugs and enables time-travel debugging
- Declarative UI syntax matches mental models of component structure

## Mandatory Rules

- Always provide stable keys when rendering lists; never use array index as key
- Never mutate state directly; always use setState or hook setters
- Call hooks only at component top-level, never inside loops or conditionals
- Clean up subscriptions in useEffect return function to prevent memory leaks
- Validate prop types or use TypeScript to catch type mismatches early
- Never call React hooks inside regular JavaScript functions or class methods
- Always include dependencies array in useEffect to prevent stale closures
- Never use setState in render body; use useEffect or derived state instead

## Recommended Patterns

- Extract complex state logic into custom hooks for better code sharing
- Use context with useReducer for cross-cutting concerns at scale
- Memoize expensive computations with useMemo after profiling confirms benefit
- Lazy-load components with React.lazy and Suspense for code splitting
- Use React.memo for components that receive identical props frequently
- Implement error boundaries to catch and handle component errors gracefully
- Use controlled components for form inputs to maintain single source of truth
- Leverage compound component pattern for flexible API design

## Anti-Patterns

- Creating new objects or arrays in render causes reconciliation; cache with useMemo
- Passing brand-new functions as props defeats React.memo optimization
- Using array index as key causes reordering bugs on list mutations
- Inline object literals in JSX create new references on every render
- Circular component imports cause bundler issues; use lazy loading instead
- Prop drilling through many levels creates maintenance burden; use context instead

## Security

- Sanitize user input before rendering; use DOMPurify for HTML string content
- Never store sensitive data in localStorage; use secure httpOnly cookies
- Validate all external API data; don't trust responses without validation
- Avoid dangerouslySetInnerHTML unless content is guaranteed safe and validated
- Implement Content Security Policy headers to prevent XSS attacks
- Never expose API keys or secrets in client-side React components

## Performance

- Use React DevTools Profiler to measure component render times before optimizing
- Memoize callbacks with useCallback if passed as dependency to memoized child
- Code-split with React.lazy to reduce initial bundle size for large apps
- Batch state updates in event handlers to reduce re-renders (automatic in React 18)
- Use virtualization for long lists with react-window or react-virtualized
- Implement pagination or infinite scroll instead of rendering all items at once
- Optimize images with next/image or lazy loading attributes

## Tooling

- ESLint plugin: `eslint-plugin-react-hooks` enforces rules of hooks
- React DevTools browser extension for component tree inspection and profiling
- TypeScript for type safety; include @types/react and @types/react-dom
- Vite or Create React App for build tooling and dev server
- React Query for server state management and caching
- Zustand or Redux Toolkit for complex client state management

## Last-Updated

2026-02-11T00:00:00Z

## Sources

- https://react.dev/ (official documentation and guides)
- https://github.com/facebook/react/blob/main/CHANGELOG.md (changelog)
- https://react.dev/reference/rules/rules-of-hooks (hooks rules)
- https://react.dev/learn/thinking-in-react (component design patterns)
- https://react.dev/reference/react/useEffect (effect lifecycle)
- https://react.dev/reference/react/useMemo (performance optimization)
- https://github.com/facebook/react/releases (18.x releases)
