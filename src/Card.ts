import { Question } from "./Question";
import { CardListType } from "./Deck";
import { RepetitionItem } from "./algorithms/base/RepetitionItem";

export class Card extends RepetitionItem {
    question: Question;
    cardIdx: number;

    // visuals
    front: string;
    back: string;

    constructor(init?: Partial<Card>) {
        super();
        Object.assign(this, init);
    }

    get cardListType(): CardListType {
        return this.isNew ? CardListType.NewCard : CardListType.DueCard;
    }
}
