
export class User {
    /**
     * The Unique ID in mongo DB of the user
     *
     * aka. Discord ID
     */
    _id: string;

    /**
     * Gets or sets if Neruko should boost this user
     */
    boosted: boolean;
}
