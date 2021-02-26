require("dotenv").config()
const {readdirSync} = require('fs')

require("./setup/index").then(() => {
    const interactionCommands = new Map();
    const interactions = readdirSync("./interactions/").filter(f => f.endsWith(".js") && !f.startsWith("help"));
    for(const file of interactions){
        const command = require("./interactions/"+file);
        interactionCommands.set(command.info.name, command);
    }
    const databaseHandler = require("./modules/databaseHandler");
    const bot = require("./bot");
    module.exports.interactionCommands = interactionCommands;
    databaseHandler.emitter.on("ready", () => {
        bot();
    })
})
.catch(console.error);