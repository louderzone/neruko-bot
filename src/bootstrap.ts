import "reflect-metadata";
import { container } from "./inversify.config";

import { buildProviderModule } from "inversify-binding-decorators";
import { InversifyExpressServer } from "inversify-express-utils";
import { startExpress } from "./express/express.config";

// Loads all the dependencies to Inversify
// This must be done before the server is built
container.load(buildProviderModule());

// Creates the server
const app = startExpress();
const server = new InversifyExpressServer(container, null, null, app);

// Starts the server
const serverInstance = server.build();
serverInstance.listen(process.env.PORT || 61000);
