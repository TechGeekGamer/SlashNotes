fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")
const interactionTemplate = require("../modules/interactionHandler").interactionTemplate
/**
 * 
 * @param {interactionTemplate} payload 
 */
module.exports.execute = (payload) => {
    function ack(){
        return new Promise((resolve, reject) => {
            let responsePayload = {
                "type": 5,
                data:{
                    flags:64
                }
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
        databaseHandler.get("notes", `${payload.member?(payload.member?payload.member.user:payload.user).id:payload.user.id}`).then((notes = []) => {
            if(notes.length <= 0)
                return sendMessage(`🔎 📝 You don't have any notes created.`)
            let list = []
            notes.forEach((note, i) => {
                list.push(`${i+1}: **${note.title}**`)
            });
            return sendMessage(`${(payload.member?payload.member.user:payload.user).username}#${(payload.member?payload.member.user:payload.user).discriminator}'s notes:\n\n${list.join("\n")}`)
        })
    })
}

module.exports.info = {
    name:"list",
    about:"View notes you own. (Does not work for Server Slash notes)"
}