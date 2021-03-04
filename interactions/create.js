const Discord = require("discord.js")
fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")
const interactionTemplate = require("../modules/interactionHandler").interactionTemplate
/**
 * 
 * @param {interactionTemplate} payload 
 * @param {Discord.Client} client
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
    const noteTitle = payload.data.options[0]["value"]
    const noteContent = payload.data.options[1]["value"]
    const publicNote = payload.data.options[2]["value"]
    ack().then(() => {
        if(publicNote == true && !payload.guild_id)
            return sendMessage(`🏠 This feature is only available in servers.`)
        if(publicNote == true && (payload.member.permissions & 0x00000020) != 0x00000020 && !(process.env.GUILDS_noModPermissionRequiredCreateNote || []).includes(payload.guild_id))
            return sendMessage(`⚠️ Invalid permissions.\nSorry, you need to have Manage Server permission to create a server slash note.`)
        if(noteContent.length > 2000)
            return sendMessage(`❌ Sorry, the content of a note can only be up to 2000 characters.`)
        if(!/^[\w-]{1,32}$/.test(noteTitle))
            return sendMessage(`❌ Sorry, Your note title needs to be between 1 and 32 characters and can't contain spaces.`)
        if(noteTitle != noteTitle.toLowerCase())  
            return sendMessage(`❌ Sorry, the title of the note has to be all lowercase.`)
        if(noteTitle.replace(/ /g, "_") != noteTitle)
            return sendMessage(`❌ Sorry, the title of the note can not include spaces.`)
        const notePayload = {
            title:noteTitle,
            content:noteContent,
            author:payload.member?payload.member.user.id:payload.user.id
        }
        if(publicNote != true){
            databaseHandler.get("notes", `${payload.member?payload.member.user.id:payload.user.id}`).then((notes = []) => {
                if(notes.filter(n => n.title == notePayload.title).length > 0)
                    return sendMessage(`❌ You already have a note with that name. To reuse this name, delete the old note that has this name, then try again.`)
                notes.push(notePayload)
                databaseHandler.set("notes", `${payload.member?payload.member.user.id:payload.user.id}`, notes).then(() => {
                    return sendMessage(`✅ Created note!`)
                })
            })
        }else if(publicNote == true){
            databaseHandler.get("notes", `${payload.guild_id}`).then((notes = {}) => {
                if(notes[noteTitle])
                    return sendMessage(`❌ You already have a note with that name. To reuse this name, delete the old note that has this name, then try again.`)
                fetch(`https://discord.com/api/v8/applications/${client.user.id}/guilds/${payload.guild_id}/commands`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        authorization:`Bot ${client.token}`
                    },
                    body:JSON.stringify({
                        name:noteTitle,
                        description:noteContent.length > 100?noteContent.slice(0, 97)+"...":noteContent
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
                            return sendMessage(`✅ Created server note! Check it via the Slash Command menu.`, undefined, 4, client)
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