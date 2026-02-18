import { HookRegistry } from "./hookRegistry";
import { HookContext, HookDecision, HookStage } from "./hookTypes";

export class HookEngine {
  constructor(private registry: HookRegistry) {}

  async run(stage: HookStage, ctx: HookContext): Promise<HookDecision> {
    const hooks = this.registry.get(stage);

    for (const hook of hooks) {
      const result = await hook(ctx);

      if (result && result.allowed === false) {
        return result;
      }
    }

    return { allowed: true };
  }
}
