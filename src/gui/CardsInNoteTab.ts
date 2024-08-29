import { App, Editor, EditorPosition, MarkdownView } from "obsidian";
import { Card } from "src/Card";
import SRPlugin from "src/main";
import { ParsedQuestionInfo } from "src/parser";

export class CardsInNoteTab {
    private plugin: SRPlugin;
    private app: App;
    private containerEl: HTMLElement;
    private cardReviewPanel: HTMLElement;
    private id: number;
    private header: HTMLElement;
    private infoPanel: HTMLElement;
    private questionListPanel: HTMLElement;
    private cardSelectionHandler: (notePath: string, card: Card) => void;
    private timeoutId: NodeJS.Timeout;
    private lastNotePath: string = null;
    private lastSelectedCard: Card = null;

    constructor(plugin: SRPlugin, app: App, cardSelectionHandler: (notePath: string, card: Card) => void) {
        this.plugin = plugin;
        this.app = app;
        this.cardSelectionHandler = cardSelectionHandler;
        // this.id = globalId++;
        console.log(`TAB ${this.id}: constructor:`);
    }

    async init(containerEl: HTMLElement): Promise<void> {
        this.containerEl = containerEl;

        const view = containerEl.createDiv();
        view.addClasses(["sr-flashcard-preview"]);

        this.header = view.createDiv();
        this.header.addClass("sr-flashcard-preview-header");
        this.header.createEl("h1", { text: "Perhaps Scanning vault for flashcards..." });

        this.infoPanel = view.createDiv();
        this.infoPanel.addClass("sr-flashcard-preview-info-panel");

        this.questionListPanel = this.infoPanel.createDiv();
        this.questionListPanel.addClass("sr-flashcard-preview-question-list-panel");

        this.timeoutId = setInterval(async () => {
            this.showInfo();
        }, 500);
        
    }

    public onClose(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    public showInfo(): void {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);

        // Make sure the user is editing a Markdown file.
        if (!view) return;
        
        // 
        const notePath: string = view.file.path;
        const cardList: Card[] = this.plugin.deckTree.findAllCardsFromNote(notePath);
        const currentCard: Card = this.findCurrentCard(view, cardList);
        if (this.lastNotePath != notePath || this.lastSelectedCard !== currentCard) {

            this.updateQuestionListPanel(view, cardList, currentCard);
            this.cardSelectionHandler(notePath, currentCard);
            this.lastNotePath = notePath;
            this.lastSelectedCard = currentCard;
        }
    }

    findCurrentCard(view: MarkdownView, cardList: Card[]): Card {
        const cursor = view.editor.getCursor();
        for (const card of cardList) {
            const inQuestion: boolean = card.question.parsedQuestionInfo.isQuestionLineNum(cursor.line);
            if (inQuestion) return card;
        }
        return null;
    }

    updateQuestionListPanel(view: MarkdownView, cardList: Card[], selectedCard: Card): void {

        this.questionListPanel.empty();
        console.log(`showInfo: ${this.id}: ${cardList.length}`);

        for (const card of cardList) {
            let el = this.questionListPanel.createDiv("sr-flashcard-preview-card-item");
            el.addEventListener("click", (e) => {
                this.highlightCard(view.editor, card);
                // el.addClass("is-flashing");
            });
            if (card === selectedCard) {
                el.addClass("sr-flashcard-preview-selected-card");
            }
            el.setText(card.front);
            console.log(`showInfo: ${this.id}: ${card.front.substring(0, 10)}: ${card.back.substring(0, 10)}`);
        }

    }

    highlightCard(editor: Editor, card: Card) {
        const info: ParsedQuestionInfo = card.question.parsedQuestionInfo;
        const first: EditorPosition = { ch: 0, line: info.firstLineNum};
        const lineLength: number = editor.getLine(info.lastLineNum).length;
        const last: EditorPosition = { ch: lineLength, line: info.lastLineNum};
        editor.scrollIntoView({
            from: first, 
            to: last, 
        });
        editor.setSelection(first, last);
    }

}