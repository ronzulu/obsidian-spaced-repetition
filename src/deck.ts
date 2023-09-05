import { Card } from "./card";
import { Question } from "./question";
import { TopicPath } from "./topic-path";

export enum CardListType {NewCard, DueCard, All}

export class Deck {
    public deckName: string;
    public newFlashcards: Card[];
    public dueFlashcards: Card[];
    public subdecks: Deck[];
    public parent: Deck | null;

    public getCardCount(cardListType: CardListType, includeSubdeckCounts: boolean): number {
        let result: number = 0;
        if ((cardListType == CardListType.NewCard) || (cardListType == CardListType.All))
            result += this.newFlashcards.length;
        if ((cardListType == CardListType.DueCard) || (cardListType == CardListType.All))
            result += this.dueFlashcards.length;

        if (includeSubdeckCounts) {
            for (const deck of this.subdecks) {
                result += deck.getCardCount(cardListType, includeSubdeckCounts);
            }
        }
        return result;
    }

    constructor(deckName: string, parent: Deck | null) {
        this.deckName = deckName;
        this.newFlashcards = [];
        this.dueFlashcards = [];
        this.subdecks = [];
        this.parent = parent;
    }

    get isRootDeck() {
        return (this.parent == null);
    }

    getOrCreateDeck(topicPath: TopicPath): Deck {
        if (!topicPath.hasPath) {
            return this;
        }
        const deckName: string = topicPath.shift();
        for (const subdeck of this.subdecks) {
            if (deckName === subdeck.deckName) {
                return subdeck.getOrCreateDeck(topicPath);
            }
        }
        
        let parent: Deck = this;
        const subdeck: Deck = new Deck(deckName, parent);
        this.subdecks.push(subdeck);
        return subdeck.getOrCreateDeck(topicPath);
    }

    getTopicPath(): TopicPath {
        let list: string[] = [];
        let deck: Deck = this;
        while (!deck.isRootDeck) {
            list.push(deck.deckName);
            deck = deck.parent;
        }
        return new TopicPath(list.reverse());
    }

    getCardListForCardType(cardListType: CardListType): Card[] {
        return (cardListType == CardListType.DueCard) ? this.dueFlashcards : this.newFlashcards;
    }

    insertFlashcard(topicPath: TopicPath, cardObj: Card): void {
        let deck: Deck = this.getOrCreateDeck(topicPath);
        let cardList: Card[] = deck.getCardListForCardType(cardObj.cardListType);
        
        cardList.push(cardObj);
    }

    deleteFlashcardAtIndex(index: number, cardListType: CardListType): void {
        let cardList: Card[] = this.getCardListForCardType(cardListType);
        cardList.splice(index, 1);
    }

    deleteAllCardsForQuestion(question: Question): void {
        for (const sibling of question.cards) {
            const dueIdx = this.dueFlashcards.indexOf(sibling);
            const newIdx = this.newFlashcards.indexOf(sibling);

            if (dueIdx !== -1) {
                this.deleteFlashcardAtIndex(
                    dueIdx,
                    CardListType.DueCard
                );
            } else if (newIdx !== -1) {
                this.deleteFlashcardAtIndex(
                    newIdx,
                    CardListType.NewCard
                );
            }
        }
    }

