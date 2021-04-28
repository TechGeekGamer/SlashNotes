fetch = require("node-fetch")
const databaseHandler = require("../modules/databaseHandler")
const interactionTemplate = require("../modules/interactionHandler").interactionTemplate

class GuildSettings {
    /**
     * 
     * @param {GuildSettings} options 
     */
    constructor(options){
        this.post_command = true;
        if(options)
            Object.keys(options).forEach(g => this[g] = options[g])
    }
    /**
     * 
     * @param {Boolean} val If /post command is enabled in the guild.
     */
    setPostCommand(val){
        this.post_command = val;
        return this;
    }
}
/**
 * 
 * @param {interactionTemplate} payload 
 */
module.exports.execute = (payload, client) => {
    function ack(hidden = false){
        return new Promise((resolve, reject) => {
            let responsePayload = {
                "type": 5,
            };
            hidden?responsePayload.data = {
                flags:64
            }:null
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
    function sendMessage(msg, hidden = false){
        return new Promise((resolve, reject) => {
            let responsePayload = {
                "content": msg,
                "allowed_mentions": {
                    "parse": []
                }
            };
            hidden?responsePayload.flags = 64:null
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
        if(!payload.guild_id)
            return sendMessage(`🏠 This command is only available in servers.`)
        if(!payload.data.options)
            return sendMessage(`❌ No options were provided. No changes were made.`)
        if((payload.member.permissions & 0x00000020) != 0x00000020)
            return sendMessage(`⚠️ Invalid permissions.\nSorry, you need to have the Manage Server permission to use this feature.`)
        function updateGuildSettings(setting, val){
            databaseHandler.get("guildSettings", payload.guild_id).then(/** @param {GuildSettings} gs */ (gs) => {
                const guildSettings = new GuildSettings(gs)
                if(setting == "POST_COMMAND"){
                    guildSettings.setPostCommand(val)
                    databaseHandler.set("guildSettings", payload.guild_id, guildSettings)
                    .catch(console.error)
                }
            })
        }
        let updatedValues = [];
        for (let index = 0; index < payload.data.options.length; index++) {
            const option = payload.data.options[index];
            if(option.name == "post_command"){
                updatedValues.push(`Updated post command to being **${option.value?"✅ Enabled":"❌ Disabled"}**`)
                updateGuildSettings("POST_COMMAND", option.value)
            }
            if(index+1 == payload.data.options.length)
                return sendMessage(`📝 Updated server preferences:\n- ${updatedValues.join("\n- ")}`)
        }
    })
}

module.exports.info = {
    name:"settings",
    about:"SlashNotes: Edit settings for SlashNotes in this server.",
    cooldown:3
}

module.exports.GuildSettings = GuildSettings;