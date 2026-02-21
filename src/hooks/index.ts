import { HookRegistry } from "./hookRegistry"
import { HookEngine } from "./hookEngine"
import { preToolUseHook } from "./preToolUse"
import { postToolUseHook } from "./postToolUse"
import { postIntentSelection } from "./hooks/postIntentSelection"

export function createHookEngine() {
	const registry = new HookRegistry()

	registry.register("PreToolUse", preToolUseHook)
	registry.register("PostToolUse", postToolUseHook)
	registry.register("PostIntentSelection", postIntentSelection)

	return new HookEngine(registry)
}
