import { Note } from "src/Note";
import { NoteFileLoader } from "src/NoteFileLoader";
import { TopicPath } from "src/TopicPath";
import { DEFAULT_SETTINGS } from "src/settings";
import { TextDirection } from "src/util/TextDirection";
import { UnitTestSRFile } from "./helpers/UnitTestSRFile";
import { NoteEaseList } from "src/NoteEaseList";
import { unitTestSetup_StandardDataStoreAlgorithm } from "./helpers/UnitTestSetup";

var noteFileLoader: NoteFileLoader = new NoteFileLoader(DEFAULT_SETTINGS);

beforeAll(() => {
    unitTestSetup_StandardDataStoreAlgorithm(DEFAULT_SETTINGS);
});

describe("load", () => {
    test("Multiple questions, none with too many schedule details", async () => {
        let noteText: string = `#flashcards/test
Q1::A1
#flashcards Q2::A2
<!--SR:!2023-09-02,4,270-->
Q3:::A3
<!--SR:!2023-09-02,4,270-->
`;
        let file: UnitTestSRFile = new UnitTestSRFile(noteText);
        let note: Note = await noteFileLoader.load(file, TextDirection.Ltr, TopicPath.emptyPath);
        expect(note.hasChanged).toEqual(false);
    });

    test("Multiple questions, some with too many schedule details", async () => {
        let noteText: string = `#flashcards/test
Q1::A1
#flashcards Q2::A2
<!--SR:!2023-09-02,4,270!2023-09-02,4,270-->
Q3:::A3
<!--SR:!2023-09-02,4,270-->
`;
        let file: UnitTestSRFile = new UnitTestSRFile(noteText);
        let note: Note = await noteFileLoader.load(file, TextDirection.Ltr, TopicPath.emptyPath);
        expect(note.hasChanged).toEqual(true);
    });
});
