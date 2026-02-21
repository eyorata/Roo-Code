import { IntentManager } from "../orchestration/intentManager"
import { ArtifactStore } from "../orchestration/artifactStore"

export interface SelectIntentArgs {
	intent_id: string
	intent_type: string
	summary: string
}

export async function select_active_intent(workspaceRoot: string, sessionId: string, args: SelectIntentArgs) {
	const intentManager = new IntentManager(workspaceRoot)
	const store = new ArtifactStore(workspaceRoot)

	if (!intentManager.getIntentById(args.intent_id)) {
		throw new Error("You must cite a valid active Intent ID.")
	}

	const active = intentManager.setActiveIntent(sessionId, args.intent_id, args.intent_type, args.summary)
	const intentContext = intentManager.getIntentContextXml(args.intent_id)

	store.appendTrace({
		event: "IntentSelected",
		session_id: sessionId,
		intent_id: args.intent_id,
		intent_type: args.intent_type,
		summary: args.summary,
		intent_context: intentContext,
		timestamp: new Date().toISOString(),
	})

	return {
		active,
		intent_context: intentContext,
	}
}

export const select_intent = select_active_intent
