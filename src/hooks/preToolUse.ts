import { HookHandler } from "./hookTypes";

const FORBIDDEN_TERMINAL_PATTERNS = [
  /rm\s+-rf\s+\//i,
  /sudo\s+rm\s+-rf/i,
  /del\s+\/s/i,
  /format\s+/i,
];

export const preToolUseHook: HookHandler = async (ctx) => {
  if (ctx.toolName === "terminal") {
    const cmd = String(ctx.args?.command ?? "");

    for (const pattern of FORBIDDEN_TERMINAL_PATTERNS) {
      if (pattern.test(cmd)) {
        return {
          allowed: false,
          reason: `Blocked dangerous terminal command: ${cmd}`,
          requiresApproval: true,
        };
      }
    }
  }

  return { allowed: true };
};
