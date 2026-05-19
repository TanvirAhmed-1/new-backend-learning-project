
export const pick = <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Partial<Pick<T, K>> => {
    const finalObj: Partial<Pick<T, K>> = {};

    for (const key of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
            finalObj[key] = obj[key];
        }
    }

    return finalObj;
};