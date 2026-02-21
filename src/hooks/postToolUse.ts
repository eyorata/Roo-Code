import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"
import { randomUUID } from "crypto"
import { execSync } from "child_process"
import { IntentManager } from "../orchestration/intentManager"
import { HookHandler } from "./hookTypes"

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

const sha256 = (value: string) => `sha256:${crypto.createHash("sha256").update(value, "utf8").digest("hex")}`

const readLastJsonLine = (filePath: string): any | undefined => {
	if (!fs.existsSync(filePath)) {
		return undefined
	}
	const lines = fs
		.readFileSync(filePath, "utf8")
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
	if (lines.length === 0) {
		return undefined
	}
	try {
		return JSON.parse(lines[lines.length - 1])
	} catch {
		return undefined
	}
}

const getGitRevision = (workspaceRoot: string): string => {
	try {
		return execSync("git rev-parse HEAD", { cwd: workspaceRoot, stdio: ["ignore", "pipe", "ignore"] })
			.toString()
			.trim()
	} catch {
		return "unknown"
	}
}

export const postToolUseHook: HookHandler = async (ctx) => {
	if (!WRITE_TOOLS.has(ctx.toolName)) {
		return { allowed: true }
	}

	const workspaceRoot = ctx.workspaceRoot ?? process.cwd()
	const orchestrationDir = path.join(workspaceRoot, ".orchestration")
	fs.mkdirSync(orchestrationDir, { recursive: true })
	const intentManager = new IntentManager(workspaceRoot)
	const sessionIntentId = intentManager.getSessionIntent(ctx.sessionId)?.intent_id
	const resolvedIntentId = ctx.intentId ?? sessionIntentId ?? "UNKNOWN-INTENT"

	const targetPathArg = String(ctx.args?.path ?? ctx.args?.file_path ?? "")
	if (!targetPathArg) {
		return { allowed: true }
	}

	const absolutePath = path.isAbsolute(targetPathArg) ? targetPathArg : path.join(workspaceRoot, targetPathArg)
	const relativePath = path.relative(workspaceRoot, absolutePath).replace(/\\/g, "/")
	const content = String(ctx.args?.content ?? "")
	const lineCount = content === "" ? 1 : content.split(/\r?\n/).length
	const contentHash = sha256(content)
	const tracePath = path.join(orchestrationDir, "agent_trace.jsonl")

	// Deduplicate noisy repeated writes from streaming retries: if the latest record
	// has same file + hash + intent + conversation, skip appending.
	const lastRecord = readLastJsonLine(tracePath)
	const lastConversation = lastRecord?.files?.[0]?.conversations?.[0]
	const lastRange = lastConversation?.ranges?.[0]
	const isDuplicate =
		lastRecord?.files?.[0]?.relative_path === relativePath &&
		lastConversation?.url === (ctx.conversationUrl ?? ctx.sessionId) &&
		lastConversation?.related?.[0]?.value === resolvedIntentId &&
		lastRange?.content_hash === contentHash
	if (isDuplicate) {
		return { allowed: true }
	}

	const traceRecord = {
		id: randomUUID(),
		timestamp: ctx.timestamp,
		vcs: { revision_id: getGitRevision(workspaceRoot) },
		files: [
			{
				relative_path: relativePath,
				conversations: [
					{
						url: ctx.conversationUrl ?? ctx.sessionId,
						contributor: {
							entity_type: "AI",
							model_identifier: ctx.modelIdentifier ?? "unknown-model",
						},
						mutation_class: ctx.mutationClass ?? "AST_REFACTOR",
						ranges: [
							{
								start_line: 1,
								end_line: lineCount,
								content_hash: contentHash,
							},
						],
						related: [
							{
								type: "specification",
								value: resolvedIntentId,
							},
						],
					},
				],
			},
		],
	}

	fs.appendFileSync(tracePath, JSON.stringify(traceRecord) + "\n", "utf8")

	const mapPath = path.join(orchestrationDir, "intent_map.md")
	const line = `- ${new Date().toISOString()} | ${resolvedIntentId} -> ${relativePath} (${ctx.mutationClass ?? "AST_REFACTOR"})`
	if (!fs.existsSync(mapPath)) {
		fs.writeFileSync(mapPath, "# Intent Map\n\n## Timeline\n", "utf8")
	}
	const mapLines = fs
		.readFileSync(mapPath, "utf8")
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean)
	const mapLast = mapLines[mapLines.length - 1]
	if (mapLast !== line.trim()) {
		fs.appendFileSync(mapPath, `${line}\n`, "utf8")
	}

	return { allowed: true }
}
