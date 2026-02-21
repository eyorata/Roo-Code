import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"
import { IntentManager } from "../orchestration/intentManager"
import { HookHandler } from "./hookTypes"

const INTENT_SELECT_TOOLS = new Set(["select_active_intent", "select_intent"])
const WRITE_TOOLS = new Set([
	"write_file",
	"write_to_file",
	"replace_in_file",
	"apply_diff",
	"edit",
	"search_and_replace",
	"search_replace",
	"edit_file",
	"apply_patch",
])
const DESTRUCTIVE_TOOLS = new Set(["execute_command", "terminal", ...WRITE_TOOLS])

const FORBIDDEN_TERMINAL_PATTERNS = [/rm\s+-rf\s+\//i, /sudo\s+rm\s+-rf/i, /del\s+\/s/i, /format\s+/i]

const sha256 = (value: string) => `sha256:${crypto.createHash("sha256").update(value, "utf8").digest("hex")}`

const resolveTargetPath = (args: any): string => {
	if (!args || typeof args !== "object") {
		return ""
	}
	return String(args.path ?? args.file_path ?? "")
}

export const preToolUseHook: HookHandler = async (ctx) => {
	const workspaceRoot = ctx.workspaceRoot ?? process.cwd()
	const intentManager = new IntentManager(workspaceRoot)
	const isIntentSelect = INTENT_SELECT_TOOLS.has(ctx.toolName)
	const isDestructive = DESTRUCTIVE_TOOLS.has(ctx.toolName)

	if (!isIntentSelect) {
		const sessionIntent = intentManager.getSessionIntent(ctx.sessionId)
		if (!sessionIntent || !sessionIntent.intent_id) {
			return { allowed: false, reason: "You must cite a valid active Intent ID." }
		}
		if (sessionIntent.stage !== "TOOL_EXECUTION") {
			return {
				allowed: false,
				reason: "Context injection incomplete. Select active intent before tool execution.",
			}
		}
		ctx.intentId = sessionIntent.intent_id
	}

	if (ctx.toolName === "terminal" || ctx.toolName === "execute_command") {
		const command = String(ctx.args?.command ?? "")
		for (const pattern of FORBIDDEN_TERMINAL_PATTERNS) {
			if (pattern.test(command)) {
				return {
					allowed: false,
					reason: `Blocked dangerous terminal command: ${command}`,
					requiresApproval: true,
				}
			}
		}
	}

	if (isDestructive && ctx.hitlApproved === false) {
		return { allowed: false, reason: "HITL authorization required for destructive action.", requiresApproval: true }
	}

	if (WRITE_TOOLS.has(ctx.toolName)) {
		const targetPath = resolveTargetPath(ctx.args)
		if (!targetPath) {
			if (ctx.toolName === "apply_patch") {
				return { allowed: true }
			}
			return { allowed: false, reason: `${ctx.toolName} requires a target path.` }
		}

		const absolutePath = path.isAbsolute(targetPath) ? targetPath : path.join(workspaceRoot, targetPath)
		const relativePath = intentManager.toRelativePath(absolutePath)
		const activeIntentId = ctx.intentId ?? intentManager.getSessionIntent(ctx.sessionId)?.intent_id
		if (!activeIntentId) {
			return { allowed: false, reason: "You must cite a valid active Intent ID." }
		}

		if (intentManager.isIntentIgnored(relativePath)) {
			return { allowed: false, reason: `Intent policy ignored for path: ${relativePath}` }
		}

		if (!intentManager.isPathInScope(activeIntentId, relativePath)) {
			return {
				allowed: false,
				reason: `Scope Violation: ${activeIntentId} is not authorized to edit ${relativePath}. Request scope expansion.`,
			}
		}

		const expectedFileHash = ctx.args?.expected_file_hash as string | undefined
		if (expectedFileHash && fs.existsSync(absolutePath)) {
			const diskHash = sha256(fs.readFileSync(absolutePath, "utf8"))
			if (diskHash !== expectedFileHash) {
				return {
					allowed: false,
					reason: `Stale File: ${relativePath} changed since read. Re-read file before writing.`,
				}
			}
		}
	}

	return { allowed: true }
}
