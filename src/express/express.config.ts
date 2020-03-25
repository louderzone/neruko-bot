import bodyParser = require("body-parser");
import express = require("express");

/**
 * Configure an express instance
 */
export function startExpress(): express.Application {
    const app = express();

    // Inversify controller parser
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    return app;
}
