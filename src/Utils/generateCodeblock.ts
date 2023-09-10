import { stringifyYaml } from 'obsidian';
import { CODEBLOCK_NAME } from 'src/Settings';
import { SetDefinition } from 'src/Views/components/renderCodeBlock';
export function generateCodeblock(def: SetDefinition): string {
    let code = "```" + CODEBLOCK_NAME + "\n";
    code += stringifyYaml(def);
    code += "\n```\n";
    return code;
}
