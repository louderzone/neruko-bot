
export interface BotState {
    /**
     * Gets or sets the unique ID of the bot
     */
    id: string;

    /**
     * Gets or sets the name of the bot
     */
    name: string;

    /**
     * Gets or sets the statistics of
     * the last announcement
     */
    lastAnnounce: AnnouncementThread;
}

/**
 * Represents the statistic interface
 * of the ranker announcement
 */
interface AnnouncementThread {
    /**
     * Gets or sets the Unique ID of the discord message
     */
    id?: string;

    /**
     * Gets or sets the purpose of the announcement
     */
    purpose?: string;

    /**
     * Gets or sets the number of pusher responded to the message
     */
    responded?: number;

    /**
     * Gets or sets the number of pusher replied with not free
     */
    declined?: number;
}
