const Discord = require("discord.js")
fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")

const interactionTemplate = require("../modules/interactionHandler").interactionTemplate

let saidHello = 0

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
 * @param {Discord.Client} client
 */
module.exports.execute = (payload, client) => {
    var prevTime = new Date(2021,1,14,0,0);
    var thisTime = new Date();
    var diff = thisTime.getTime() - prevTime.getTime();
    const note_id = Date.now()
    const noteTitle = payload.data.options[0]["value"]
    const noteContent = payload.data.options[1]["value"]
    const publicNote = payload.data.options[2]["value"]
    if(publicNote == true && !payload.guild_id)
        return respond(payload, `🏠 This feature is only available in servers.`, 64, 2, client)
    if(publicNote == true && (payload.member.permissions & 0x00000020) != 0x00000020)
        return respond(payload, `⚠️ Invalid permissions.\nSorry, you need to have Manage Server permission to create a server slash note.`, 64, 2, client)
    if(noteContent.length > 2000)
        return respond(payload, `❌ Sorry, the content of a note can only be up to 2000 characters.`, 64, 2, client)
    if(noteTitle.length > 30 || noteTitle.length < 3)
        return respond(payload, `❌ Sorry, Your note title needs to be between 3 and 32 characters.`, 64, 2, client)
    if(noteTitle != noteTitle.toLowerCase())  
        return respond(payload, `❌ Sorry, the title of the note has to be all lowercase.`, 64, 2, client)
    if(noteTitle.replace(/ /g, "_") != noteTitle)
        return respond(payload, `❌ Sorry, the title of the note can not include spaces.`, 64, 2, client)
    //Hello
    ack(payload).then(() => {
        const notePayload = {
            title:noteTitle,
            content:noteContent,
            author:payload.member?payload.member.user.id:payload.user.id
        }
        if(publicNote != true){
            databaseHandler.get("notes", `${payload.member?payload.member.user.id:payload.user.id}`).then((notes = []) => {
                if(notes.filter(n => n.title == notePayload.title).length > 0)
                    return respond(payload, `❌ You already have a note with that name. To reuse this name, delete the old note that has this name, then try again.`, 64, 2, client)
                notes.push(notePayload)
                databaseHandler.set("notes", `${payload.member?payload.member.user.id:payload.user.id}`, notes).then(() => {
                    return respond(payload, `✅ Created note!`, 64, 2, client)
                })
            })
        }else if(publicNote == true){
            databaseHandler.get("notes", `${payload.guild_id}`).then((notes = {}) => {
                if(notes[noteTitle])
                    return respond(payload, `❌ You already have a note with that name. To reuse this name, delete the old note that has this name, then try again.`, 64, 2, client)
                fetch(`https://discord.com/api/v8/applications/${client.user.id}/guilds/${payload.guild_id}/commands`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        authorization:`Bot ${client.token}`
                    },
                    body:JSON.stringify({
                        name:noteTitle,
                        description:noteContent.length > 25?noteContent.slice(0, 25)+"...":noteContent
                    })
                })
                .then(r => r.json())
                .then(
                    /**
                     * 
                     * @param {interactionTemplate} newInteraction 
                     */
                    (newInteraction) => {
                        notes[newInteraction.id] = notePayload
                        databaseHandler.set("notes", `${payload.guild_id}`, notes).then(() => {
                            return respond(payload, `✅ Created server note! Check it via the Slash Command menu.`, undefined, 4, client)
                        })
                })
            })
        }
    })
}

module.exports.info = {
    name:"create",
    about:"Create a note",
    cooldown:30
}