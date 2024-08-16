import { CardType } from "./Question";

import { Parser } from "peggy";
import { generateParser } from "./generateParser";

export interface ParserOptions {
    singleLineCardSeparator: string,
    singleLineReversedCardSeparator: string,
    multilineCardSeparator: string,
    multilineReversedCardSeparator: string,
    multilineCardEndMarker: string,
    convertHighlightsToClozes: boolean,
    convertBoldTextToClozes: boolean,
    convertCurlyBracketsToClozes: boolean,
}

export function areParserOptionsEqual(options1: ParserOptions, options2: ParserOptions): boolean {
    return (
        options1.singleLineCardSeparator === options2.singleLineCardSeparator &&
        options1.singleLineReversedCardSeparator === options2.singleLineReversedCardSeparator &&
        options1.multilineCardSeparator === options2.multilineCardSeparator &&
        options1.multilineReversedCardSeparator === options2.multilineReversedCardSeparator &&
        options1.multilineCardEndMarker === options2.multilineCardEndMarker &&
        options1.convertHighlightsToClozes === options2.convertHighlightsToClozes &&
        options1.convertBoldTextToClozes === options2.convertBoldTextToClozes &&
        options1.convertCurlyBracketsToClozes === options2.convertCurlyBracketsToClozes
    );
}

export function copyParserOptions(src: ParserOptions): ParserOptions {
    return {
        singleLineCardSeparator:src.singleLineCardSeparator,
        singleLineReversedCardSeparator:src.singleLineReversedCardSeparator,
        multilineCardSeparator:src.multilineCardSeparator,
        multilineReversedCardSeparator:src.multilineReversedCardSeparator,
        multilineCardEndMarker:src.multilineCardEndMarker,
        convertHighlightsToClozes:src.convertHighlightsToClozes,
        convertBoldTextToClozes:src.convertBoldTextToClozes,
        convertCurlyBracketsToClozes:src.convertCurlyBracketsToClozes,
    };
}

export class ParsedQuestionInfo {
	cardType: CardType;
	text: string;

	// Line numbers start at 0
	firstLineNum: number;
	lastLineNum: number;

	constructor(cardType: CardType, text: string, firstLineNum: number, lastLineNum: number) {
        this.cardType = cardType;
		this.text = text; // text.replace(/\s*$/gm, ""); // reproduce the same old behavior as when adding new lines with trimEnd. It is not clear why we need it in real life. However, it is needed to pass the tests.
		this.firstLineNum = firstLineNum;
		this.lastLineNum = lastLineNum;
	}

	isQuestionLineNum(lineNum: number): boolean {
		return lineNum >= this.firstLineNum && lineNum <= this.lastLineNum;
	}
}

/**
 * Returns flashcards found in `text`
 *
 * It is best that the text does not contain frontmatter, see extractFrontmatter for reasoning
 *
 * @param text - The text to extract flashcards from
 * @param settings - Plugin's settings
 * @returns An array of [CardType, card text, line number] tuples
 */
export function parseEx(
	text: string,
    options: ParserOptions,
): ParsedQuestionInfo[] {

    // console.log("<<<" + text + ">>>");

	let cards: ParsedQuestionInfo[] = [];

    const parser: Parser = generateParser(options);

    // Use this function when you call the parse method
	try {
		cards = parser.parse(text + "\n\n\n",  {
			CardType,
			createParsedQuestionInfo: (cardType: CardType, text: string, firstLineNum: number, lastLineNum: number) => {
				return new ParsedQuestionInfo(cardType, text, firstLineNum, lastLineNum);
			}
		});
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.error("Syntax error:", error);
		} else {
			console.error("Unexpected error:", error);
		}
	}

    // console.log(cards);

	return cards;
}
