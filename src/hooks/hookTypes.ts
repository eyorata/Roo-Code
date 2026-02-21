export type HookStage = "PreToolUse" | "PostToolUse" | "PostIntentSelection"

export interface HookContext {
	sessionId: string
	stage?: string
	intentId?: string
	toolName: string
	args: any
	timestamp: string
	traceId?: string
	workspaceRoot?: string
}

export type HookDecision = { allowed: true } | { allowed: false; reason: string; requiresApproval?: boolean }

export type HookHandler = (ctx: HookContext) => Promise<HookDecision | void>
