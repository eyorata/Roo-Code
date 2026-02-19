import { IntentManager } from "../orchestration/intentManager";
import { ArtifactStore } from "../orchestration/artifactStore";

export interface SelectIntentArgs {
  intent_id: string;
  intent_type: string;
  summary: string;
}

export async function select_intent(
  workspaceRoot: string,
  sessionId: string,
  args: SelectIntentArgs
) {
  const intentManager = new IntentManager(workspaceRoot);
  const store = new ArtifactStore(workspaceRoot);

  const active = intentManager.setActiveIntent(
    sessionId,
    args.intent_id,
    args.intent_type,
    args.summary
  );

  store.appendTrace({
    event: "IntentSelected",
    session_id: sessionId,
    intent_id: args.intent_id,
    intent_type: args.intent_type,
    summary: args.summary,
    timestamp: new Date().toISOString()
  });

  return active;
}
