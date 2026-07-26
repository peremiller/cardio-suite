# Project agent instructions

<!-- BEGIN: graphify-airllm -->
## Graphify + AirLLM workflow

- Use Graphify as the default codebase-context layer. If `graphify-out/graph.json` exists, run a scoped `graphify query "<question>"` before broad raw-file searches.
- When a complete local checkout is available and repository analysis is in scope, build or update the graph with the official `graphifyy` package. Treat `EXTRACTED` and `INFERRED` relationships differently and verify important conclusions against source locations.
- Prefer AirLLM for local or self-hosted open-model inference only when the project has a compatible Python server, worker, desktop, or batch runtime plus adequate compute and disk.
- Do not bundle AirLLM into browser JavaScript, static sites, mobile clients, or Vercel/edge-only functions. Put inference behind a provider-neutral Python service and keep model caches, tokens, and layer shards out of source control.
- If the task does not involve LLM inference, do not add AirLLM as a dependency; simply preserve this rule for future AI features.
<!-- END: graphify-airllm -->

# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## CardioSuite product decisions

- The selected visual target is the combined clinical workspace mock: compact global navigation, today's patient queue, guided intake canvas, and a persistent clinical handoff panel.
- CardioSuite is a cardiologist staff/assistant operations web app, not a job application site.
- Preserve multi-user access with individual staff accounts, persistent browser sessions, and role-aware navigation for cardiologists, medical assistants/nurses, receptionists, and clinic administrators.
- The deployed frontend is a demonstrator and must clearly discourage real patient-data entry until a production identity/database backend and compliance controls are configured.
