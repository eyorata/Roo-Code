# Intent Map

This document maps high-level user intents to the code hooks and agent workflows.

---

## INTENT-001: Traceability Enforcement
**Goal:** Every agent output must be traceable to a user intent.

### Implementation
- Hook: `src/hooks/traceabilityHook.ts`
- Output Artifact: `.orchestration/agent_trace.jsonl`
- Mapping Artifact: `.orchestration/intent_map.md`

---

## INTENT-002: Hook Trigger Validation
**Goal:** Ensure hooks only run on valid VS Code events.

### Implementation
- Hook system listens to:
  - file save
  - file open
  - manual command trigger

---

## INTENT-003: Safety Guardrails
**Goal:** Ensure agent cannot perform destructive actions.

### Implementation
- Hook checks:
  - No deletion of files
  - No external shell execution unless whitelisted
  - No writing outside workspace root
