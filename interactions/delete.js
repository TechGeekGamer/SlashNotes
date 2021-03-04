fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")

const interactionTemplate = require("../modules/interactionHandler").interactionTemplate

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
        const noteTitle = payload.data.options[0].value
        const notePublic = payload.data.options[1].value
        if(notePublic == false){
            databaseHandler.get("notes", `${payload.member?payload.member.user.id:payload.user.id}`).then((notes = []) => {
                if(notes.length == 0)
                    return sendMessage(`🔎 📝 You don't have any notes created.`)
                notes.forEach((note, i) => {
                    if(note.title == noteTitle){
                        notes.splice(i, 1)
                        databaseHandler.set("notes", `${payload.member?payload.member.user.id:payload.user.id}`, notes).then(() => {
                            return sendMessage(`🗑 Successfully deleted **${note.title}** note.`)
                        })
                    }else
                    if(i+1 == notes.length){
                        return sendMessage(`🔎 📝 Unable to find that note. Please make sure you have the correct spelling of the note name, and that it isn't a server slash note.`)
                    }
                });
            })
        }else if(notePublic == true){
            if(!payload.guild_id)
                return sendMessage(`🏠 This feature is only available in servers.`)
            if(notePublic == true && (payload.member.permissions & 0x00000020) != 0x00000020)
                return sendMessage(`⚠️ Invalid permissions.\nSorry, you need to have Manage Server permission to delete a server slash note.`)
            databaseHandler.get("notes", `${payload.guild_id}`).then((notes = {}) => {
                if(Object.keys(notes).length == 0)
                    return sendMessage(`This server doesn't have any Server Slash Notes`)
                Object.keys(notes).forEach((slashNoteID, i) => {
                    let note = notes[slashNoteID]
                    if(note.title == noteTitle){
                        delete notes[slashNoteID]
                        databaseHandler.set("notes", `${payload.guild_id}`, notes).then(() => {
                            fetch(`https://discord.com/api/v8/applications/${client.user.id}/guilds/${payload.guild_id}/commands/${slashNoteID}`, {
                                method:"DELETE",
                                headers:{
                                    "Content-Type":"application/json",
                                    authorization:`Bot ${client.token}`
                                }
                            })
                            .then(() => {
                                return sendMessage(`🗑 Successfully deleted slash server note.`)
                            })
                            .catch(() => {
                                return sendMessage(`⚠️ An Internal Server Error has occurred. If the issue persists, contact the developer.`)
                            })
                        })
                    }
                    });
                })
        }  
    })
}

module.exports.info = {
    name:"delete",
    about:"Delete a note",
    cooldown:10
}

