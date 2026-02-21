import * as fs from "fs"
import * as path from "path"
import { readYaml, writeYaml } from "./yamlStore"

export type IntentStage = "INTENT_SELECTION" | "CONTEXT_INJECTION" | "TOOL_EXECUTION"

export interface IntentSpec {
	id: string
	name: string
	status: "IN_PROGRESS" | "ACTIVE" | "BLOCKED" | "DONE" | string
	owned_scope: string[]
	constraints: string[]
	acceptance_criteria: string[]
	allowed_tools?: string[]
}

export interface SessionIntentState {
	intent_id: string
	intent_type: string
	summary: string
	stage: IntentStage
	context_files: string[]
	last_updated: string
}

export interface ActiveIntentsFile {
	active_intents: IntentSpec[]
	sessions: Record<string, SessionIntentState>
}

const defaultActiveIntents: ActiveIntentsFile = {
	active_intents: [],
	sessions: {},
}

const normalizePath = (value: string) => value.replace(/\\/g, "/")

const globToRegExp = (glob: string): RegExp => {
	const escaped = glob
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "___DOUBLE_WILDCARD___")
		.replace(/\*/g, "[^/]*")
		.replace(/___DOUBLE_WILDCARD___/g, ".*")
	return new RegExp(`^${escaped}$`)
}

export class IntentManager {
	private readonly filePath: string
	private readonly intentIgnorePath: string

	constructor(private readonly workspaceRoot: string) {
		this.filePath = path.join(workspaceRoot, ".orchestration", "active_intents.yaml")
		this.intentIgnorePath = path.join(workspaceRoot, ".intentignore")
	}

	getState(): ActiveIntentsFile {
		const data = readYaml(this.filePath) as Partial<ActiveIntentsFile> | null
		return {
			active_intents: Array.isArray(data?.active_intents) ? data.active_intents : [],
			sessions: data?.sessions && typeof data.sessions === "object" ? data.sessions : {},
		}
	}

	getIntentById(intentId: string): IntentSpec | undefined {
		return this.getState().active_intents.find((intent) => intent.id === intentId)
	}

	getIntentIds(): string[] {
		return this.getState().active_intents.map((intent) => intent.id)
	}

	getSessionIntent(sessionId: string): SessionIntentState | undefined {
		return this.getState().sessions[sessionId]
	}

	requireSessionIntent(sessionId: string): SessionIntentState {
		const sessionIntent = this.getSessionIntent(sessionId)
		if (!sessionIntent) {
			throw new Error("You must cite a valid active Intent ID.")
		}
		return sessionIntent
	}

	setActiveIntent(sessionId: string, intentId: string, intentType: string, summary: string): ActiveIntentsFile {
		const state = this.getState()
		state.sessions[sessionId] = {
			intent_id: intentId,
			intent_type: intentType,
			summary,
			stage: "CONTEXT_INJECTION",
			context_files: [],
			last_updated: new Date().toISOString(),
		}
		writeYaml(this.filePath, state)
		return state
	}

	updateStage(sessionId: string, stage: IntentStage): void {
		const state = this.getState()
		const sessionIntent = state.sessions[sessionId]
		if (!sessionIntent) {
			return
		}
		sessionIntent.stage = stage
		sessionIntent.last_updated = new Date().toISOString()
		writeYaml(this.filePath, state)
	}

	attachContextFiles(sessionId: string, files: string[]): void {
		const state = this.getState()
		const sessionIntent = state.sessions[sessionId]
		if (!sessionIntent) {
			return
		}
		sessionIntent.context_files = files
		sessionIntent.last_updated = new Date().toISOString()
		writeYaml(this.filePath, state)
	}

	getIntentContext(intentId: string): { intent: IntentSpec; constraints: string[]; ownedScope: string[] } {
		const intent = this.getIntentById(intentId)
		if (!intent) {
			throw new Error("You must cite a valid active Intent ID.")
		}
		return {
			intent,
			constraints: intent.constraints ?? [],
			ownedScope: intent.owned_scope ?? [],
		}
	}

	selectIntentByPrompt(summary: string, intentType?: string): IntentSpec | undefined {
		const intents = this.getState().active_intents
		const tokens = `${summary} ${intentType ?? ""}`
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter(Boolean)

		let best: { score: number; intent?: IntentSpec } = { score: 0 }

		for (const intent of intents) {
			const haystack = [
				intent.id,
				intent.name,
				...(intent.constraints ?? []),
				...(intent.owned_scope ?? []),
				...(intent.allowed_tools ?? []),
			]
				.join(" ")
				.toLowerCase()

			const score = tokens.reduce((acc, token) => (haystack.includes(token) ? acc + 1 : acc), 0)
			if (score > best.score) {
				best = { score, intent }
			}
		}

		return best.score > 0 ? best.intent : intents[0]
	}

	isToolAllowed(intentId: string, toolName: string): boolean {
		const intent = this.getIntentById(intentId)
		if (!intent) {
			return false
		}
		const allowed = intent.allowed_tools
		if (!allowed || allowed.length === 0) {
			return true
		}
		return allowed.includes(toolName) || allowed.includes("*")
	}

	isPathInScope(intentId: string, relativePath: string): boolean {
		const intent = this.getIntentById(intentId)
		if (!intent) {
			return false
		}
		const target = normalizePath(relativePath)
		return intent.owned_scope.some((scopePattern) => globToRegExp(normalizePath(scopePattern)).test(target))
	}

	isIntentIgnored(relativePath: string): boolean {
		if (!fs.existsSync(this.intentIgnorePath)) {
			return false
		}
		const target = normalizePath(relativePath)
		const raw = fs.readFileSync(this.intentIgnorePath, "utf-8")
		const patterns = raw
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"))
		return patterns.some((pattern) => globToRegExp(normalizePath(pattern)).test(target))
	}

	toRelativePath(filePath: string): string {
		return normalizePath(path.relative(this.workspaceRoot, filePath))
	}

	getIntentContextXml(intentId: string): string {
		const { intent, constraints, ownedScope } = this.getIntentContext(intentId)
		const constraintRows = constraints.map((constraint) => `<constraint>${constraint}</constraint>`).join("")
		const scopeRows = ownedScope.map((scope) => `<path>${scope}</path>`).join("")
		const toolRows = (intent.allowed_tools ?? []).map((tool) => `<tool>${tool}</tool>`).join("")
		return `<intent_context><id>${intent.id}</id><name>${intent.name}</name><constraints>${constraintRows}</constraints><owned_scope>${scopeRows}</owned_scope><allowed_tools>${toolRows}</allowed_tools></intent_context>`
	}
}
