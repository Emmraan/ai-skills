---
name: TypeScript
version: 5.3.0
domains: [languages, types, tools]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: TypeScript

## Purpose
Advanced TypeScript patterns for writing type-safe, maintainable code that catches errors at compile-time and improves developer experience.

## Version
TypeScript 4.9+ (satisfies operator), tested on 5.3. Breaking changes: 4.0 (lib changes), 4.8 (inverse mapped types), 5.0 (decorators).

## Principles
- Types are a form of documentation; use them to clarify intent, not just satisfy the compiler
- Strict mode catches most bugs at compile-time; worth the extra annotation effort
- Generic types enable code reuse without sacrificing type safety
- Discriminated unions enable exhaustive type checking at runtime

## Mandatory Rules
- Enable strict mode in tsconfig.json; use `strict: true` for new projects
- Never use `any` type; use `unknown` and type guards, or widen to accurate union types
- Annotate function parameters and return types; enable `noImplicitReturns` to enforce
- Use const for type parameters to improve inference: `const x = 5 as const`
- Avoid non-null assertions (!); design code to eliminate the need for them

## Recommended Patterns
- Use discriminated unions for safe pattern matching; enables exhaustive checking with switch
- Leverage utility types (Partial, Pick, Omit) to avoid repeating type definitions
- Use generics with constraints to write flexible, reusable code: `<T extends Base>`
- Use type guards and type predicates to narrow types safely in conditionals
- Extract complex types into type aliases or interfaces; avoid anonymous object types

## Anti-Patterns
- Using `string | number | boolean` instead of narrowing to specific enums or literals
- Casting with `as` instead of restructuring types to be correct
- Creating utility types that are too complex; simplify or split into smaller types
- Using `interface` for everything; use `type` for unions and complex structures
- Ignoring TypeScript errors with `// @ts-ignore`; fix the underlying type issue

## Security
- Use branded types or opaque types to prevent mixing of similar values: `type UserId = string & { readonly _brand: "UserId" }`
- Use const assertions for object literals to lock down property types
- Validate external data with Zod or io-ts; don't assume API responses match type definitions
- Use template literal types to enforce string patterns and prevent invalid values

## Performance
- Use `satisfies` operator to check types without widening; available in 4.9+
- Enable `skipLibCheck: true` in tsconfig to skip checking declaration files, improving build speed
- Use `isolatedModules: true` to ensure modules can be safely transpiled in isolation
- Cache tsc builds and use incremental compilation for large projects

## Tooling
- TSC with strict mode enabled; use `tsc --noEmit` in CI to catch errors
- ESLint with typescript-eslint for TypeScript-specific linting and rules
- Prettier for code formatting; TypeScript outputs correctly after reformatting
- ts-node for running TypeScript directly; useful for scripts and CLI tools

## Last-Updated
2026-02-06T00:00:00Z

## Sources
- https://www.typescriptlang.org/docs/ (official TypeScript handbook)
- https://www.typescriptlang.org/tsconfig (tsconfig.json reference)
- https://www.typescriptlang.org/docs/handbook/advanced-types.html (advanced types)
