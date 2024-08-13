import { ItemView, WorkspaceLeaf, Menu, TFile } from "obsidian";

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

export const FLASHCARD_REVIEW_TAB_VIEW_TYPE = "flashcards-review-tab-view";

export class FlashcardReviewTabView extends ItemView {
    private plugin: SRPlugin;
    private deckView: DeckListView;
    private flashcardView: FlashcardReviewView;
    private reviewMode: FlashcardReviewMode = FlashcardReviewMode.Review;
    private reviewSequencer: IFlashcardReviewSequencer;

    private get settings(): SRSettings  {
        return this.plugin.data.settings;
    }

    constructor(leaf: WorkspaceLeaf, plugin: SRPlugin) {
        super(leaf);

        this.plugin = plugin;
        /* this.registerEvent(this.app.workspace.on("file-open", () => this.redraw()));
        this.registerEvent(this.app.vault.on("rename", () => this.redraw())); */
    }

    public getViewType(): string {
        return FLASHCARD_REVIEW_TAB_VIEW_TYPE;
    }

    public getDisplayText(): string {
        return "Flashcard Review";
    }

    public getIcon(): string {
        return "SpacedRepIcon";
    }

    public onHeaderMenu(menu: Menu): void {
        menu.addItem((item) => {
            item.setTitle(t("CLOSE"))
                .setIcon("cross")
                .onClick(() => {
                    this.app.workspace.detachLeavesOfType(FLASHCARD_REVIEW_TAB_VIEW_TYPE);
                });
        });
    }

    public syncStart(): void {
        this.containerEl.empty();
        this.containerEl.createEl("h1", { text: "Scanning vault for flashcards..." });

    }

    public syncComplete(fullDeckTree: Deck, remainingDeckTree: Deck): void {
        this.containerEl.empty();
        const deckIterator = SRPlugin.createDeckTreeIterator(this.settings, remainingDeckTree);
        const cardScheduleCalculator = new CardScheduleCalculator(
            this.settings,
            this.plugin.easeByPath,
        );
        this.reviewSequencer = new FlashcardReviewSequencer(
            this.reviewMode,
            deckIterator,
            this.settings,
            cardScheduleCalculator,
            this.plugin.questionPostponementList,
        );

        this.reviewSequencer.setDeckTree(fullDeckTree, remainingDeckTree);

        const childrenEl: HTMLElement = this.containerEl.createDiv("sr-flashcard-review-tab-view");
        /* childrenEl.style.width = this.settings.flashcardWidthPercentage + "%";
        childrenEl.style.maxWidth = this.settings.flashcardWidthPercentage + "%"; */

        this.deckView = new DeckListView(
            this.plugin,
            this.settings,
            this.reviewSequencer,
            childrenEl,
            this._startReviewOfDeck.bind(this),
        );
        this.deckView.show();

        this.flashcardView = new FlashcardReviewView(
            this.app,
            this.plugin,
            this.plugin.data.settings,
            this.reviewSequencer,
            this.reviewMode,
            childrenEl,
            childrenEl, 
            this._showDecksList.bind(this),
            this._doEditQuestionText.bind(this),
        );


        /* const contentEl: Element = this.containerEl.children[1];
        contentEl.appendChild(rootEl); */
    }


    private _showDecksList(): void {
        this._hideFlashcard();
        this.deckView.show();
    }

    private _hideDecksList(): void {
        this.deckView.hide();
    }

    private _showFlashcard(): void {
        this._hideDecksList();
        this.flashcardView.show();
    }

    private _hideFlashcard(): void {
        this.flashcardView.hide();
    }

    private _startReviewOfDeck(deck: Deck) {
        this.reviewSequencer.setCurrentDeck(deck.getTopicPath());
        if (this.reviewSequencer.hasCurrentCard) {
            this._showFlashcard();
        } else {
            this._showDecksList();
        }
    }

    private _doEditQuestionText(): void {
        
    }
}
