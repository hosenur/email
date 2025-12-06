# AGENTS.md

## Build & Development Commands
- `bun dev` - Start development server
- `bun build` - Production build
- `bun lint` - Run Biome linter
- `bun format` - Format code with Biome

## Code Style Guidelines
- **Formatting**: 2-space indentation, no semicolons (Biome enforced)
- **Imports**: Use `@/*` path alias for `src/*`. Organize imports automatically via Biome.
- **Types**: Strict TypeScript enabled. Use explicit types for function params and exports.
- **Components**: Use React Aria Components with `react-aria-components`. Export components as named functions.
- **Styling**: Use `tailwind-variants` for component variants, `cx()` from `@/lib/primitive` for className merging.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, kebab-case for files.
- **Directives**: Add `"use client"` at top of client-side components.

## Tech Stack
- Next.js 16 (Pages Router), React 19, TypeScript 5, Tailwind CSS 4, Biome 2.2
