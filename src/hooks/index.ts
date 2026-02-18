import { HookRegistry } from "./hookRegistry";
import { HookEngine } from "./hookEngine";
import { preToolUseHook } from "./preToolUse";
import { postToolUseHook } from "./postToolUse";

export function createHookEngine() {
  const registry = new HookRegistry();

  registry.register("PreToolUse", preToolUseHook);
  registry.register("PostToolUse", postToolUseHook);

  return new HookEngine(registry);
}
