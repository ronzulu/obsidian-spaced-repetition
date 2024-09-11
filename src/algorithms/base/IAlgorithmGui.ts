import { SRSettings, SRSettingTab } from "src/settings";
import { SrsAlgorithmType } from "./ISrsAlgorithm";
import { AlgorithmGui_Osr } from "../osr/AlgorithmGui_Osr";
import { AlgorithmGui_SpecifiedIntervals } from "../specifiedIntervals/AlgorithmGui_SpecifiedIntervals";

export interface IAlgorithmGui {
    createSettings(containerEl: HTMLElement, settings: SRSettings, settingsTab: SRSettingTab): void;
}

export class AlgorithmGuiFactory {
    static create(type: SrsAlgorithmType): IAlgorithmGui {
        let result: IAlgorithmGui;
        switch (type) {
            case SrsAlgorithmType.SM2_Osr:
                result = new AlgorithmGui_Osr();
                break;
            case SrsAlgorithmType.SpecifiedIntervals:
                result = new AlgorithmGui_SpecifiedIntervals();
                break;
            default:
                throw `AlgorithmGuiFactory invalid type ${type}`;
        }
        return result;
    }
}