const Discord = require("discord.js")
const { GuildSettings } = require("./interactions/settings")
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
        databaseHandler.set("guildSettings", "DM", new GuildSettings())
        setStatus()
        setInterval(() => {
            setStatus()
        }, 60000);
    })

    //Interactions
    client.ws.on("INTERACTION_CREATE", (payload) => require("./modules/interactionHandler").interaction(payload, client))

    client.on("guildDelete", (guild) => {
        databaseHandler.delete("notes", guild.id)
        .then(() => console.log(`Deleted notes related to guild ${guild.id}.`))
        .catch(err => console.log(`Failed to delete notes related to guild ${guild.id}. ${err}`))

        databaseHandler.delete("guildSettings", guild.id)
        .then(() => console.log(`Deleted guildSettings related to guild ${guild.id}.`))
        .catch(err => console.log(`Failed to delete guildSettings related to guild ${guild.id}. ${err}`))
    })
}