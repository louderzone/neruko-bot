
export class User {
    /**
     * The Unique ID in mongo DB of the user
     *
     * aka. Discord ID
     */
    _id: string;

    /**
     * The unique name of the user
     */
    username: string;

    /**
     * Gets or sets if Neruko should boost this user
     */
    boosted: boolean;
}
