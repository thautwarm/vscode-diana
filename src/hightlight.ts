import * as vscode from 'vscode';
import * as antlr4ts from 'antlr4ts';
import * as os from 'os';
import { DianaScriptLexer } from './DianaScriptLexer';

const tokenTypesLegend = [
	'comment',
	'string',
	'keyword',
	'number',
	'regexp',
	'operator',
	'namespace',
	'type',
	'struct',
	'class',
	'interface',
	'enum',
	'typeParameter',
	'function',
	'method',
	'decorator',
	'macro',
	'variable',
	'parameter',
	'property',
	'label'
];

const tokenModifiersLegend = [
	'declaration',
	'documentation',
	'readonly',
	'static',
	'abstract',
	'deprecated',
	'modification',
	'async'
];

function getNativeTokenId(s: string): number {
	return tokenTypesLegend.indexOf(s);
}

const tokenTypes = new Map<number, number>([
	[DianaScriptLexer.COMMENT_1, getNativeTokenId("comment")],
	[DianaScriptLexer.FLOAT_11, getNativeTokenId("number")],
	[DianaScriptLexer.INT_10, getNativeTokenId("number")],
	[DianaScriptLexer.STR_4, getNativeTokenId("string")],
	[DianaScriptLexer.NAME_13, getNativeTokenId("variable")],
	[DianaScriptLexer.HEX_7, getNativeTokenId("number")],
	[DianaScriptLexer.OCT_8, getNativeTokenId("number")],
	[DianaScriptLexer.BIN_9, getNativeTokenId("number")],
	[DianaScriptLexer.SINGLE_BINOP_2, getNativeTokenId("operator")],
]);

const keywords = new Set<string>([
	"fun",
	"for",
	"end",
	"if",
	"elif",
	"do",
	"while",
	"loop",
	"and",
	"or",
	"not",
	"in",
	"break",
	"continue",
	"return",
	"var"
]);

const __KEYWORD = getNativeTokenId("keyword");
for (const ruleName of DianaScriptLexer.ruleNames) {
	if (ruleName.startsWith("T")) {
		const tokenType = <number>(<any>DianaScriptLexer)[ruleName];
		const litName = DianaScriptLexer.VOCABULARY.getLiteralName(tokenType);
		if (litName == undefined)
			continue;
		if (!(litName.startsWith("'") && litName.endsWith("'")))
			continue;
		if (keywords.has(litName.substr(1, litName.length - 2))) {
			tokenTypes.set(tokenType, __KEYWORD);
		}
	}
}

export const legend = new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);

export function parseText(text: string) {
	const inputStream = antlr4ts.CharStreams.fromString(text);
	const lexer = new DianaScriptLexer(inputStream);
	const EOF = DianaScriptLexer.EOF;
	function* genstream() {
		while (true) {
			const token = lexer.nextToken();
			if (token.type == EOF)
				break;
			yield token;
		}
	}
	return genstream();
}

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
		const iter = parseText(document.getText());
		const builder = new vscode.SemanticTokensBuilder();

		while (true) {
			const curr = iter.next();
			if (curr.done)
				break;

			const token = curr.value;
			if (token.text == undefined)
				continue;

			const type = tokenTypes.get(token.type);
			if (type == undefined)
				continue;

			builder.push(token.line - 1, token.charPositionInLine, token.stopIndex - token.startIndex + 1, type, 0);
		}
		return builder.build();
	}
}




