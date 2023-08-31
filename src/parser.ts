import { QuestionType } from "./question";


/**
 * Returns flashcards found in `text`
 *
 * @param text - The text to extract flashcards from
 * @param singlelineCardSeparator - Separator for inline basic cards
 * @param singlelineReversedCardSeparator - Separator for inline reversed cards
 * @param multilineCardSeparator - Separator for multiline basic cards
 * @param multilineReversedCardSeparator - Separator for multiline basic card
 * @returns An array of [CardType, card text, line number] tuples
 */
export function parse(
    text: string,
    singlelineCardSeparator: string,
    singlelineReversedCardSeparator: string,
    multilineCardSeparator: string,
    multilineReversedCardSeparator: string,
    convertHighlightsToClozes: boolean,
    convertBoldTextToClozes: boolean,
    convertCurlyBracketsToClozes: boolean,
): [QuestionType, string, number][] {
    let cardText = "";
    const cards: [QuestionType, string, number][] = [];
    let cardType: QuestionType | null = null;
    let lineNo = 0;

    const lines: string[] = text.replaceAll("\r\n", "\n").split("\n");
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        if (currentLine.length === 0) {
            if (cardType) {
                cards.push([cardType, cardText, lineNo]);
                cardType = null;
            }

            cardText = "";
            continue;
        } else if (currentLine.startsWith("<!--") && !currentLine.startsWith("<!--SR:")) {
            while (i + 1 < lines.length && !currentLine.includes("-->")) i++;
            i++;
            continue;
        }

        if (cardText.length > 0) {
            cardText += "\n";
        }
        cardText += currentLine.trimEnd();

        if (
            currentLine.includes(singlelineReversedCardSeparator) ||
            currentLine.includes(singlelineCardSeparator)
        ) {
            cardType = lines[i].includes(singlelineReversedCardSeparator)
                ? QuestionType.SingleLineReversed
                : QuestionType.SingleLineBasic;
            cardText = lines[i];
            lineNo = i;
            if (i + 1 < lines.length && lines[i + 1].startsWith("<!--SR:")) {
                cardText += "\n" + lines[i + 1];
                i++;
            }
            cards.push([cardType, cardText, lineNo]);
            cardType = null;
            cardText = "";
        } else if (
            cardType === null &&
            ((convertHighlightsToClozes && /==.*?==/gm.test(currentLine)) ||
                (convertBoldTextToClozes && /\*\*.*?\*\*/gm.test(currentLine)) ||
                (convertCurlyBracketsToClozes && /{{.*?}}/gm.test(currentLine)))
        ) {
            cardType = QuestionType.Cloze;
            lineNo = i;
        } else if (currentLine.trim() === multilineCardSeparator) {
            cardType = QuestionType.MultiLineBasic;
            lineNo = i;
        } else if (currentLine.trim() === multilineReversedCardSeparator) {
            cardType = QuestionType.MultiLineReversed;
            lineNo = i;
        } else if (currentLine.startsWith("```") || currentLine.startsWith("~~~")) {
            const codeBlockClose = currentLine.match(/`+|~+/)[0];
            while (i + 1 < lines.length && !lines[i + 1].startsWith(codeBlockClose)) {
                i++;
                cardText += "\n" + lines[i];
            }
            cardText += "\n" + codeBlockClose;
            i++;
        }
    }

    if (cardType && cardText) {
        cards.push([cardType, cardText, lineNo]);
    }

    return cards;
}
