import moment from "moment";
import { RepItemScheduleInfo_Simple } from "src/algorithms/base/RepItemScheduleInfo_Simple";
import { TICKS_PER_DAY } from "src/constants";
import { DEFAULT_SETTINGS } from "src/settings";

describe("formatCardScheduleForHtmlComment", () => {
    test("With due date", () => {
        const repItem: RepItemScheduleInfo_Simple = RepItemScheduleInfo_Simple.fromDueDateStr(
            "2023-09-02",
            4,
            270,
            null,
        );
        expect(repItem.formatCardScheduleForHtmlComment()).toEqual("!2023-09-02,4,270");
    });

    test("Without due date", () => {
        const repItem: RepItemScheduleInfo_Simple = new RepItemScheduleInfo_Simple(null, 5, 290, null);
        expect(repItem.formatCardScheduleForHtmlComment()).toEqual("!2000-01-01,5,290");
    });
});

test("getDummyScheduleForNewCard", () => {
    const repItem: RepItemScheduleInfo_Simple =
        RepItemScheduleInfo_Simple.getDummyScheduleForNewCard(DEFAULT_SETTINGS);
    expect(repItem.interval).toEqual(1);
    expect(repItem.latestEase).toEqual(250);
    expect(repItem.dueDate.valueOf).toEqual(moment("2000-01-01").valueOf);
});
