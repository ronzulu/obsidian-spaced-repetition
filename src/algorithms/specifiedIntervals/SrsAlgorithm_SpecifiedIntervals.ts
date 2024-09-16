import { SRSettings, SRSettings_Algorithm_SpecifiedIntervals } from "src/settings";
import { ISrsAlgorithm } from "../base/ISrsAlgorithm";
import { RepItemScheduleInfo } from "../base/RepItemScheduleInfo";
import { ReviewResponse } from "../base/RepetitionItem";
import { OsrNoteGraph } from "../osr/OsrNoteGraph";
import { DueDateHistogram } from "src/DueDateHistogram";
import { RepItemScheduleInfo_Simple } from "../base/RepItemScheduleInfo_Simple";
import { Note } from "src/Note";
import { globalDateProvider } from "src/util/DateProvider";

export class SrsAlgorithm_SpecifiedIntervals implements ISrsAlgorithm {
    private settings: SRSettings_Algorithm_SpecifiedIntervals;

    constructor(settings: SRSettings) {
        this.settings = settings.algorithmSpecifiedIntervals;
    }

    static get initialInterval(): number {
        return 1.0;
    }

    noteCalcNewSchedule(
        _1: string,
        _2: OsrNoteGraph,
        response: ReviewResponse,
        _3: DueDateHistogram,
    ): RepItemScheduleInfo {
        const interval: number = this.getIntervalForReview(response);
        // Unlike the OSR algorithm, the latest ease is not used
        const ease: number = 0;
        return RepItemScheduleInfo_Simple.create(interval, ease);
    }

    noteOnLoadedNote(path: string, note: Note, noteEase: number): void {
        // Unlike the OSR algorithm, nothing to do here
    }

    noteCalcUpdatedSchedule(
        _1: string,
        _2: RepItemScheduleInfo,
        response: ReviewResponse,
        _3: DueDateHistogram,
    ): RepItemScheduleInfo {
        const interval: number = this.getIntervalForReview(response);
        const ease: number = 0;
        return RepItemScheduleInfo_Simple.create(interval, ease);
    }

    cardGetResetSchedule(): RepItemScheduleInfo {
        const interval: number = RepItemScheduleInfo_Simple.initialInterval;
        const ease: number = 0;
        return RepItemScheduleInfo_Simple.create(interval, ease);
    }

    cardGetNewSchedule(
        response: ReviewResponse,
        _1: string,
        _2: DueDateHistogram,
    ): RepItemScheduleInfo {
        const interval: number = this.getIntervalForReview(response);
        // Unlike the OSR algorithm, the latest ease is not used
        const ease: number = 0;
        return RepItemScheduleInfo_Simple.create(interval, ease);
    }

    cardCalcUpdatedSchedule(
        response: ReviewResponse,
        _1: RepItemScheduleInfo,
        _2: DueDateHistogram,
    ): RepItemScheduleInfo {
        const interval: number = this.getIntervalForReview(response);
        // Unlike the OSR algorithm, the latest ease is not used
        const ease: number = 0;
        return RepItemScheduleInfo_Simple.create(interval, ease);
    }

    private getIntervalForReview(response: ReviewResponse): number {
        let result: number;
        switch (response) {
            case ReviewResponse.Easy: result = this.settings.easy; break;
            case ReviewResponse.Good: result = this.settings.good; break;
            case ReviewResponse.Hard: result = this.settings.hard; break;
            default:
                throw Error(`Invalid response: ${response}`);
        }
        return result;
    }
}
