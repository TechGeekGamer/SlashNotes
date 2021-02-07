fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")

const interactionTemplate = require("../modules/interactionHandler").interactionTemplate

function ack(payload){
    return new Promise((resolve, reject) => {
        return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                type:4,
                data:{
                    content:`Processing.`,
                    flags:64
                }
            })
        })
        .then(r => {
            resolve(r)
        })
        .catch(reject)
    })
}

/**
 * 
 * @param {interactionTemplate} payload 
 * @param {String} message 
 * @param {Number} flags 
 * @param {Number} responseType
 * @param {Discord.Client} client
 */
function respond(payload, message = "No message content provided.", flags = undefined, responseType = 2, client){
    return new Promise((resolve, reject) => {
        let messagePayload = {
            "content": message,
        }
        flags?messagePayload.flags = flags:null
        return fetch(`https://discord.com/api/v8/webhooks/${client.user.id}/${payload.token}`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(messagePayload)
        })
        .then(resolve)
        .catch(reject)
    })
}

/**
 * 
 * @param {interactionTemplate} payload 
 */
module.exports.execute = (payload, client) => {
    const noteTitle = payload.data.options[0].value
    const notePublic = payload.data.options[1].value
    if(notePublic == false){
        databaseHandler.get("notes", `${payload.member.user.id}`).then((notes = []) => {
            if(notes.length == 0)
                return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        "type": 2,
                        "data": {
                            "content": `🔎 📝 You don't have any notes created.`,
                            flags:64
                        }
                    })
                })
            notes.forEach((note, i) => {
                if(note.title == noteTitle){
                    notes.splice(i, 1)
                    databaseHandler.set("notes", `${payload.member.user.id}`, notes).then(() => {
                        return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json"
                            },
                            body:JSON.stringify({
                                "type": 2,
                                "data": {
                                    "content": `Successfully deleted **${note.title}** note.`,
                                    flags:64
                                }
                            })
                        })
                    })
                }else
                if(i+1 == notes.length){
                    return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({
                            "type": 2,
                            "data": {
                                "content": `🔎 📝 Unable to find that note. Please make sure you have the correct spelling of the note name, and that it isn't a server slash note.`,
                                flags:64
                            }
                        })
                    })
                }
            });
        })
    }else if(notePublic == true){
        if(notePublic == true && (payload.member.permissions & 0x00000020) != 0x00000020)
            return respond(payload, `⚠️ Invalid permissions.\nSorry, you need to have Manage Server permission to delete a server slash note.`, 64, 2, client)
        ack(payload).then(() => {
            databaseHandler.get("notes", `${payload.guild_id}`).then((notes = {}) => {
                if(Object.keys(notes).length == 0)return respond(payload, `This server doesn't have any Server Slash Notes`, 64, 2, client)
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
                                return respond(payload, `Successfully deleted slash server note.`, undefined, 4, client)
                            })
                        })
                    }else
                    if(i+1 == Object.keys(notes).length){
                        return  respond(payload, `🔎 📝 Unable to find that note. Please make sure you have the correct spelling.`, undefined, 4, client)
                    }
                });
            })
        })
    }
}

module.exports.info = {
    name:"delete",
    about:"Delete a note",
    cooldown:10
}