---
name: Node.js
version: 20.10.0
domains: [backend, runtime, languages]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: Node.js

## Purpose

Best practices for building scalable, efficient backend services with Node.js, including async patterns, event loop awareness, and production-grade architecture.

## Version

Node.js 18 LTS (until April 2025), 20 LTS (until April 2026), tested on latest 20.x. Prefer LTS versions for production.

## Principles

- Single-threaded event loop must never block; use async/await and non-blocking I/O
- Handle errors explicitly; unhandled rejections crash the process in recent Node versions
- Streams are the solution for large data; never load entire files into memory
- Process should be stateless; state belongs in databases or caches for horizontal scaling

## Mandatory Rules

- Always handle promise rejections; use try/catch in async functions or .catch() on promises
- Never use synchronous I/O (fs.readFileSync, fs.writeFileSync) in production; use async versions
- Set NODE_ENV=production in production; frameworks and libraries optimize based on this variable
- Use environment variables for configuration; never hardcode secrets or environment-specific values
- Implement graceful shutdown; handle SIGTERM signal to finish in-flight requests before exiting

## Recommended Patterns

- Use async/await over promise .then() chains for cleaner, more readable control flow
- Leverage streams for processing large data; pipe through transformations without buffering
- Use middleware patterns (express middleware, custom wrapping) for cross-cutting concerns
- Implement structured logging with JSON format; makes logs queryable and machine-readable
- Use process managers (pm2, systemd) to restart crashed processes and manage multiple instances

## Anti-Patterns

- Blocking the event loop with CPU-intensive work; offload to worker threads or external services
- Using res.send() multiple times or after middleware; structure middleware chain correctly
- Mixing callback-based and promise-based code; convert old callbacks or use promisify()
- Leaking references to request/response objects in closures; garbage collector can't clean them
- Storing session data in process memory; use Redis or external session store for multi-process

## Security

- Validate and sanitize all inputs; use libraries like joi or Zod for schema validation
- Use bcrypt or argon2 for password hashing; never store plaintext or weak hashes
- Set security headers with helmet middleware; includes HSTS, CSP, X-Frame-Options
- Use jwt or secure session management for authentication; validate on every request

## Performance

- Use clustering or load balancing to utilize multiple CPU cores on multi-core machines
- Enable gzip compression for HTTP responses; reduces bandwidth and improves load times
- Cache frequently accessed data with Redis; reduces database load and latency
- Monitor memory usage and heap size; Node.js uses significant memory on large datasets

## Tooling

- Express or Fastify for HTTP server; Fastify is faster but Express has larger ecosystem
- Pino or winston for logging; structured JSON logging is production standard
- TypeScript for type safety; improves maintainability and catches bugs early
- PM2 or systemd for process management and auto-restart on crashes
- Clinic.js for profiling and identifying performance bottlenecks

## Last-Updated

2026-02-06T00:00:00Z

## Sources

- https://nodejs.org/en/docs/ (official Node.js documentation)
- https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/ (performance guide)
- https://github.com/nodejs/node/blob/main/CHANGELOG.md (Node.js changelog)
