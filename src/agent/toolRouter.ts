import { select_active_intent } from "../orchestration/intentTool"
import { HookEngine } from "../hooks/hookEngine"
import { MutationClass } from "../hooks/hookTypes"

export async function runTool(
	workspaceRoot: string,
	sessionId: string,
	toolName: string,
	args: any,
	hookEngine: HookEngine,
) {
	const isWriteTool = ["write_file", "write_to_file", "replace_in_file", "apply_diff"].includes(toolName)
	const mutationClass = (args?.mutation_class as MutationClass | undefined) ?? "AST_REFACTOR"
	const modelIdentifier = String(args?.model_identifier ?? "unknown-model")
	const conversationUrl = String(args?.session_log_id ?? sessionId)

	if (toolName === "select_active_intent" || toolName === "select_intent") {
		await hookEngine.runPreToolUse({
			sessionId,
			workspaceRoot,
			stage: "INTENT_SELECTION",
			intentId: args.intent_id,
			toolName: "select_active_intent",
			args,
			timestamp: new Date().toISOString(),
			traceId: crypto.randomUUID(),
			modelIdentifier,
			conversationUrl,
		})

		const result = await select_active_intent(workspaceRoot, sessionId, args)

		await hookEngine.runPostIntentSelection({
			sessionId,
			workspaceRoot,
			stage: "CONTEXT_INJECTION",
			intentId: args.intent_id,
			toolName,
			args,
			timestamp: new Date().toISOString(),
			traceId: crypto.randomUUID(),
			modelIdentifier,
			conversationUrl,
		})

		return result
	}

	// Normal tool execution must pass PreToolUse hook
	await hookEngine.runPreToolUse({
		sessionId,
		workspaceRoot,
		stage: "TOOL_EXECUTION",
		toolName,
		args,
		timestamp: new Date().toISOString(),
		traceId: crypto.randomUUID(),
		modelIdentifier,
		conversationUrl,
		hitlApproved: Boolean(args?.hitl_approved),
		mutationClass,
	})

	// run real tool logic here...
	const result = { ok: true }

	if (isWriteTool) {
		await hookEngine.runPostToolUse({
			sessionId,
			workspaceRoot,
			stage: "TOOL_EXECUTION",
			toolName,
			args,
			intentId: args?.intent_id,
			timestamp: new Date().toISOString(),
			traceId: crypto.randomUUID(),
			modelIdentifier,
			conversationUrl,
			mutationClass,
		})
	}

	return result
}
