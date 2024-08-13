import { ItemView, WorkspaceLeaf, Menu, TFile, MarkdownView, Editor, EditorPosition } from "obsidian";

import { COLLAPSE_ICON } from "src/constants";
import { ReviewDeck } from "src/ReviewDeck";
import { t } from "src/lang/helpers";
import { FlashcardReviewView } from "./FlashcardReviewView";
import { FlashcardReviewMode, FlashcardReviewSequencer, IFlashcardReviewSequencer } from "src/FlashcardReviewSequencer";
import { DeckListView } from "./DeckListView";
import { SRSettings } from "src/settings";
import { Deck } from "src/Deck";
import { CardScheduleCalculator } from "src/CardSchedule";
import SRPlugin from "src/main";
import { globalDateProvider } from "src/util/DateProvider";
import { Card } from "src/Card";
import { RenderMarkdownWrapper } from "src/util/RenderMarkdownWrapper";
import { CardType, Question } from "src/Question";
import { ParsedQuestionInfo } from "src/parser";

export const FLASHCARD_PREVIEW_VIEW_TYPE = "flashcard-preview-view";

export class FlashcardPreviewView extends ItemView {
    private plugin: SRPlugin;
    private deckView: DeckListView;
    private flashcardView: FlashcardReviewView;
    private reviewMode: FlashcardReviewMode = FlashcardReviewMode.Review;
    private reviewSequencer: IFlashcardReviewSequencer;
    private infoButton: HTMLButtonElement;
    private view: HTMLElement;
    private header: HTMLElement;
    private infoPanel: HTMLElement;
    private questionListPanel: HTMLElement;
    private cardPreviewPanel: HTMLElement;

    private get settings(): SRSettings  {
        return this.plugin.data.settings;
    }

    constructor(leaf: WorkspaceLeaf, plugin: SRPlugin) {
        super(leaf);

        this.plugin = plugin;

        this.init();
    }

    init() {
        this.view = this.contentEl.createDiv();
        this.view.addClasses(["sr-flashcard-preview"]);

        this.header = this.view.createDiv();
        this.header.addClass("sr-flashcard-preview-header");
        this.header.createEl("h1", { text: "Perhaps Scanning vault for flashcards..." });

        this.infoPanel = this.view.createDiv();
        this.infoPanel.addClass("sr-flashcard-preview-info-panel");

        this.questionListPanel = this.infoPanel.createDiv();
        this.questionListPanel.addClass("sr-flashcard-preview-question-list-panel");

        this.cardPreviewPanel = this.infoPanel.createDiv();
        this.cardPreviewPanel.addClass("sr-flashcard-preview-card-panel");

        setInterval(async () => {
            this.showInfo();
        }, 500);
    }

    public getViewType(): string {
        return FLASHCARD_PREVIEW_VIEW_TYPE;
    }

    public getDisplayText(): string {
        return "Flashcard Preview";
    }

    public getIcon(): string {
        return "SpacedRepIcon";
    }

    public onHeaderMenu(menu: Menu): void {
        menu.addItem((item) => {
            item.setTitle(t("CLOSE"))
                .setIcon("cross")
                .onClick(() => {
                    this.app.workspace.detachLeavesOfType(FLASHCARD_PREVIEW_VIEW_TYPE);
                });
        });
    }

    private showInfo(): void {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);

        // Make sure the user is editing a Markdown file.
        if (!view) return;

        const cursor = view.editor.getCursor();
        
        const notePath: string = view.file.path;

        const cardList: Card[] = this.plugin.deckTree.findAllCardsFromNote(notePath);
        this.questionListPanel.empty();

        let currentCard: Card = null;
        for (const card of cardList) {
            const inQuestion: boolean = card.question.parsedQuestionInfo.isQuestionLineNum(cursor.line);
            if (inQuestion) currentCard = card;
            let el = this.questionListPanel.createDiv("sr-flashcard-preview-card-item");
            el.addEventListener("click", (e) => {
                this.highlightCard(view.editor, card);
                // el.addClass("is-flashing");
            });
            if (inQuestion) {
                el.addClass("sr-flashcard-preview-selected-card");
            }
            el.setText(card.front);
        }

        this.cardPreviewPanel.empty();
        if (currentCard) {
            this.renderCard(currentCard, notePath);
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

    renderCard(card: Card, notePath: string): void {
        const wrapper: RenderMarkdownWrapper = new RenderMarkdownWrapper(
            this.app,
            this.plugin,
            notePath,
        );
        // Show answer text
        const question: Question = card.question;
        if (question.questionType != CardType.Cloze) {
            wrapper.renderMarkdownWrapper(
                card.front,
                this.cardPreviewPanel,
                question.questionText.textDirection,
            );
            const hr: HTMLElement = document.createElement("hr");
            hr.addClass("sr-card-divide");
            this.cardPreviewPanel.appendChild(hr);
        }

        wrapper.renderMarkdownWrapper(
            card.back,
            this.cardPreviewPanel,
            question.questionText.textDirection,
        );


    }
}
