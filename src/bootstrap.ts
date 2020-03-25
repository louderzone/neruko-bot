import "reflect-metadata";
import { container } from "./inversify.config";

import { InversifyExpressServer } from "inversify-express-utils";
import { startExpress } from "./express/express.config";

const app = startExpress();

// start the server
const server = new InversifyExpressServer(container, null, null, app);
const serverInstance = server.build();
serverInstance.listen(process.env.PORT || 61000);
