import { RepItemScheduleInfo } from "src/algorithms/base/RepItemScheduleInfo";
import { RepItemStorageInfo } from "./RepItemStorageInfo";
import { Question } from "src/Question";

export interface IDataStore {
    questionCreateSchedule(
        originalQuestionText: string,
        storageInfo: RepItemStorageInfo,
    ): RepItemScheduleInfo[];
    questionRemoveScheduleInfo(questionText: string): string;
    questionWrite(question: Question): Promise<void>;
    questionWriteSchedule(question: Question): Promise<void>;
}

export class DataStore {
    static instance: IDataStore;

    public static getInstance(): IDataStore {
        if (!DataStore.instance) {
            throw Error("there is no DataStore instance.");
        }
        return DataStore.instance;
    }
}
