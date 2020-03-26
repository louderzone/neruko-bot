import { Container } from "inversify";

export const container = new Container();

// Load Express controllers
import "./express/controllers.config";

// Load Providers
import "./luis/luis.provider";
