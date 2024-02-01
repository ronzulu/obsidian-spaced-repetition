export enum TextDirection {
    Ltr,
    Rtl,
}

export class TextDirectionUtil {
    static determineTextDirection(defaultTextDirection: TextDirection): TextDirection {
        let result: TextDirection = defaultTextDirection;
        return result;
    }
}