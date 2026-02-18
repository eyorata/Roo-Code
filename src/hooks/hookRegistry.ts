import { HookHandler, HookStage } from "./hookTypes";

export class HookRegistry {
  private hooks: Record<HookStage, HookHandler[]> = {
    PreToolUse: [],
    PostToolUse: [],
  };

  register(stage: HookStage, handler: HookHandler) {
    this.hooks[stage].push(handler);
  }

  get(stage: HookStage): HookHandler[] {
    return this.hooks[stage];
  }
}
