ARCHITECTURE_NOTES.md
AI-Native IDE Extension – Hook System + Agent Architecture

Author: Eyoel Nebiyu
Role: AI Enthusiast | Computer Science Master Graduate
Project: TRP1 – Architecting the AI-Native IDE & Intent-Code Traceability
Submission: Interim Report (Week 1)

1. Overview

This project extends a VS Code extension to support an AI-Native development workflow using a structured hook system.

The goal is to allow an AI agent to:

Observe IDE events (file edits, saves, commits, etc.)

Capture developer intent and actions

Store trace artifacts for auditing and reproducibility

Provide traceability between intent → actions → code changes

This architecture is designed for future integration with orchestration artifacts like:

agent_trace.jsonl

active_intents.yaml

intent_map.md

2. How the VS Code Extension Works

The VS Code extension runs inside the VS Code Extension Host.

Core lifecycle:

VS Code loads the extension from package.json

It calls activate(context)

The extension registers commands, listeners, hooks, and services

When events happen (save, edit, etc.) hooks are triggered

Hooks communicate with an AI agent pipeline

Key system parts:

extension.ts → activation entrypoint

hooks/ → hook event definitions + dispatcher

agent/ → reasoning pipeline and context builder

storage/ → trace logs + intent persistence

ui/ → optional notifications or panels

3. Chosen Architecture for the Agent (Best Option)
✅ Selected Architecture: Event-Driven Hook Dispatcher + Agent Orchestrator (Pipeline Model)

This is the best architecture because it is:

scalable

auditable

testable

clean separation of concerns

supports traceability artifacts naturally

4. High-Level Agent Design

The agent is not a single monolithic function.
Instead it is built as a multi-stage pipeline:

Pipeline Flow

Hook Trigger

Context Collector

Intent Resolver

Policy Validation

Action Planner

Trace Writer

Execution / Response Handler

5. Hook System Architecture

The hook system is implemented as a modular event-based framework.

Hooks are responsible for:

listening to VS Code events

packaging relevant context

sending it to the agent orchestrator

6. Hook Dispatcher Design
Dispatcher Responsibilities:

register hook handlers

enforce consistent event schema

route events to agent

ensure hook output is traceable

This is implemented using a central hook manager.

7. Hook Event Types (Planned)

Hooks are grouped by lifecycle categories:

Editing Lifecycle

onFileOpen

onFileChange

onFileSave

Git Lifecycle

onGitCommit

onGitPush

onBranchChange

Build/Test Lifecycle

onRunTests

onBuild

onLint

Manual Developer Intent Hooks

onIntentDeclared (command-based)

8. Hook Schema Design

All hooks output a structured payload.

Standard Hook Event Schema
{
  "event_id": "uuid",
  "event_type": "onFileSave",
  "timestamp": "ISO-8601",
  "workspace": "path",
  "file_path": "relative path",
  "diff_summary": "string",
  "user_intent": "optional string",
  "metadata": {
    "language": "python",
    "line_count": 250
  }
}

9. Architectural Decisions for the Hook System
Decision 1: Hooks are isolated modules

Each hook lives in its own file under:

src/hooks/


This allows easy extension and avoids a single bloated event file.

Decision 2: Unified Hook Payload Contract

Every hook emits the same top-level structure.

This improves:

auditability

schema validation

agent prompt consistency

Decision 3: Hooks are stateless

Hooks do not store global state.
They pass state to the agent orchestrator.

State belongs to:

intent manager

trace storage layer

Decision 4: Agent uses policy rules before reasoning

Before the agent generates output, it checks:

forbidden actions

safe operations

trace requirements

This prevents unsafe or non-auditable behaviors.

10. Agent Orchestrator (Core Component)

The orchestrator is the central brain.

Responsibilities:

accept hook events

build a structured agent context

call the reasoning module

produce a standardized output

store trace artifacts

Agent Orchestrator Output Schema
{
  "event_id": "uuid",
  "decision": "LOG_ONLY | RECOMMEND | AUTO_FIX | BLOCK",
  "reasoning": "text",
  "recommended_actions": [],
  "trace_written": true
}

11. Intent System (Core Idea)

Intent is the most important part of AI-native traceability.

Intent is defined as:

a developer goal that explains why a change was made.

Intent can be captured in 2 ways:

Explicit command: developer runs “Declare Intent”

Implicit inference: agent guesses from edit context

12. Intent Map Design

The system creates a mapping:

Intent → Code Changes → Hook Events

This enables long-term traceability and later auditing.

