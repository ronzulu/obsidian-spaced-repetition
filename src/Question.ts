import { Card } from "./Card";
import {
    OBSIDIAN_BLOCK_ID_ENDOFLINE_REGEX,
    OBSIDIAN_TAG_AT_STARTOFLINE_REGEX,
    SR_HTML_COMMENT_BEGIN,
    SR_HTML_COMMENT_END,
} from "./constants";
import { DataStore } from "./dataStore/base/DataStore";
import { DataStoreAlgorithm } from "./dataStoreAlgorithm/DataStoreAlgorithm";
import { Note } from "./Note";
import { SRSettings } from "./settings";
import { TopicPath, TopicPathWithWs } from "./TopicPath";
import { MultiLineTextFinder } from "./util/MultiLineTextFinder";
import { cyrb53, stringTrimStart } from "./util/utils";

export enum CardType {
    SingleLineBasic,
    SingleLineReversed,
    MultiLineBasic,
    MultiLineReversed,
    Cloze,
}

//
// QuestionText comprises the following components:
//      1. QuestionTopicPath (optional, and if present there may be whitespace before)
//
//      2. Actual question text (mandatory)
//
//      3. Card schedule info as HTML comment (optional). If present then there is
//          optional whitespace after the question text, before this.
//          (whitespace always included when text is generated by formatForNote(), would only
//          be missing if manually removed by the user)
//
//      4. Obsidian block identifier (optional)
//
// Actual Question - Whitespace Handling
//
//      It is important that whitespace is maintained accurately by this class.
//
//      **Leading Whitespace**
//
//          It's important to retain the leading whitespace in the case where there is no QuestionTopicPath,
//          as leading whitespace is an indicator in markdown of the indent level.
//          see "[BUG] Problem with nested list item's indentation"
//          https://github.com/st3v3nmw/obsidian-spaced-repetition/issues/800
//
//          In the case where QuestionTopicPath is present, whitespace pre and post QuestionTopicPath
//          are retained so that if the question is written back to the file, for aesthetic reasons
//          there won't be any change to the whitespace.
//
//          However, actualQuestion will not have any leading spaces.
//
//      **Trailing Whitespace**
//
//         Trailing whitespace is always removed.
//
//         This is because Question.formatForNote() uses the whitespace generated by Question.getHtmlCommentSeparator()
//         as the separator between the end of the question text and the OSR html comment -
//         either a single space or a new line (settings based)
//
// For example
//
//  Actual question text only:
//      Q1::A1
//
//  Question text with topic path:
//      #flashcards/science  Q2::A2
//
//  Question text with card schedule info:
//      #flashcards/science  Q2::A2 <!--SR:!2023-10-16,34,290-->
//
//  Question text with card schedule info and block identifier:
//      #flashcards/science  Q2::A2 <!--SR:!2023-10-16,34,290--> ^d7cee0
//
//  Question text with block identifier:
//      Q2::A2 ^d7cee0
//
export class QuestionText {
    // Complete text including all components, as read from file
    original: string;

    // The question topic path (only present if topic path included in original text)
    // If present, it also includes whitespace before and after the topic path itself
    topicPathWithWs: TopicPathWithWs;

    // The question text, e.g. "Q1::A1" with leading/trailing whitespace as described above
    actualQuestion: string;

    // The block identifier (optional), e.g. "^quote-of-the-day"
    // Format of block identifiers:
    //      https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+block+in+a+note
    //      Block identifiers can only consist of letters, numbers, and dashes.
    // If present, then first character is "^"
    obsidianBlockId: string;

    // Hash of string  (topicPath + actualQuestion)
    // Explicitly excludes the HTML comment with the scheduling info
    textHash: string;

    constructor(
        original: string,
        topicPathWithWs: TopicPathWithWs,
        actualQuestion: string,
        blockId: string,
    ) {
        this.original = original;
        this.topicPathWithWs = topicPathWithWs;
        this.actualQuestion = actualQuestion;
        this.obsidianBlockId = blockId;

        // The hash is generated based on the topic and question, explicitly not the schedule or obsidian block ID
        this.textHash = cyrb53(this.formatTopicAndQuestion());
    }

    endsWithCodeBlock(): boolean {
        return this.actualQuestion.endsWith("```");
    }

    static create(original: string, settings: SRSettings): QuestionText {
        const [topicPathWithWs, actualQuestion, blockId] = this.splitText(original, settings);

        return new QuestionText(original, topicPathWithWs, actualQuestion, blockId);
    }

