import { IQuestionContextFinder, NoteQuestionParser } from "./NoteQuestionParser";
import { ISRFile } from "./SRFile";
import { Note } from "./Note";
import { SRSettings } from "./settings";
import { TopicPath } from "./TopicPath";

export class NoteParser {
    settings: SRSettings;
    questionContextFinder: IQuestionContextFinder;
    noteText: string;

    constructor(settings: SRSettings, questionContextFinder: IQuestionContextFinder) { 
        this.settings = settings;
        this.questionContextFinder = questionContextFinder;
    }

    async parse(noteFile: ISRFile, folderTopicPath: TopicPath): Promise<Note> {
        let questionParser: NoteQuestionParser = new NoteQuestionParser(this.settings, this.questionContextFinder);
        let questions = await questionParser.createQuestionList(noteFile, folderTopicPath);
        let totalCards: number = questions.reduce((accumulator, q) => accumulator + q.cards.length, 0);

        // throw `${noteText}, ${questions.length}, ${totalCards}`;
        
        let result: Note = new Note(noteFile, questions);
        return result;
    }

}