/**
 * Represents the structure of the request body
 * of a shift announcement request
 */
export class ShiftForm {
    /**
     * The ID of the channel to announce to
     */
    cid: string;

    /**
     * The message of the announcement
     */
    msg: string;
}
