import fs from "fs";
import path from "path";
import { HookHandler } from "./hookTypes";

export const postToolUseHook: HookHandler = async (ctx) => {
  const root = ctx.workspaceRoot ?? process.cwd();
  const orchestrationDir = path.join(root, ".orchestration");

  if (!fs.existsSync(orchestrationDir)) {
    fs.mkdirSync(orchestrationDir, { recursive: true });
  }

  const tracePath = path.join(orchestrationDir, "agent_trace.jsonl");

  const record = {
    event: "PostToolUse",
    session_id: ctx.sessionId,
    intent_id: ctx.intentId ?? null,
    tool: ctx.toolName,
    timestamp: ctx.timestamp,
    args: ctx.args,
  };

  fs.appendFileSync(tracePath, JSON.stringify(record) + "\n", "utf8");

  return { allowed: true };
};
