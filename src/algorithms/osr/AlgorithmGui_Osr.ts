import { Notice, Setting } from "obsidian";
import { IAlgorithmGui } from "../base/IAlgorithmGui";
import { t } from "src/lang/helpers";
import { applySettingsUpdate, DEFAULT_SETTINGS, SRSettings, SRSettings_Algorithm_Osr, SRSettingTab } from "src/settings";

export class AlgorithmGui_Osr implements IAlgorithmGui {
    createSettings(containerEl: HTMLElement, settings: SRSettings, settingsTab: SRSettingTab): void {
        const osrSettings: SRSettings_Algorithm_Osr = settings.algorithmOsr;

        new Setting(containerEl)
            .setName(t("BASE_EASE"))
            .setDesc(t("BASE_EASE_DESC"))
            .addText((text) =>
                text.setValue(osrSettings.baseEase.toString()).onChange((value) => {
                    applySettingsUpdate(async () => {
                        const numValue: number = Number.parseInt(value);
                        if (!isNaN(numValue)) {
                            if (numValue < 130) {
                                new Notice(t("BASE_EASE_MIN_WARNING"));
                                text.setValue(osrSettings.baseEase.toString());
                                return;
                            }

                            osrSettings.baseEase = numValue;
                            await settingsTab.savePluginData();
                        } else {
                            new Notice(t("VALID_NUMBER_WARNING"));
                        }
                    });
                }),
            )
            .addExtraButton((button) => {
                button
                    .setIcon("reset")
                    .setTooltip(t("RESET_DEFAULT"))
                    .onClick(async () => {
                        osrSettings.baseEase = DEFAULT_SETTINGS.baseEase;
                        await settingsTab.savePluginData();
                        settingsTab.display();
                    });
            });

        new Setting(containerEl)
            .setName(t("LAPSE_INTERVAL_CHANGE"))
            .setDesc(t("LAPSE_INTERVAL_CHANGE_DESC"))
            .addSlider((slider) =>
                slider
                    .setLimits(1, 99, 1)
                    .setValue(osrSettings.lapsesIntervalChange * 100)
                    .setDynamicTooltip()
                    .onChange(async (value: number) => {
                        osrSettings.lapsesIntervalChange = value / 100;
                        await settingsTab.savePluginData();
                    }),
            )
            .addExtraButton((button) => {
                button
                    .setIcon("reset")
                    .setTooltip(t("RESET_DEFAULT"))
                    .onClick(async () => {
                        osrSettings.lapsesIntervalChange =
                            DEFAULT_SETTINGS.lapsesIntervalChange;
                        await settingsTab.savePluginData();
                        settingsTab.display();
                    });
            });

        new Setting(containerEl)
            .setName(t("EASY_BONUS"))
            .setDesc(t("EASY_BONUS_DESC"))
            .addText((text) =>
                text
                    .setValue((osrSettings.easyBonus * 100).toString())
                    .onChange((value) => {
                        applySettingsUpdate(async () => {
                            const numValue: number = Number.parseInt(value) / 100;
                            if (!isNaN(numValue)) {
                                if (numValue < 1.0) {
                                    new Notice(t("EASY_BONUS_MIN_WARNING"));
                                    text.setValue(
                                        (osrSettings.easyBonus * 100).toString(),
                                    );
                                    return;
                                }

                                osrSettings.easyBonus = numValue;
                                await settingsTab.savePluginData();
                            } else {
                                new Notice(t("VALID_NUMBER_WARNING"));
                            }
                        });
                    }),
            )
            .addExtraButton((button) => {
                button
                    .setIcon("reset")
                    .setTooltip(t("RESET_DEFAULT"))
                    .onClick(async () => {
                        osrSettings.easyBonus = DEFAULT_SETTINGS.easyBonus;
                        await settingsTab.savePluginData();
                        settingsTab.display();
                    });
            });

        new Setting(containerEl)
            .setName(t("MAX_INTERVAL"))
            .setDesc(t("MAX_INTERVAL_DESC"))
            .addText((text) =>
                text
                    .setValue(osrSettings.maximumInterval.toString())
                    .onChange((value) => {
                        applySettingsUpdate(async () => {
                            const numValue: number = Number.parseInt(value);
                            if (!isNaN(numValue)) {
                                if (numValue < 1) {
                                    new Notice(t("MAX_INTERVAL_MIN_WARNING"));
                                    text.setValue(
                                        osrSettings.maximumInterval.toString(),
                                    );
                                    return;
                                }

                                osrSettings.maximumInterval = numValue;
                                await settingsTab.savePluginData();
                            } else {
                                new Notice(t("VALID_NUMBER_WARNING"));
                            }
                        });
                    }),
            )
            .addExtraButton((button) => {
                button
                    .setIcon("reset")
                    .setTooltip(t("RESET_DEFAULT"))
                    .onClick(async () => {
                        osrSettings.maximumInterval =
                            DEFAULT_SETTINGS.maximumInterval;
                        await settingsTab.savePluginData();
                        settingsTab.display();
                    });
            });

        new Setting(containerEl)
            .setName(t("MAX_LINK_CONTRIB"))
            .setDesc(t("MAX_LINK_CONTRIB_DESC"))
            .addSlider((slider) =>
                slider
                    .setLimits(0, 100, 1)
                    .setValue(osrSettings.maxLinkFactor * 100)
                    .setDynamicTooltip()
                    .onChange(async (value: number) => {
                        osrSettings.maxLinkFactor = value / 100;
                        await settingsTab.savePluginData();
                    }),
            )
            .addExtraButton((button) => {
                button
                    .setIcon("reset")
                    .setTooltip(t("RESET_DEFAULT"))
                    .onClick(async () => {
                        osrSettings.maxLinkFactor = DEFAULT_SETTINGS.maxLinkFactor;
                        await settingsTab.savePluginData();
                        settingsTab.display();
                    });
            });
    }
}