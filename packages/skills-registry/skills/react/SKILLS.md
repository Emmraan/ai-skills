---
name: React
version: 18.2.0
domains: [frontend, ui, frameworks]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: React

## Purpose

Essential patterns and best practices for building scalable React applications with hooks, state management, and performance optimization.

## Version

React 16.8+ (hooks required), tested on 18.0–18.2. Breaking changes from 17→18: automatic batching now applies outside event handlers.

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

## Recommended Patterns

- Extract complex state logic into custom hooks for better code sharing
- Use context with useReducer for cross-cutting concerns at scale
- Memoize expensive computations with useMemo after profiling confirms benefit
- Lazy-load components with React.lazy and Suspense for code splitting
- Use React.memo for components that receive identical props frequently

## Anti-Patterns

- Creating new objects or arrays in render causes reconciliation; cache with useMemo
- Passing brand-new functions as props defeats React.memo optimization
- Using array index as key causes reordering bugs on list mutations
- Inline object literals in JSX create new references on every render

## Security

- Sanitize user input before rendering; use DOMPurify for HTML string content
- Never store sensitive data in localStorage; use secure httpOnly cookies
- Validate all external API data; don't trust responses without validation
- Avoid dangerouslySetInnerHTML unless content is guaranteed safe and validated

## Performance

- Use React DevTools Profiler to measure component render times before optimizing
- Memoize callbacks with useCallback if passed as dependency to memoized child
- Code-split with React.lazy to reduce initial bundle size for large apps
- Batch state updates in event handlers to reduce re-renders (automatic in React 18)

## Tooling

- ESLint plugin: `eslint-plugin-react-hooks` enforces rules of hooks
- React DevTools browser extension for component tree inspection and profiling
- TypeScript for type safety; include @types/react and @types/react-dom
- Vite or Create React App for build tooling and dev server

## Last-Updated

2026-02-06T00:00:00Z

## Sources

- https://react.dev/ (official documentation and guides)
- https://github.com/facebook/react/blob/main/CHANGELOG.md (changelog)
- https://react.dev/reference/rules/rules-of-hooks (hooks rules)
