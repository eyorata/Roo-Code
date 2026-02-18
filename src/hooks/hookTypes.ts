export type HookStage =
  | "PreToolUse"
  | "PostToolUse";

export interface HookContext {
  sessionId: string;
  intentId?: string;
  toolName: string;
  args: any;
  timestamp: string;
  workspaceRoot?: string;
}

export type HookDecision =
  | { allowed: true }
  | { allowed: false; reason: string; requiresApproval?: boolean };

export type HookHandler = (ctx: HookContext) => Promise<HookDecision | void>;
