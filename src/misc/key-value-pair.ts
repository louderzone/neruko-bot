/**
 * Represents a object literal presents as a key value pair
 */
export interface KeyValueObject<T> {
    /**
     * The key of the object literal
     */
    id: string;

    /**
     * The value of the object literal
     */
    value: T;
}