    static splitText(original: string, settings: SRSettings): [TopicPathWithWs, string, string] {
        const originalWithoutSR = DataStore.getInstance().questionRemoveScheduleInfo(original);
        let actualQuestion: string = originalWithoutSR.trimEnd();

        let topicPathWithWs: TopicPathWithWs = null;
        let blockId: string = null;

        // originalWithoutSR - [[preTopicPathWs] TopicPath [postTopicPathWs]] Question [whitespace blockId]
        const topicPath = TopicPath.getTopicPathFromCardText(originalWithoutSR);
        if (topicPath?.hasPath) {
            // cardText2 - TopicPath postTopicPathWs Question [whitespace blockId]
            const [preTopicPathWs, cardText2] = stringTrimStart(originalWithoutSR);

            // cardText3 - postTopicPathWs Question [whitespace blockId]
            const cardText3: string = cardText2.replaceAll(OBSIDIAN_TAG_AT_STARTOFLINE_REGEX, "");

            // actualQuestion - Question [whitespace blockId]
            let postTopicPathWs: string = null;
            [postTopicPathWs, actualQuestion] = stringTrimStart(cardText3);
            if (!settings.convertFoldersToDecks) {
                topicPathWithWs = new TopicPathWithWs(topicPath, preTopicPathWs, postTopicPathWs);
            }
        }

        // actualQuestion - Question [whitespace blockId]
        [actualQuestion, blockId] = this.extractObsidianBlockId(actualQuestion);

        return [topicPathWithWs, actualQuestion, blockId];
    }

    static extractObsidianBlockId(text: string): [string, string] {
        let question: string = text;
        let blockId: string = null;
        const match = text.match(OBSIDIAN_BLOCK_ID_ENDOFLINE_REGEX);
        if (match) {
            blockId = match[0].trim();
            const newLength = question.length - blockId.length;
            question = question.substring(0, newLength).trimEnd();
        }
        return [question, blockId];
    }

    formatTopicAndQuestion(): string {
        let result: string = "";
        if (this.topicPathWithWs) {
            result += this.topicPathWithWs.formatWithWs();
        }

        result += this.actualQuestion;
        return result;
    }
}

export class Question {
    note: Note;
    questionType: CardType;
    topicPath: TopicPath;
    questionText: QuestionText;
    lineNo: number;
    hasEditLaterTag: boolean;
    questionContext: string[];
    cards: Card[];
    hasChanged: boolean;

    constructor(init?: Partial<Question>) {
        Object.assign(this, init);
    }

    getHtmlCommentSeparator(settings: SRSettings): string {
        const sep: string = this.isCardCommentsOnSameLine(settings) ? " " : "\n";
        return sep;
    }

    isCardCommentsOnSameLine(settings: SRSettings): boolean {
        let result: boolean = settings.cardCommentOnSameLine;
        // Schedule info must be on next line if last block is a codeblock
        if (this.questionText.endsWithCodeBlock()) {
            result = false;
        }
        return result;
    }

    setCardList(cards: Card[]): void {
        this.cards = cards;
        this.cards.forEach((card) => (card.question = this));
    }

    formatForNote(settings: SRSettings): string {
        let result: string = this.questionText.formatTopicAndQuestion();
        const blockId: string = this.questionText.obsidianBlockId;
        const hasSchedule: boolean = this.cards.some((card) => card.hasSchedule);
        if (hasSchedule) {
            result = result.trimEnd();
            const scheduleHtml = DataStoreAlgorithm.getInstance().questionFormatScheduleAsHtmlComment(this);
            if (blockId) {
                if (this.isCardCommentsOnSameLine(settings))
                    result += ` ${scheduleHtml} ${blockId}`;
                else result += ` ${blockId}\n${scheduleHtml}`;
            } else {
                result += this.getHtmlCommentSeparator(settings) + scheduleHtml;
            }
        } else {
            // No schedule, so the block ID always comes after the question text, without anything after it
            if (blockId) result += ` ${blockId}`;
        }
        return result;
    }

    updateQuestionWithinNoteText(noteText: string, settings: SRSettings): string {
        const originalText: string = this.questionText.original;

        // Get the entire text for the question including:
        //      1. the topic path (if present),
        //      2. the question text
        //      3. the schedule HTML comment (if present)
        const replacementText = this.formatForNote(settings);

        let newText = MultiLineTextFinder.findAndReplace(noteText, originalText, replacementText);
        if (newText) {
            this.questionText = QuestionText.create(replacementText, settings);
        } else {
            console.error(
                `updateQuestionText: Text not found: ${originalText.substring(
                    0,
                    100,
                )} in note: ${noteText.substring(0, 100)}`,
            );
            newText = noteText;
        }
        return newText;
    }

    static Create(
        settings: SRSettings,
        questionType: CardType,
        noteTopicPath: TopicPath,
        originalText: string,
        lineNo: number,
        context: string[],
    ): Question {
        const hasEditLaterTag = originalText.includes(settings.editLaterTag);
        const questionText: QuestionText = QuestionText.create(originalText, settings);

        let topicPath: TopicPath = noteTopicPath;
        if (questionText.topicPathWithWs) {
            topicPath = questionText.topicPathWithWs.topicPath;
        }

        const result: Question = new Question({
            questionType,
            topicPath,
            questionText,
            lineNo,
            hasEditLaterTag,
            questionContext: context,
            cards: null,
            hasChanged: false,
        });

        return result;
    }
}
