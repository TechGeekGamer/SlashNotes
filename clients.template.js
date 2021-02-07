//Clients
const Discord = require("discord.js")
module.exports = {
    1:{
        intents:[],
        token:"",
        /**
         * @param {Discord.Client} client 
         * @param {Number} instance
         */
        eventHandler:function(client, instance){
            require("./eventHandler")(client, instance)
        }
    }
}

//Bot is only built for one client, no guarantees that multiple clients will work.