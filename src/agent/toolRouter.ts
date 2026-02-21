import { select_intent } from "../orchestration/intentTool"
import { HookEngine } from "../hooks/hookEngine"

export async function runTool(
	workspaceRoot: string,
	sessionId: string,
	toolName: string,
	args: any,
	hookEngine: HookEngine,
) {
	if (toolName === "select_intent") {
		const result = await select_intent(workspaceRoot, sessionId, args)

		await hookEngine.runPostIntentSelection({
			sessionId,
			workspaceRoot,
			stage: "CONTEXT_INJECTION",
			intentId: args.intent_id,
			toolName,
			args,
			timestamp: new Date().toISOString(),
			traceId: crypto.randomUUID(),
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
	})

	// run real tool logic here...
	return { ok: true }
}
