import { HookContext, HookDecision } from "./hookTypes";
import { hookRegistry } from "./hookRegistry";

export class HookEngine {
  async runPreToolUse(ctx: HookContext): Promise<void> {
    const decision: HookDecision = await hookRegistry.preToolUse(ctx);

    if (!decision.allowed) {
      throw new Error(decision.reason);
    }
  }

  async runPostIntentSelection(ctx: HookContext): Promise<void> {
    if (hookRegistry.postIntentSelection) {
      await hookRegistry.postIntentSelection(ctx);
    }
  }
}
