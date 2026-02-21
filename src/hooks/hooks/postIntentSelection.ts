import { HookContext } from "../hookTypes"
import { IntentManager } from "../../orchestration/intentManager"
import { ArtifactStore } from "../../orchestration/artifactStore"
import * as fs from "fs"
import * as path from "path"

export async function postIntentSelection(ctx: HookContext): Promise<void> {
	const workspaceRoot = ctx.workspaceRoot ?? process.cwd()
	const intentManager = new IntentManager(workspaceRoot)
	const store = new ArtifactStore(workspaceRoot)

	// Example: load context docs
	const contextFiles = [
		path.join(workspaceRoot, "ARCHITECTURE_NOTES.md"),
		path.join(workspaceRoot, "README.md"),
	].filter((f) => fs.existsSync(f))

	intentManager.attachContextFiles(contextFiles)

	store.appendTrace({
		event: "ContextInjected",
		session_id: ctx.sessionId,
		intent_id: ctx.intentId,
		injected_files: contextFiles,
		timestamp: new Date().toISOString(),
	})

	// move to execution stage
	intentManager.updateStage("TOOL_EXECUTION")
}