Example:

Intent: “Improve SQL safety”

Files changed: memory.py, sql_safety.py

Events: onFileSave, onGitCommit

13. Trace Storage Design

Trace artifacts are written to a local folder.

Proposed folder structure:

.orchestration/
  traces/
    hook_events.jsonl
    agent_trace.jsonl
  intents/
    active_intents.yaml
    intent_map.md


This matches the final deliverables requirements.

14. Diagrams (Text-Based)
Hook Execution Flow Diagram
VS Code Event
    ↓
Hook Listener
    ↓
Hook Dispatcher
    ↓
Agent Orchestrator
    ↓
Intent Resolver + Policy Check
    ↓
Trace Writer
    ↓
Response (log/recommend/fix)

Agent Decision Pipeline
Hook Event Payload
    ↓
Context Builder
    ↓
Intent Resolver
    ↓
Policy Validator
    ↓
LLM Agent Reasoning
    ↓
Action Planner
    ↓
Write Trace + Return Response

15. Why This Architecture is Best
Strengths

✅ Spec-driven
✅ Auditable
✅ Works with TDD
✅ Supports trace artifacts
✅ Easy to expand with new hooks
✅ Allows future LangGraph / multi-agent integration

Avoids common failures

monolithic design

no traceability

hardcoded flows

unsafe agent actions

16. Implementation Notes (Week 1 Scope)

For the interim submission, the focus is:

clean src/hooks/ folder

hook schemas and dispatcher design

agent orchestrator skeleton

documentation clarity

Week 2+ will expand into:

multi-step agent reasoning

intent lifecycle management

persistent orchestration artifacts

17. Future Enhancements
Planned improvements:

LangGraph memory state for multi-step workflows

Multi-agent roles (Planner, Validator, Executor)

Automatic intent extraction using commit messages

Automatic trace validation in CI

Trace replay system (audit mode)

18. Summary

This architecture provides a robust foundation for an AI-native IDE:

Hook system provides structured observability

Agent orchestrator ensures consistent decisions

Intent mapping enables traceability

Trace storage supports auditing and compliance

This design meets both:

Interim deliverables (Week 1)

Final deliverables (Week 2)

Prepared by:
Eyoel Nebiyu
AI EnthuARCHITECTURE_NOTES.md
AI-Native IDE Extension – Hook System + Agent Architecture

Author: Eyoel Nebiyu
Role: AI Enthusiast | Computer Science Master Graduate
Project: TRP1 – Architecting the AI-Native IDE & Intent-Code Traceability
Submission: Interim Report (Week 1)

1. Overview

This project extends a VS Code extension to support an AI-Native development workflow using a structured hook system.

The goal is to allow an AI agent to:

Observe IDE events (file edits, saves, commits, etc.)

Capture developer intent and actions

Store trace artifacts for auditing and reproducibility

Provide traceability between intent → actions → code changes

This architecture is designed for future integration with orchestration artifacts like:

agent_trace.jsonl

active_intents.yaml

intent_map.md

2. How the VS Code Extension Works

The VS Code extension runs inside the VS Code Extension Host.

Core lifecycle:

VS Code loads the extension from package.json

It calls activate(context)

The extension registers commands, listeners, hooks, and services

When events happen (save, edit, etc.) hooks are triggered

Hooks communicate with an AI agent pipeline

Key system parts:

extension.ts → activation entrypoint

hooks/ → hook event definitions + dispatcher

agent/ → reasoning pipeline and context builder

storage/ → trace logs + intent persistence

ui/ → optional notifications or panels

3. Chosen Architecture for the Agent (Best Option)
✅ Selected Architecture: Event-Driven Hook Dispatcher + Agent Orchestrator (Pipeline Model)

This is the best architecture because it is:

scalable

auditable

testable

clean separation of concerns

supports traceability artifacts naturally

4. High-Level Agent Design

The agent is not a single monolithic function.
Instead it is built as a multi-stage pipeline:

Pipeline Flow

Hook Trigger

Context Collector

Intent Resolver

Policy Validation

Action Planner

Trace Writer

Execution / Response Handler

5. Hook System Architecture

The hook system is implemented as a modular event-based framework.

Hooks are responsible for:

listening to VS Code events

packaging relevant context

sending it to the agent orchestrator

6. Hook Dispatcher Design
Dispatcher Responsibilities:

register hook handlers

enforce consistent event schema

route events to agent

ensure hook output is traceable

This is implemented using a central hook manager.

7. Hook Event Types (Planned)

