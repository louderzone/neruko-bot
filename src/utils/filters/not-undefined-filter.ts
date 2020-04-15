import { KeyValueObject } from "misc/key-value-pair";

export function notUndefined(pair: KeyValueObject<object>): boolean {
    return pair.value !== undefined;
}
