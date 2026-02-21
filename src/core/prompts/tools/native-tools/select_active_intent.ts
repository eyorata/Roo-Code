import type OpenAI from "openai"

const SELECT_ACTIVE_INTENT_DESCRIPTION = `Declare the active intent for this turn before any mutating tool call. This loads intent scope and constraints for governed execution.`

export default {
	type: "function",
	function: {
		name: "select_active_intent",
		description: SELECT_ACTIVE_INTENT_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				intent_id: {
					type: "string",
					description: "Active intent identifier (for example INT-001).",
				},
				intent_type: {
					type: "string",
					description: "Intent category such as refactor, feature, or fix.",
				},
				summary: {
					type: "string",
					description: "Short summary of the intent for this turn.",
				},
			},
			required: ["intent_id", "intent_type", "summary"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
