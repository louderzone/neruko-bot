import { fluentProvide } from "inversify-binding-decorators";
import { Collection, Db, MongoClient } from "mongodb";
import { SERVICE } from "../constants/services";
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
}