    sortSubdecksList(): void {
        this.subdecks.sort((a, b) => {
            if (a.deckName < b.deckName) {
                return -1;
            } else if (a.deckName > b.deckName) {
                return 1;
            }
            return 0;
        });

        for (const deck of this.subdecks) {
            deck.sortSubdecksList();
        }
    }
/* 

    originalNextCard(modal: FlashcardModal): void {
        if (this.newFlashcards.length + this.dueFlashcards.length === 0) {
            if (this.dueFlashcardsCount + this.newFlashcardsCount > 0) {
                for (const deck of this.subdecks) {
                    if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0) {
                        modal.currentDeck = deck;
                        deck.nextCard(modal);
                        return;
                    }
                }
            }

            if (this.parent == modal.checkDeck) {
                modal.plugin.data.historyDeck = "";
                modal.decksList();
            } else {
                this.parent.nextCard(modal);
            }
            return;
        }

        modal.responseDiv.style.display = "none";
        modal.resetButton.disabled = true;
        modal.titleEl.setText(
            `${this.deckName}: ${this.dueFlashcardsCount + this.newFlashcardsCount}`,
        );

        modal.answerBtn.style.display = "initial";
        modal.flashcardView.empty();
        modal.mode = FlashcardModalMode.Front;

        let interval = 1.0,
            ease: number = modal.plugin.data.settings.baseEase,
            delayBeforeReview = 0;
        if (this.dueFlashcards.length > 0) {
            if (modal.plugin.data.settings.randomizeCardOrder) {
                modal.currentCardIdx = Math.floor(Math.random() * this.dueFlashcards.length);
            } else {
                modal.currentCardIdx = 0;
            }
            modal.currentCard = this.dueFlashcards[modal.currentCardIdx];
            modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);

            interval = modal.currentCard.interval;
            ease = modal.currentCard.ease;
            delayBeforeReview = modal.currentCard.delayBeforeReview;
        } else if (this.newFlashcards.length > 0) {
            if (modal.plugin.data.settings.randomizeCardOrder) {
                const pickedCardIdx = Math.floor(Math.random() * this.newFlashcards.length);
                modal.currentCardIdx = pickedCardIdx;

                // look for first unscheduled sibling
                const pickedCard: Card = this.newFlashcards[pickedCardIdx];
                let idx = pickedCardIdx;
                while (idx >= 0 && pickedCard.siblings.includes(this.newFlashcards[idx])) {
                    if (!this.newFlashcards[idx].isDue) {
                        modal.currentCardIdx = idx;
                    }
                    idx--;
                }
            } else {
                modal.currentCardIdx = 0;
            }

            modal.currentCard = this.newFlashcards[modal.currentCardIdx];
            modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);

            if (
                Object.prototype.hasOwnProperty.call(
                    modal.plugin.easeByPath,
                    modal.currentCard.note.path,
                )
            ) {
                ease = modal.plugin.easeByPath[modal.currentCard.note.path];
            }
        }

        const hardInterval: number = schedule(
            ReviewResponse.Hard,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings,
        ).interval;
        const goodInterval: number = schedule(
            ReviewResponse.Good,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings,
        ).interval;
        const easyInterval: number = schedule(
            ReviewResponse.Easy,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings,
        ).interval;

        if (modal.ignoreStats) {
            // Same for mobile/desktop
            modal.hardBtn.setText(`${modal.plugin.data.settings.flashcardHardText}`);
            modal.easyBtn.setText(`${modal.plugin.data.settings.flashcardEasyText}`);
        } else if (Platform.isMobile) {
            modal.hardBtn.setText(textInterval(hardInterval, true));
            modal.goodBtn.setText(textInterval(goodInterval, true));
            modal.easyBtn.setText(textInterval(easyInterval, true));
        } else {
            modal.hardBtn.setText(
                `${modal.plugin.data.settings.flashcardHardText} - ${textInterval(
                    hardInterval,
                    false,
                )}`,
            );
            modal.goodBtn.setText(
                `${modal.plugin.data.settings.flashcardGoodText} - ${textInterval(
                    goodInterval,
                    false,
                )}`,
            );
            modal.easyBtn.setText(
                `${modal.plugin.data.settings.flashcardEasyText} - ${textInterval(
                    easyInterval,
                    false,
                )}`,
            );
        }

        if (modal.plugin.data.settings.showContextInCards)
            modal.contextView.setText(modal.currentCard.context);
    }

    nextCard(modal: FlashcardModal): void {

        let {deck, cardListType, cardIdx} = this.determineNextCard(modal.plugin.data.settings);
        
        // Note that deck is not necessarily the same as "this."
        if (deck == null) { 
            if (!modal.plugin.data.settings.randomizeCardOrder) { 
                // In sequential order, if there are no cards left in this deck, return to the parent
                if (this.parent != modal.checkDeck) {
                    this.parent.nextCard(modal);
                    return;
                }
            }
            modal.plugin.data.historyDeck = "";
            modal.decksList();
            return;
        }

        let interval = 1.0,
            ease: number = modal.plugin.data.settings.baseEase,
            delayBeforeReview = 0;
        if (cardListType == CardListType.DueCard) {
            modal.currentCardIdx = cardIdx;
            modal.currentCard = deck.dueFlashcards[modal.currentCardIdx];

            interval = modal.currentCard.interval;
            ease = modal.currentCard.ease;
            delayBeforeReview = modal.currentCard.delayBeforeReview;
        } else {
            modal.currentCardIdx = cardIdx;
            modal.currentCard = deck.newFlashcards[modal.currentCardIdx];
            ease = Deck.getEaseForNote(modal);
        }

        Deck.setupCardFrontGui(modal, deck, interval, ease, delayBeforeReview);
    }

    static getEaseForNote(modal: FlashcardModal) : number { 
        var ease: number = modal.plugin.data.settings.baseEase;
        if (
            Object.prototype.hasOwnProperty.call(
                modal.plugin.easeByPath,
                modal.currentCard.note.path,
            )
        ) {
            ease = modal.plugin.easeByPath[modal.currentCard.note.path];
        }
        return ease;
    }

    getCardFromCardTreeIdx(cardTreeIdx: number): {deck: Deck | null, cardListType: CardListType, cardIdx: number} {
        var deck: Deck;
        var cardListType: CardListType;
        var cardIdx: number;

        if ((cardTreeIdx < 0) || (cardTreeIdx >= this.totalNewOrDueFlashcardsCount))
            throw "Invalid cardTreeIdx";

        if (cardTreeIdx < this.thisDeckNewOrDueFlashcardsLength) {
            // cardTreeIdx is an index for a card within this deck (and not a subdeck)
            deck = this;
            if (cardTreeIdx < this.dueFlashcards.length) {
                cardListType = CardListType.DueCard;
                cardIdx = cardTreeIdx;
            } else {
                cardListType = CardListType.NewCard;
                cardIdx = cardTreeIdx - this.dueFlashcards.length;
            }
        } else { 
            cardTreeIdx -= this.thisDeckNewOrDueFlashcardsLength;
            for (let i = 0; i < this.subdecks.length; i++) { 
                var subdeck: Deck = this.subdecks[i];
                if (cardTreeIdx < subdeck.totalNewOrDueFlashcardsCount) { 
                    ({ deck, cardListType, cardIdx } = subdeck.getCardFromCardTreeIdx(cardTreeIdx));
                    break;
                }
                cardTreeIdx -= subdeck.totalNewOrDueFlashcardsCount;
            }
        }

        return {deck, cardListType, cardIdx};
    }

    determineNextCard(settings: SRSettings): {deck: Deck | null, cardListType: CardListType, cardIdx: number} {
        
        var deck: Deck = null;
        var cardListType: CardListType = CardListType.NewCard;
        var cardIdx: number = -1;

        // If there are no new or due cards (in this deck or any descendant deck), nothing for us to do
        if (this.totalNewOrDueFlashcardsCount === 0)
            return {deck: null, cardListType, cardIdx};

        if (settings.randomizeCardOrder) {
            // Pick a card across all new or due cards from this deck or any descendant deck
            const pickedCardTreeIdx = Math.floor(Math.random() * this.totalNewOrDueFlashcardsCount);
            ({deck, cardListType, cardIdx} = this.getCardFromCardTreeIdx(pickedCardTreeIdx));
            if (cardListType == CardListType.NewCard) { 
                cardIdx = this.findFirstUnscheduledSibling(pickedCardTreeIdx);
            }
        }
        else {
            // Sequential order
            if (this.thisDeckNewOrDueFlashcardsLength === 0) { 
                // No new or due cards in this deck, so find the first descendant subdeck with a new or due card
                for (const subdeck of this.subdecks) {
                    if (subdeck.totalNewOrDueFlashcardsCount > 0) {
                        ({deck, cardListType, cardIdx} = subdeck.determineNextCard(settings));
                        break;
                    }
                }
            }
            else {
                // Next card is still from this deck
                deck = this;
                cardIdx = 0;

                if (this.dueFlashcards.length > 0) {
                    cardListType = CardListType.DueCard;
                } else if (this.newFlashcards.length > 0) {
                    cardListType = CardListType.NewCard;
                }

            }
        }

        return {deck, cardListType, cardIdx};
    }

    findFirstUnscheduledSibling(pickedCardIdx: number): number { 
        // look for first unscheduled sibling
        const pickedCard: Card = this.newFlashcards[pickedCardIdx];
        let idx = pickedCardIdx;
        let resultIdx = pickedCardIdx;
        while (idx >= 0 && pickedCard.siblings.includes(this.newFlashcards[idx])) {
            if (!this.newFlashcards[idx].isDue) {
                resultIdx = idx;
            }
            idx--;
        }     
        return resultIdx;   
    }

    static setupCardFrontGui(modal: FlashcardModal, deck: Deck, interval: number, ease: number, delayBeforeReview: number) { 
        modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);

        modal.responseDiv.style.display = "none";
        modal.resetButton.disabled = true;
        modal.titleEl.setText(
            `${deck.deckName}: ${deck.dueFlashcardsCount + deck.newFlashcardsCount}`,
        );

        modal.answerBtn.style.display = "initial";
        modal.flashcardView.empty();
        modal.mode = FlashcardModalMode.Front;
        
        const hardInterval: number = schedule(
            ReviewResponse.Hard,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings,
        ).interval;
        const goodInterval: number = schedule(
            ReviewResponse.Good,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings,
        ).interval;
        const easyInterval: number = schedule(
            ReviewResponse.Easy,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings,
        ).interval;

        if (modal.ignoreStats) {
            // Same for mobile/desktop
            modal.hardBtn.setText(`${modal.plugin.data.settings.flashcardHardText}`);
            modal.easyBtn.setText(`${modal.plugin.data.settings.flashcardEasyText}`);
        } else if (Platform.isMobile) {
            modal.hardBtn.setText(textInterval(hardInterval, true));
            modal.goodBtn.setText(textInterval(goodInterval, true));
            modal.easyBtn.setText(textInterval(easyInterval, true));
        } else {
            modal.hardBtn.setText(
                `${modal.plugin.data.settings.flashcardHardText} - ${textInterval(
                    hardInterval,
                    false,
                )}`,
            );
            modal.goodBtn.setText(
                `${modal.plugin.data.settings.flashcardGoodText} - ${textInterval(
                    goodInterval,
                    false,
                )}`,
            );
            modal.easyBtn.setText(
                `${modal.plugin.data.settings.flashcardEasyText} - ${textInterval(
                    easyInterval,
                    false,
                )}`,
            );
        }
        if (modal.plugin.data.settings.showContextInCards)
            modal.contextView.setText(modal.currentCard.context);


    } */
}
