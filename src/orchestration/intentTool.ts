import { IntentManager } from "../orchestration/intentManager"
import { ArtifactStore } from "../orchestration/artifactStore"

export interface SelectIntentArgs {
	intent_id?: string
	intent_type: string
	summary: string
}

export async function select_active_intent(workspaceRoot: string, sessionId: string, args: SelectIntentArgs) {
	const intentManager = new IntentManager(workspaceRoot)
	const store = new ArtifactStore(workspaceRoot)
	const requestedIntentId = String(args.intent_id ?? "").trim()
	const shouldInfer = requestedIntentId === "" || requestedIntentId.toUpperCase() === "AUTO"
	const selectedIntent = shouldInfer
		? intentManager.selectIntentByPrompt(args.summary, args.intent_type)
		: intentManager.getIntentById(requestedIntentId)

	if (!selectedIntent) {
		const known = intentManager.getIntentIds().join(", ")
		throw new Error(`You must cite a valid active Intent ID. Known IDs: ${known}`)
	}

	const active = intentManager.setActiveIntent(sessionId, selectedIntent.id, args.intent_type, args.summary)
	const intentContext = intentManager.getIntentContextXml(selectedIntent.id)

	store.appendTrace({
		event: "IntentSelected",
		session_id: sessionId,
		intent_id: selectedIntent.id,
		intent_type: args.intent_type,
		summary: args.summary,
		selection_mode: shouldInfer ? "inferred" : "explicit",
		intent_context: intentContext,
		timestamp: new Date().toISOString(),
	})

	return {
		active,
		intent_context: intentContext,
	}
}

export const select_intent = select_active_intent
