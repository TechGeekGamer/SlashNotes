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
                "type": 5,
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
                flags:64,
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
        databaseHandler.get("notes", `${payload.member?payload.member.user.id:payload.user.id}`).then((notes = []) => {
            if(notes.length == 0)
                return sendMessage(`🔎 📝 You don't have any notes created.`)
            notes.forEach((note, i) => {
                if(note.title == payload.data.options[0]["value"]){
                    return sendMessage(note.content)
                }else
                if(i+1 == notes.length){
                    return sendMessage(`🔎 📝 Unable to find that note. Please make sure you have the correct spelling of the note name, and that it isn't a server slash note.`)
                }
            });
        })
    })
}

module.exports.info = {
    name:"view",
    about:"View a note you own. (Does not work for Server Slash notes)",
    cooldown:10
}