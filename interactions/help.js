const fs = require("fs")
fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")

const interactionTemplate = require("../modules/interactionHandler").interactionTemplate

let helpMenuTop = []
let helpMenuMain = []
require("../app").interactionCommands.forEach(c => helpMenuMain.push(`**${c.info.name}**: ${c.info.about}`))
helpMenuMain.push(`\n**__Notes__**\n- The Manage Server permission is required to manage Server Slash notes. (Notes that can be seen by everyone in the server through the Slash Commands menu.)\n`)
helpMenuMain.push("- Due to Discord's limits on Slash Commands, you can only have up to 50 Server Slash notes.")
helpMenuTop.push(`**SlashNotes**`, `[Support Server](<https://discord.gg/eP8ab7wsp4>)`, `[Invite](<https://discord.com/api/oauth2/authorize?client_id=799921906047647744&scope=bot%20applications.commands>)`, `[Privacy Policy](https://gist.github.com/TechGeekGamer/3a0bf5de34cb04018f205f55852cd5ba)`)
/**
 * 
 * @param {interactionTemplate} payload 
 */
module.exports.execute = (payload, client) => {
    if(!payload.data.options){
        return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                "type": 4,
                "data": {
                    "content": `${helpMenuTop.join(` | `)}\n\n${helpMenuMain.join("\n")}`
                }
            })
        })
    }else{
        try{
            if(!fs.existsSync("./interactions/"+payload.data.options[0].value+".js")){
                let name = payload.data.options[0].value
                return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        "type": 4,
                        "data": {
                            "content": `${helpMenuTop.join(` | `)}\n\nName: ${name || "No name found."}\nAbout: Interaction does not exist. Make sure you have the correct spelling.\nCooldown: None`
                        }
                    })
                })
            }
            let interaction = require(`./${payload.data.options[0].value}`)
            return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    "type": 4,
                    "data": {
                        "content": `${helpMenuTop.join(` | `)}\n\nName: ${interaction.info.name || "No name found."}\nAbout: ${interaction.info.about || "No information found."}\nCooldown: ${interaction.info.cooldown || "None"}`
                    }
                })
            })
        }catch(err){

        }
    }
}

module.exports.info = {
    name:"help",
    about:"View all available commands and other info"
}