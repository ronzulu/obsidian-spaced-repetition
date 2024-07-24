import { SRSettings } from "src/settings";
import { ISrsAlgorithm } from "../base/ISrsAlgorithm";
import { RepItemScheduleInfo } from "../base/RepItemScheduleInfo";
import { ReviewResponse } from "../base/RepetitionItem";
import { OsrNoteGraph } from "../osr/OsrNoteGraph";
import { DueDateHistogram } from "src/DueDateHistogram";
import { RepItemScheduleInfo_Osr } from "../osr/RepItemScheduleInfo_Osr";
import { Note } from "src/Note";

export class SrsAlgorithm_SpecifiedIntervals implements ISrsAlgorithm {
    private settings: SRSettings;

    constructor(settings: SRSettings) {
        this.settings = settings;
    }

    static get initialInterval(): number {
        return 1.0;
    }

    noteCalcNewSchedule(
        notePath: string,
        _: OsrNoteGraph,
        response: ReviewResponse,
        dueDateNoteHistogram: DueDateHistogram,
    ): RepItemScheduleInfo {
        throw Error("there is no SrsAlgorithm instance.");
    }

    noteOnLoadedNote(path: string, note: Note, noteEase: number): void {
    }

    noteCalcUpdatedSchedule(
        notePath: string,
        noteSchedule: RepItemScheduleInfo,
        response: ReviewResponse,
        dueDateNoteHistogram: DueDateHistogram,
    ): RepItemScheduleInfo {
        throw Error("there is no SrsAlgorithm instance.");
    }

    private calcSchedule(
        schedule: RepItemScheduleInfo_Osr,
        response: ReviewResponse,
        dueDateHistogram: DueDateHistogram,
    ): RepItemScheduleInfo_Osr {
        throw Error("there is no SrsAlgorithm instance.");
    }

    cardGetResetSchedule(): RepItemScheduleInfo {
        throw Error("there is no SrsAlgorithm instance.");
    }

    cardGetNewSchedule(
        response: ReviewResponse,
        notePath: string,
        dueDateFlashcardHistogram: DueDateHistogram,
    ): RepItemScheduleInfo {
        throw Error("there is no SrsAlgorithm instance.");
    }

    cardCalcUpdatedSchedule(
        response: ReviewResponse,
        cardSchedule: RepItemScheduleInfo,
        dueDateFlashcardHistogram: DueDateHistogram,
    ): RepItemScheduleInfo {
        throw Error("there is no SrsAlgorithm instance.");
    }
}
