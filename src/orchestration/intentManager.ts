import * as path from "path";
import { readYaml, writeYaml } from "./yamlStore";

export type IntentStage =
  | "INTENT_SELECTION"
  | "CONTEXT_INJECTION"
  | "TOOL_EXECUTION";

export interface ActiveIntent {
  session_id: string;
  active_intent?: {
    intent_id: string;
    intent_type: string;
    summary: string;
    stage: IntentStage;
    context_files: string[];
    last_updated: string;
  };
}

export class IntentManager {
  private filePath: string;

  constructor(workspaceRoot: string) {
    this.filePath = path.join(workspaceRoot, ".orchestration", "active_intents.yaml");
  }

  getActiveIntent(): ActiveIntent {
    return readYaml(this.filePath) || { session_id: "unknown" };
  }

  setActiveIntent(sessionId: string, intentId: string, intentType: string, summary: string) {
    const payload: ActiveIntent = {
      session_id: sessionId,
      active_intent: {
        intent_id: intentId,
        intent_type: intentType,
        summary,
        stage: "CONTEXT_INJECTION",
        context_files: [],
        last_updated: new Date().toISOString()
      }
    };
    writeYaml(this.filePath, payload);
    return payload;
  }

  updateStage(stage: IntentStage) {
    const data = this.getActiveIntent();
    if (!data.active_intent) return;

    data.active_intent.stage = stage;
    data.active_intent.last_updated = new Date().toISOString();
    writeYaml(this.filePath, data);
  }

  attachContextFiles(files: string[]) {
    const data = this.getActiveIntent();
    if (!data.active_intent) return;

    data.active_intent.context_files = files;
    data.active_intent.last_updated = new Date().toISOString();
    writeYaml(this.filePath, data);
  }
}
