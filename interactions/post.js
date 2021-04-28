fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")

const interactionTemplate = require("../modules/interactionHandler").interactionTemplate
const GuildSettings = require("./settings").GuildSettings
/**
 * 
 * @param {interactionTemplate} payload 
 */
module.exports.execute = (payload, client) => {
    function ack(){
        return new Promise((resolve, reject) => {
            let responsePayload = {
                "type": 5
            };
            fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(responsePayload)
            })
            .then(resolve)
            .catch(reject)
        })
    }
    function sendMessage(msg){
        return new Promise((resolve, reject) => {
            let responsePayload = {
                "content": msg,
                "allowed_mentions": {
                    "parse": []
                }
            };
            fetch(`https://discord.com/api/v8/webhooks/${client.user.id}/${payload.token}`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(responsePayload)
            })
            .then(resolve)
            .catch(reject)
        })
    }
    ack().then(() => {
        databaseHandler.get("guildSettings", (payload.guild_id || "DM")).then(gs => {
            let guildSettings = new GuildSettings(gs)
            if(guildSettings.post_command == false)
                return sendMessage(`❌ Posting personal notes is disabled in this server.`)
            databaseHandler.get("notes", `${payload.member?payload.member.user.id:payload.user.id}`).then((notes = []) => {
                if(notes.length == 0)
                    return sendMessage(`🔎 📝 You don't have any notes created.`)
                let thisNote = notes.find(note => note.title == payload.data.options[0]["value"]);
                if(!thisNote)
                    return sendMessage(`🔎 📝 Unable to find that note. Please make sure you have the correct spelling of the note name, and that it isn't a server slash note.`)
                return sendMessage(thisNote.content)
            })
        })
    })
}

module.exports.info = {
    name:"post",
    about:"Share a note you own in the current channel. (Does not work for Server Slash notes)",
    cooldown:5
}