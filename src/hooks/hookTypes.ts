export type HookStage = "PreToolUse" | "PostToolUse" | "PostIntentSelection"
export type MutationClass = "AST_REFACTOR" | "INTENT_EVOLUTION"

export interface HookContext {
	sessionId: string
	stage?: "INTENT_SELECTION" | "CONTEXT_INJECTION" | "TOOL_EXECUTION"
	intentId?: string
	toolName: string
	args: any
	timestamp: string
	traceId?: string
	workspaceRoot?: string
	modelIdentifier?: string
	conversationUrl?: string
	hitlApproved?: boolean
	mutationClass?: MutationClass
}

export type HookDecision = { allowed: true } | { allowed: false; reason: string; requiresApproval?: boolean }

export type HookHandler = (ctx: HookContext) => Promise<HookDecision | void>
