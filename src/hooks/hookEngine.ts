import { HookContext, HookDecision } from "./hookTypes"
import { HookRegistry, hookRegistry } from "./hookRegistry"

export class HookEngine {
	constructor(private readonly registry: HookRegistry = hookRegistry) {}

	async runPreToolUse(ctx: HookContext): Promise<void> {
		const decision = (await this.registry.execute("PreToolUse", ctx)) as HookDecision | void

		if (decision && !decision.allowed) {
			throw new Error(decision.reason)
		}
	}

	async runPostIntentSelection(ctx: HookContext): Promise<void> {
		await this.registry.execute("PostIntentSelection", ctx)
	}

	async runPostToolUse(ctx: HookContext): Promise<void> {
		await this.registry.execute("PostToolUse", ctx)
	}
}
