const Discord = require("discord.js")
const databaseHandler = require("./modules/databaseHandler")

/**
 * @param {Discord.Client} client 
 * @param {Number} instance
 */
module.exports = function(client, instance){
    client.instance = instance
    client.on("ready", () => {
        console.log(`Client ${client.user.tag} (${client.user.id}) READY | Instance ${instance}`)
        function setStatus(){
            client.user.setActivity(`Taking notes via Slash Commands | ${client.guilds.cache.size} ${client.guilds.cache.size == 1?"Server":"Servers"} | /help`)
        }
        setStatus()
        setInterval(() => {
            setStatus()
        }, 60000);
    })

    //Interactions
    client.ws.on("INTERACTION_CREATE", (payload) => require("./modules/interactionHandler").interaction(payload, client))

    client.on("guildDelete", (guild) => databaseHandler.delete("notes", guild.id).then(() => console.log(`Deleted notes related to guild ${guild.id}.`)).catch(err => console.log(`Failed to delete notes related to guild ${guild.id}. ${err}`)))
}