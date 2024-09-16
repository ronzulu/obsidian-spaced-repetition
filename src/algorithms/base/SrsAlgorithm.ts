import { SettingsUtil, SRSettings } from "src/settings";
import { SrsAlgorithm_Osr } from "../osr/SrsAlgorithm_Osr";
import { ISrsAlgorithm, SrsAlgorithmType } from "./ISrsAlgorithm";
import { SrsAlgorithm_SpecifiedIntervals } from "../specifiedIntervals/SrsAlgorithm_SpecifiedIntervals";

export class SrsAlgorithm {
    static instance: ISrsAlgorithm;

    public static getInstance(): ISrsAlgorithm {
        if (!SrsAlgorithm.instance) {
            throw Error("there is no SrsAlgorithm instance.");
        }
        return SrsAlgorithm.instance;
    }

    public static getTypeFromName(name: string): SrsAlgorithmType {
        let result: SrsAlgorithmType;
        switch (name) {
            case "SM2_Osr":
                result = SrsAlgorithmType.SM2_Osr;
                break;
            case "SpecifiedIntervals":
                result = SrsAlgorithmType.SpecifiedIntervals;
                break;
            default:
                throw `SrsAlgorithm. invalid name ${name}`;
        }
        return result;
    }
}

export class SrsAlgorithmFactory {
    static create(settings: SRSettings): ISrsAlgorithm {
        let result: ISrsAlgorithm;
        switch (SrsAlgorithm.getTypeFromName(settings.algorithmType)) {
            case SrsAlgorithmType.SM2_Osr:
                result = new SrsAlgorithm_Osr(settings);
                break;
            case SrsAlgorithmType.SpecifiedIntervals:
                result = new SrsAlgorithm_SpecifiedIntervals(settings);
                break;
            default:
                throw `SrsAlgorithmFactory invalid type ${settings.algorithmType}`;
        }
        return result;
    }
}