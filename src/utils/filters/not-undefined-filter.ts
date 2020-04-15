import { KeyValueObject } from "../../misc/key-value-pair";

/**
 * Filters key value pairs with value undefined
 * when used with Array.Filter
 *
 * @param pair
 * @see Array.Filter
 */
export function notUndefined(pair: KeyValueObject<object>): boolean {
    return pair.value !== undefined;
}
