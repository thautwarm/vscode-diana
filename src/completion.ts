import * as os from "os";
import * as vscode from 'vscode';
import { DianaScriptLexer } from "./DianaScriptLexer";
import { Token } from 'antlr4ts';
import { parseText } from './hightlight';
import * as fs from 'fs';
import { join } from "path";

function _getLineSpanN(s: string, n: number) {
	let i = 0;
	let k;
	for (k = 0; k < n; k++) {
		i = s.indexOf(os.EOL, i);
		if (i == undefined)
			return undefined;
		i += os.EOL.length;
	}
	return i;
}


function _compItem(s: string, type: string, doc: string) {
	const item = new vscode.CompletionItem(s);
	item.insertText = s;
	if (type == "")
		item.label = s;
	else
		item.label = type;
	item.detail = doc;
	return item;
}

interface Method {
	name: string,
	type: string | undefined,
	doc: string | undefined

}
interface Module {
	module: string,
	doc: string,
	methods: Array<Method>
}
function eventFunc(uri: vscode.Uri) {
	vscode.workspace.openTextDocument(uri).then((document) => {
		try {
			const mods: Array<Module> = JSON.parse(document.getText());
			builtinModules.clear();
			for (const mod of mods) {
				builtinModules.set(mod.module,
					mod.methods.map((meth) =>
						_compItem(
							meth.name,
							meth.type ?? "",
							meth.doc ?? "")));
			}
		}
		catch (e) {
			return;
		}
		return;

	});
}


const watcher = vscode.workspace.createFileSystemWatcher("**/sigs.diana.json", false, false);
watcher.onDidChange(eventFunc);
watcher.onDidCreate(eventFunc);


// I don't know how to call the event at startup, so...😅
const filepath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
if (filepath != undefined)
	eventFunc(vscode.Uri.file(join(filepath, "sigs.diana.json")));

const builtinModules = new Map<string, vscode.CompletionItem[]>();

export class DianaCompletionItemProvider implements vscode.CompletionItemProvider {
	public provideCompletionItems(
		document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
		Thenable<vscode.CompletionItem[]> {
		const docstr = document.getText();
		const start = _getLineSpanN(docstr, position.line);
		if (start == undefined)
			return Promise.resolve().then(() => []);
		let each: Token | undefined = undefined;
		for (const tk of parseText(docstr.substr(start, position.character - 1))) {
			each = tk;
		}
		if (each != undefined)
			if (each.type == DianaScriptLexer.NAME_13 && each.text) {
				const lst = builtinModules.get(each.text);
				if (lst != undefined)
					return Promise.resolve().then(() => lst);
			}

		return Promise.resolve().then(() => []);

	}
}