Hooks are grouped by lifecycle categories:

Editing Lifecycle

onFileOpen

onFileChange

onFileSave

Git Lifecycle

onGitCommit

onGitPush

onBranchChange

Build/Test Lifecycle

onRunTests

onBuild

onLint

Manual Developer Intent Hooks

onIntentDeclared (command-based)

8. Hook Schema Design

All hooks output a structured payload.

Standard Hook Event Schema
{
  "event_id": "uuid",
  "event_type": "onFileSave",
  "timestamp": "ISO-8601",
  "workspace": "path",
  "file_path": "relative path",
  "diff_summary": "string",
  "user_intent": "optional string",
  "metadata": {
    "language": "python",
    "line_count": 250
  }
}

9. Architectural Decisions for the Hook System
Decision 1: Hooks are isolated modules

Each hook lives in its own file under:

src/hooks/


This allows easy extension and avoids a single bloated event file.

Decision 2: Unified Hook Payload Contract

Every hook emits the same top-level structure.

This improves:

auditability

schema validation

agent prompt consistency

Decision 3: Hooks are stateless

Hooks do not store global state.
They pass state to the agent orchestrator.

State belongs to:

intent manager

trace storage layer

Decision 4: Agent uses policy rules before reasoning

Before the agent generates output, it checks:

forbidden actions

safe operations

trace requirements

This prevents unsafe or non-auditable behaviors.

10. Agent Orchestrator (Core Component)

The orchestrator is the central brain.

Responsibilities:

accept hook events

build a structured agent context

call the reasoning module

produce a standardized output

store trace artifacts

Agent Orchestrator Output Schema
{
  "event_id": "uuid",
  "decision": "LOG_ONLY | RECOMMEND | AUTO_FIX | BLOCK",
  "reasoning": "text",
  "recommended_actions": [],
  "trace_written": true
}

11. Intent System (Core Idea)

Intent is the most important part of AI-native traceability.

Intent is defined as:

a developer goal that explains why a change was made.

Intent can be captured in 2 ways:

Explicit command: developer runs “Declare Intent”

Implicit inference: agent guesses from edit context

12. Intent Map Design

The system creates a mapping:

Intent → Code Changes → Hook Events

This enables long-term traceability and later auditing.

Example:

Intent: “Improve SQL safety”

Files changed: memory.py, sql_safety.py

Events: onFileSave, onGitCommit

13. Trace Storage Design

Trace artifacts are written to a local folder.

Proposed folder structure:

.orchestration/
  traces/
    hook_events.jsonl
    agent_trace.jsonl
  intents/
    active_intents.yaml
    intent_map.md


This matches the final deliverables requirements.

14. Diagrams (Text-Based)
Hook Execution Flow Diagram
VS Code Event
    ↓
Hook Listener
    ↓
Hook Dispatcher
    ↓
Agent Orchestrator
    ↓
Intent Resolver + Policy Check
    ↓
Trace Writer
    ↓
Response (log/recommend/fix)

Agent Decision Pipeline
Hook Event Payload
    ↓
Context Builder
    ↓
Intent Resolver
    ↓
Policy Validator
    ↓
LLM Agent Reasoning
    ↓
Action Planner
    ↓
Write Trace + Return Response

15. Why This Architecture is Best
Strengths

✅ Spec-driven
✅ Auditable
✅ Works with TDD
✅ Supports trace artifacts
✅ Easy to expand with new hooks
✅ Allows future LangGraph / multi-agent integration

Avoids common failures

monolithic design

no traceability

hardcoded flows

unsafe agent actions

16. Implementation Notes (Week 1 Scope)

For the interim submission, the focus is:

clean src/hooks/ folder

hook schemas and dispatcher design

agent orchestrator skeleton

documentation clarity

Week 2+ will expand into:

multi-step agent reasoning

intent lifecycle management

persistent orchestration artifacts

17. Future Enhancements
Planned improvements:

LangGraph memory state for multi-step workflows

Multi-agent roles (Planner, Validator, Executor)

Automatic intent extraction using commit messages

Automatic trace validation in CI

Trace replay system (audit mode)

18. Summary

This architecture provides a robust foundation for an AI-native IDE:

Hook system provides structured observability

Agent orchestrator ensures consistent decisions

Intent mapping enables traceability

Trace storage supports auditing and compliance

This design meets both:

Interim deliverables (Week 1)

Final deliverables (Week 2)

Prepared by:
Eyoel Nebiyu
AI Enthusiast | MSc Computer Science Graduate