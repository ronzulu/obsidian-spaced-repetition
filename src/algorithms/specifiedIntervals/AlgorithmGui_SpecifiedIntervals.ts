import { Notice, Setting } from "obsidian";
import { IAlgorithmGui } from "../base/IAlgorithmGui";
import { t } from "src/lang/helpers";
import { applySettingsUpdate, DEFAULT_SETTINGS, SRSettings, SRSettings_Algorithm_SpecifiedIntervals, SRSettingTab } from "src/settings";

export class AlgorithmGui_SpecifiedIntervals implements IAlgorithmGui {
    createSettings(containerEl: HTMLElement, settings: SRSettings, settingsTab: SRSettingTab): void {
        const osrSettings: SRSettings_Algorithm_SpecifiedIntervals = settings.algorithmSpecifiedIntervals;

        const validationMinDays = (v: number) => {
            if (v < 1) {
                new Notice(t("MIN_ONE_DAY"));
                return false;
            }
            return true;
        }

        settingsTab.createSettingNumeric(containerEl, t("EASY_INTERVAL"), osrSettings.easy, 
            DEFAULT_SETTINGS.algorithmSpecifiedIntervals.easy, validationMinDays, 
            (v) => osrSettings.easy = v);

        settingsTab.createSettingNumeric(containerEl, t("GOOD_INTERVAL"), osrSettings.good, 
            DEFAULT_SETTINGS.algorithmSpecifiedIntervals.good, validationMinDays, 
            (v) => osrSettings.good = v);

        settingsTab.createSettingNumeric(containerEl, t("HARD_INTERVAL"), osrSettings.hard, 
            DEFAULT_SETTINGS.algorithmSpecifiedIntervals.hard, validationMinDays, 
            (v) => osrSettings.hard = v);

    }
}