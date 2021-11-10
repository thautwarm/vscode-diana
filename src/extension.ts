import * as vscode from 'vscode';
import { DocumentSemanticTokensProvider, legend } from "./hightlight";
import { DianaCompletionItemProvider } from "./completion";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ scheme: 'file', language: 'diana' }, new DocumentSemanticTokensProvider(), legend));

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			{ scheme: 'file', language: 'diana' }, new DianaCompletionItemProvider(), '.'));
}
