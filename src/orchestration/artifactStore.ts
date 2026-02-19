import * as fs from "fs";
import * as path from "path";

export class ArtifactStore {
  private traceFile: string;

  constructor(workspaceRoot: string) {
    this.traceFile = path.join(workspaceRoot, ".orchestration", "agent_trace.jsonl");
    fs.mkdirSync(path.dirname(this.traceFile), { recursive: true });
  }

  appendTrace(event: any) {
    const line = JSON.stringify(event);
    fs.appendFileSync(this.traceFile, line + "\n", "utf-8");
  }
}
