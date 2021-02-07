function bot(){
    const fs = require('fs')
    const Discord = require('discord.js');
    const clients = require("./clients");
    Object.keys(clients).forEach(num => {
        let clientInfo = clients[num];
        let client = new Discord.Client({ws:{intents:clientInfo.intents}})
        client.login(clientInfo.token);
        clientInfo.eventHandler(client, num);
    })
}

/**
 * @description Launch bot process
 */
module.exports = function(){
    bot()
}