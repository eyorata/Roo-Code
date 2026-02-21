import { HookContext, HookDecision, HookHandler, HookStage } from "./hookTypes"
import { preToolUseHook } from "./preToolUse"
import { postToolUseHook } from "./postToolUse"
import { postIntentSelection } from "./hooks/postIntentSelection"

export class HookRegistry {
	private handlers = new Map<HookStage, HookHandler>()

	register(stage: HookStage, handler: HookHandler): void {
		this.handlers.set(stage, handler)
	}

	async execute(stage: HookStage, ctx: HookContext): Promise<HookDecision | void> {
		const handler = this.handlers.get(stage)
		if (!handler) {
			return
		}
		return handler(ctx)
	}
}

export const hookRegistry = new HookRegistry()
hookRegistry.register("PreToolUse", preToolUseHook)
hookRegistry.register("PostToolUse", postToolUseHook)
hookRegistry.register("PostIntentSelection", postIntentSelection as HookHandler)
