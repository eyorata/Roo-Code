import * as fs from "fs"
import * as path from "path"
import YAML from "yaml"

export function readYaml(filePath: string): any {
	if (!fs.existsSync(filePath)) return null
	const raw = fs.readFileSync(filePath, "utf-8")
	return YAML.parse(raw)
}

export function writeYaml(filePath: string, data: any): void {
	const raw = YAML.stringify(data, { lineWidth: 120 })
	fs.mkdirSync(path.dirname(filePath), { recursive: true })
	fs.writeFileSync(filePath, raw, "utf-8")
}
