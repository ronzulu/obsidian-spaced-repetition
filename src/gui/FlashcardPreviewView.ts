import { ItemView, WorkspaceLeaf, Menu, TFile, MarkdownView, Editor, EditorPosition, App } from "obsidian";

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
import { TabDefinitionList, TabStrip } from "./Tabs";

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
    private tabStrip: TabStrip;
    private flashcardReviewTab: FlashcardReviewTab;
    private id: number;

    private get settings(): SRSettings  {
        return this.plugin.data.settings;
    }

    constructor(leaf: WorkspaceLeaf, plugin: SRPlugin) {
        super(leaf);
        this.id = globalId++;
        console.log(`VIEW ${this.id}: constructor:`);

        this.plugin = plugin;

        this.init();
    }

    init() {
        const tabDefinition: TabDefinitionList = {
            "main-decks": {
                title: "Decks",
                icon: null, // "SpacedRepIcon",
                content_generator: (container_element: HTMLElement) =>
                    this.tabDecks(container_element),
            },
            "main-search": {
                title: "Search",
                icon: null, // "note-glyph",
                content_generator: (container_element: HTMLElement) =>
                    this.tabSearch(container_element),
            },
            "main-card": {
                title: "Flashcard Review",
                icon: null, // "dot-network",
                content_generator: (container_element: HTMLElement) =>
                    this.tabFlashcardReview(container_element),
            },
        };

        this.tabStrip = new TabStrip();
        this.tabStrip.init(
            this.contentEl, 
            tabDefinition,
            "main-decks"
            // this.last_position.tab_name,
        );

        setInterval(async () => {
            this.showInfo();
        }, 2500);
    }

    private async tabDecks(containerEl: HTMLElement): Promise<void> {
        this.view = containerEl.createDiv();
        this.view.addClasses(["sr-flashcard-preview"]);

        this.header = this.view.createDiv();
        this.header.addClass("sr-flashcard-preview-header");
        this.header.createEl("h1", { text: "Perhaps Scanning vault for flashcards..." });

        this.infoPanel = this.view.createDiv();
        this.infoPanel.addClass("sr-flashcard-preview-info-panel");

        this.questionListPanel = this.infoPanel.createDiv();
        this.questionListPanel.addClass("sr-flashcard-preview-question-list-panel");


    }

    private async tabSearch(containerEl: HTMLElement): Promise<void> {
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

        if (currentCard && this.flashcardReviewTab) {
            this.flashcardReviewTab.renderCard(currentCard, notePath);
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

    private async tabFlashcardReview(containerEl: HTMLElement): Promise<void> {
        this.flashcardReviewTab = new FlashcardReviewTab(this.plugin, this.app, containerEl)
    }
}

let globalId: number = 0;

class FlashcardReviewTab {
    private plugin: SRPlugin;
    private app: App;
    private containerEl: HTMLElement;
    private cardReviewPanel: HTMLElement;
    private id: number;

    constructor(plugin: SRPlugin, app: App, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.app = app;
        this.containerEl = containerEl;
        this.id = globalId++;
        console.log(`TAB ${this.id}: constructor:`);
    }

    renderCard(card: Card, notePath: string): void {
        if (!this.containerEl){
            console.error(`TAB ${this.id}: renderCard: A`);
            return;
        }
        console.log(`TAB ${this.id}: renderCard`);
        this.containerEl.empty();
        this.cardReviewPanel = this.containerEl.createDiv();
        this.cardReviewPanel.addClass("sr-flashcard-preview-card-panel");

        const wrapper: RenderMarkdownWrapper = new RenderMarkdownWrapper(
            this.app,
            this.plugin,
            notePath,
        );
        // Show answer text
        const question: Question = card.question;
        if (question.questionType != CardType.Cloze) {
            wrapper.renderMarkdownWrapper(
                `FRONT ${this.id}: ${card.front}`,
                this.cardReviewPanel,
                question.questionText.textDirection,
            );
            const hr: HTMLElement = this.cardReviewPanel.createEl("hr");
            hr.addClass("sr-card-divide");
        }

        wrapper.renderMarkdownWrapper(
            card.back,
            this.cardReviewPanel,
            question.questionText.textDirection,
        );


    }

}