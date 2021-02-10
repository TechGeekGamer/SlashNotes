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
        author:payload.member?payload.member.user.id:payload.user.id
    }
    databaseHandler.get("notes", `${payload.member?payload.member.user.id:payload.user.id}`).then((notes = []) => {
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
            if(note.title == payload.data.options[0]["value"]){
                return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        "type": 4,
                        "data": {
                            "content": `${note.content}`,
                            allowed_mentions:{
                                users:[],
                                roles:[]
                            }
                        }
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
}

module.exports.info = {
    name:"post",
    about:"Share a note you own in the current channel. (Does not work for Server Slash notes)",
    cooldown:5
}