import { Container } from "inversify";

export const container = new Container();

// Load Providers
import "./luis/luis.service";

// Load Express controllers
import "./express/controllers.config";
