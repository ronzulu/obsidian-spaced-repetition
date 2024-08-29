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
import { CardsInNoteTab } from "./CardsInNoteTab";

export const SPACED_REPETITION_VIEW_TYPE = "flashcard-preview-view";

export class FlashcardPreviewView extends ItemView {
    private plugin: SRPlugin;
    private deckView: DeckListView;
    private flashcardView: FlashcardReviewView;
    private reviewMode: FlashcardReviewMode = FlashcardReviewMode.Review;
    private reviewSequencer: IFlashcardReviewSequencer;
    private infoButton: HTMLButtonElement;
    private tabStrip: TabStrip;
    private cardsInNoteTab: CardsInNoteTab;
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
        this.cardsInNoteTab = new CardsInNoteTab(this.plugin, this.app, 
            this.cardSelectionHandler.bind(this));

        this.flashcardReviewTab = new FlashcardReviewTab(this.plugin, this.app);

        const tabDefinition: TabDefinitionList = {
            "main-decks": {
                title: "Decks",
                icon: null, // "SpacedRepIcon",
                content_generator: (container_element: HTMLElement) =>
                    this.tabDecks(container_element),
            },
            "cards-in-note": {
                title: "Cards in Note",
                icon: null, // "note-glyph",
                content_generator: (container_element: HTMLElement) =>
                    this.cardsInNoteTab.init(container_element),
            },
            "preview": {
                title: "Card Preview",
                icon: null, // "dot-network",
                content_generator: (container_element: HTMLElement) =>
                    this.flashcardReviewTab.init(container_element),
            },
        };

        this.tabStrip = new TabStrip();
        this.tabStrip.init(
            this.contentEl, 
            tabDefinition,
            "main-decks"
            // this.last_position.tab_name,
        );

    }

    private cardSelectionHandler(notePath: string, card: Card): void {
        this.flashcardReviewTab?.renderCard(notePath, card);
        this.deckView.show();
    }

    onClose(): Promise<void> {
        this.cardsInNoteTab?.onClose();
        return;
    }

    private async tabDecks(containerEl: HTMLElement): Promise<void> {

    }

    public getViewType(): string {
        return SPACED_REPETITION_VIEW_TYPE;
    }

    public getDisplayText(): string {
        return "Spaced Repetition";
    }

    public getIcon(): string {
        return "SpacedRepIcon";
    }

    public onHeaderMenu(menu: Menu): void {
        menu.addItem((item) => {
            item.setTitle(t("CLOSE"))
                .setIcon("cross")
                .onClick(() => {
                    this.app.workspace.detachLeavesOfType(SPACED_REPETITION_VIEW_TYPE);
                });
        });
    }
}

export let globalId: number = 0;

class FlashcardReviewTab {
    private plugin: SRPlugin;
    private app: App;
    private containerEl: HTMLElement;
    private cardReviewPanel: HTMLElement;
    private id: number;

    constructor(plugin: SRPlugin, app: App) {
        this.plugin = plugin;
        this.app = app;
        this.id = globalId++;
        console.log(`TAB ${this.id}: constructor:`);
    }

    async init(containerEl: HTMLElement) {
        this.containerEl = containerEl;
    }

    public renderCard(notePath: string, card: Card): void {
        if (!this.containerEl){
            console.error(`TAB ${this.id}: renderCard: A`);
            return;
        }
        console.log(`TAB ${this.id}: renderCard: ${card?.front.substring(0, 20)}`);
        this.containerEl.empty();
        if (card) {
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

}
