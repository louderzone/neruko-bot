import { fluentProvide } from "inversify-binding-decorators";
import { Collection, Db, MongoClient } from "mongodb";
import { SERVICE } from "../constants/services";
import { BotState } from "./models/bot-state";
import { PrImage } from "./models/pr-image";
import { User } from "./models/user";

// Connection URL
const uri = process.env.MONGO_CONNECTION_STRING;

// Database Name
const dbName = process.env.MONGO_DBNAME;

/**
 * Represents to MongoDb connection
 */
@fluentProvide(SERVICE.MongoDb)
    .inSingletonScope()
    .done()
export class MongoDb {
    private db: Db;

    constructor() {
        // Use connect method to connect to the server
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        client.connect(() => {
            this.db = client.db(dbName);
        });
    }

    /**
     * Gets the user collection
     */
    getUsers(): Collection<User> {
        return this.db.collection<User>("users");
    }

    /**
     * Gets the bot statuses collection
     */
    getStatuses(): Collection<BotState> {
        return this.db.collection<BotState>("bot-states");
    }

    /**
     * Gets the pr images collection
     */
    getPrImages(): Collection<PrImage> {
        return this.db.collection<PrImage>("pr-images");
    }
}
