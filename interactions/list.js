fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")

const interactionTemplate = require("../modules/interactionHandler").interactionTemplate
/**
 * 
 * @param {interactionTemplate} payload 
 */
module.exports.execute = (payload) => {
    var prevTime = new Date(2021,0,0,0,0);
    var thisTime = new Date();
    var diff = thisTime.getTime() - prevTime.getTime();
    let note_id = diff
    const notePayload = {
        title:"",
        content:"",
        author:payload.member?(payload.memberr?payload.member.user:payload.user).id:payload.user.id
    }
    databaseHandler.get("notes", `${payload.member?(payload.memberr?payload.member.user:payload.user).id:payload.user.id}`).then((notes = []) => {
        if(notes.length <= 0){
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
        }
        let list = []
        notes.forEach((note, i) => {
            list.push(`${i+1}: **${note.title}**`)
        });
        return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                "type": 2,
                "data": {
                    "content": `${(payload.memberr?payload.member.user:payload.user).username}#${(payload.memberr?payload.member.user:payload.user).discriminator}'s notes:\n\n${list.join("\n")}`,
                    flags:64
                }
            })
        })
    })
}

module.exports.info = {
    name:"list",
    about:"View notes you own. (Does not work for Server Slash notes)"
}