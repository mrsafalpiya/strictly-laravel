# PHP is the Source of Truth for every Type Boundary; safety is compile-time only

TypeScript types are generated from PHP (controllers, DTOs, FormRequests, enums, models) rather than defined in a shared schema (OpenAPI/Zod) or written in TS first, because it keeps Laravel code idiomatic and removes hand-written schemas. The frontend does not re-validate at runtime: Laravel remains the only validator and TS guarantees correctness at compile time; runtime schemas would duplicate validation rules and are only reconsidered if the Testbed App proves a concrete need.
