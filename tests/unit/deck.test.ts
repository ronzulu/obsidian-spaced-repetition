import { Deck } from "src/deck";
import { TopicPath } from "src/topic-path";

describe("constructor", () => {
    test("Deck name", () => {
        let actual: Deck = new Deck("Great Name", null);

        expect(actual.deckName).toEqual("Great Name");
    });
});

describe("getOrCreateDeck()", () => {
    test("Empty topic path", () => {
        let deck: Deck = new Deck("Great Name", null);
        deck.getOrCreateDeck(TopicPath.emptyPath);

        expect(deck.deckName).toEqual("Great Name");
        expect(deck.subdecks.length).toEqual(0);
    });

    test("Create single subdeck on empty deck", () => {
        let deck: Deck = new Deck("Root", null);
        let path: TopicPath = new TopicPath(["Level1"]);
        let subdeck: Deck = deck.getOrCreateDeck(path);

        expect(deck.deckName).toEqual("Root");
        expect(deck.subdecks.length).toEqual(1);
        expect(subdeck === deck.subdecks[0]).toEqual(true);
        expect(subdeck.deckName).toEqual("Level1");
    });

    test("Create multiple subdecks under single deck", () => {
        let deck: Deck = new Deck("Root", null);
        let subdeckA: Deck = deck.getOrCreateDeck(new TopicPath(["Level1A"]));
        let subdeckB: Deck = deck.getOrCreateDeck(new TopicPath(["Level1B"]));
        let subdeckC: Deck = deck.getOrCreateDeck(new TopicPath(["Level1C"]));

        expect(deck.deckName).toEqual("Root");
        expect(deck.subdecks.length).toEqual(3);

        expect(subdeckA === deck.subdecks[0]).toEqual(true);
        expect(subdeckA.deckName).toEqual("Level1A");

        expect(subdeckB === deck.subdecks[1]).toEqual(true);
        expect(subdeckB.deckName).toEqual("Level1B");

        expect(subdeckC === deck.subdecks[2]).toEqual(true);
        expect(subdeckC.deckName).toEqual("Level1C");
    });

    test("Create multi-level deck in separate steps", () => {
        let deck: Deck = new Deck("Root", null);
        let subdeck1: Deck = deck.getOrCreateDeck(new TopicPath(["Level1"]));
        let subdeck2: Deck = subdeck1.getOrCreateDeck(new TopicPath(["Level2"]));
        let subdeck3: Deck = subdeck2.getOrCreateDeck(new TopicPath(["Level3"]));

        expect(deck.deckName).toEqual("Root");
        expect(deck.subdecks.length).toEqual(1);

        expect(subdeck1 === deck.subdecks[0]).toEqual(true);
        expect(subdeck1.deckName).toEqual("Level1");
        expect(subdeck1.subdecks.length).toEqual(1);

        expect(subdeck2 === subdeck1.subdecks[0]).toEqual(true);
        expect(subdeck2.deckName).toEqual("Level2");
        expect(subdeck2.subdecks.length).toEqual(1);

        expect(subdeck3 === subdeck2.subdecks[0]).toEqual(true);
        expect(subdeck3.deckName).toEqual("Level3");
        expect(subdeck3.subdecks.length).toEqual(0);
    });

    test("Create multi-level deck in single step", () => {
        let deck: Deck = new Deck("Root", null);
        let subdeck3: Deck = deck.getOrCreateDeck(new TopicPath(["Level1", "Level2", "Level3"]));

        expect(deck.deckName).toEqual("Root");
        expect(deck.subdecks.length).toEqual(1);

        let subdeck1:Deck = deck.subdecks[0];
        expect(subdeck1.deckName).toEqual("Level1");
        expect(subdeck1.subdecks.length).toEqual(1);

        let subdeck2:Deck = subdeck1.subdecks[0];
        expect(subdeck2.deckName).toEqual("Level2");
        expect(subdeck2.subdecks.length).toEqual(1);

        expect(subdeck3 === subdeck2.subdecks[0]).toEqual(true);
        expect(subdeck3.deckName).toEqual("Level3");
        expect(subdeck3.subdecks.length).toEqual(0);
    });
});

