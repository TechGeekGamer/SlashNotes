const Discord = require("discord.js")
const fs = require("fs")
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
    ack().then(() => {
        let helpMenuTop = new Array()
        let helpMenuMain = new Array()
        let helpMenuFooter = new Array()

        //Top Bar
        helpMenuTop.push(`**SlashNotes**`, `[Support Server](<https://discord.gg/eP8ab7wsp4>)`, `[Invite](<https://discord.com/api/oauth2/authorize?client_id=799921906047647744&scope=bot%20applications.commands>)`, `[Privacy Policy](<https://gist.github.com/TechGeekGamer/3a0bf5de34cb04018f205f55852cd5ba>)`, `[GitHub](<https://github.com/TechGeekGamer/SlashNotes>)`)

        //Command List
        require("../app").interactionCommands.forEach(c => helpMenuMain.push(`**${c.info.name}**: ${c.info.about}`))

        //Notes
        helpMenuMain.push(`\n**__Notes__**\n- The Manage Server permission is required to manage Server Slash notes. (Notes that can be seen by everyone in the server through the Slash Commands menu.)\n`, "- Due to Discord's limits on Slash Commands, you can only have up to 100 Server Slash notes.")

        //Footer
        helpMenuFooter.push(`Version ${require("../package.json").version} | Created by: **TechGeekGamer#7205**`)
        

        if(payload.guild_id && (process.env.GUILDS_noModPermissionRequiredCreateNote || []).includes(payload.guild_id))
            helpMenuMain.push("\n⚠️ This server has special permissions related to creating notes. All members are able to create Server Slash Notes regardless of permissions. If you believe this is a mistake, please contact the bot support server.")
        if(!payload.data.options){
            return sendMessage(`${helpMenuTop.join(` | `)}\n\n${helpMenuMain.join("\n")}\n\n${helpMenuFooter.join(` | `)}`)
        }else{
            try{
                if(!fs.existsSync("./interactions/"+payload.data.options[0].value+".js")){
                    let name = payload.data.options[0].value
                    return sendMessage(`${helpMenuTop.join(` | `)}\n\nName: ${name || "No name found."}\nAbout: Interaction does not exist. Make sure you have the correct spelling.\nCooldown: None\n\n${helpMenuFooter.join(` | `)}`).then(() => {
                        helpMenuTop = []
                        helpMenuMain = []
                    })
                }
                let interaction = require(`./${payload.data.options[0].value}`)
                return sendMessage(`${helpMenuTop.join(` | `)}\n\nName: ${interaction.info.name || "No name found."}\nAbout: ${interaction.info.about || "No information found."}\nCooldown: ${interaction.info.cooldown || "None"} ${interaction.info.cooldown?interaction.info.cooldown == 1?`second`:`seconds`:``}\n\n${helpMenuFooter.join(` | `)}`)
            }catch(err){
                console.error(err)
            }
        }
    })
}

module.exports.info = {
    name:"help",
    about:"View all available commands and other info"
}