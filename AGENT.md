# AGENT.md

## Shared Rules

- Every mutating tool action must include an active `intent_id`.
- `select_active_intent` is mandatory before tool execution.
- Mutating actions outside owned scope are blocked by the hook layer.
- Destructive actions require HITL approval.

## Lessons Learned

- Type changes in upstream dependencies can break tests; fixtures should avoid brittle coupling.
- Keep hook logic isolated from UI so policy decisions stay deterministic and testable.

## Architectural Decisions

- The hook engine is a middleware boundary in Extension Host, not Webview.
- `.orchestration/agent_trace.jsonl` is append-only and content-hash based.
- Session state is tracked in `.orchestration/active_intents.yaml` under `sessions`.
