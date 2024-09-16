import { DEFAULT_SETTINGS } from "src/settings";
import { UnitTestOsrCore } from "./helpers/UnitTestOsrCore";
import {
    DateUtil,
    globalDateProvider,
    setupStaticDateProvider,
    setupStaticDateProvider_20230906,
} from "src/util/DateProvider";
import { unitTestSetup_DataStoreAlgorithm } from "./helpers/UnitTestSetup";
import { DueDateHistogram } from "src/DueDateHistogram";
import { NoteReviewQueue } from "src/NoteReviewQueue";

beforeAll(() => {
    setupStaticDateProvider_20230906();
    unitTestSetup_DataStoreAlgorithm(DEFAULT_SETTINGS);
});

function checkHistogramValue(histogram: DueDateHistogram, nDays: number, expectedValue: number) {
    expect(histogram.hasEntryForDays(nDays)).toEqual(true);
    expect(histogram.get(nDays)).toEqual(expectedValue);
}

function checkHistogramDueCardCount(histogram: DueDateHistogram, expectedValue: number) {
    checkHistogramValue(histogram, DueDateHistogram.dueNowNDays, expectedValue);
}

describe("determineScheduleInfo", () => {
    test("No notes due", async () => {
        const osrCore: UnitTestOsrCore = new UnitTestOsrCore(DEFAULT_SETTINGS);

        // A.md due 2023-09-10 (in 4 days time)
        await osrCore.loadTestVault("notes4");
        const histogram: DueDateHistogram = osrCore.dueDateNoteHistogram;
        expect(histogram.hasEntryForDays(DueDateHistogram.dueNowNDays)).toEqual(false);
    });

    test("Note A.md due today", async () => {
        const osrCore: UnitTestOsrCore = new UnitTestOsrCore(DEFAULT_SETTINGS);

        // A.md due 2023-09-10, so it should be due
        setupStaticDateProvider("2023-09-10");

        await osrCore.loadTestVault("notes4");
        const noteReviewQueue: NoteReviewQueue = osrCore.noteReviewQueue;
        const histogram: DueDateHistogram = osrCore.dueDateNoteHistogram;
        checkHistogramDueCardCount(histogram, 1);
    });
});

describe("dueNotesCount", () => {
    test("No notes due", async () => {
        const osrCore: UnitTestOsrCore = new UnitTestOsrCore(DEFAULT_SETTINGS);

        // A.md due 2023-09-10 (in 4 days time)
        await osrCore.loadTestVault("notes4");
        expect(osrCore.noteReviewQueue.dueNotesCount).toEqual(1);
    });
});
