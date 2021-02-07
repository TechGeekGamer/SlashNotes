const interactionTemplate = {
    version: 1,
    type: 2,
    token: '',
    member: {
      user: {
        username: '',
        public_flags: 0,
        id: '0',
        discriminator: '0',
        avatar: '0'
      },
      roles: [],
      premium_since: null,
      permissions: '0',
      pending: false,
      nick: null,
      mute: false,
      joined_at: '0',
      is_pending: false,
      deaf: false
    },
    id: '',
    guild_id: '',
    data: { name: '', id: '' , options:[]},
    channel_id: ''
  }
module.exports.interactionTemplate = interactionTemplate
fetch = require("node-fetch")
const Discord = require("discord.js")

/**
 * 
 * @param {interactionTemplate} payload 
 * @param {String} message 
 */
function reply(payload, message){
  return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify({
        "type": 2,
        "data": {
            "content": message,
            flags:64,
            allowed_mentions:{
              users:[],
              roles:[]
          }
        }
    })
})
}

let cooldowns = new Map()
const config = require("../config.json")

const commandIDs = {
  create:config.create,
  view:config.view,
  delete:config.delete,
  list:config.list,
  help:config.help,
  post:config.post
}

const guildNoteHandler = require("./guildNotesHandler")

/**
 * 
 * @param {interactionTemplate} payload 
 * @param {Discord.Client} client 
 */
module.exports.interaction = function(payload = interactionTemplate, client){
    try{
      console.log(commandIDs[payload.data.name] || "")
      console.log(payload.data.id)
      console.log("======")
      if((commandIDs[payload.data.name] || "") != payload.data.id){
        return guildNoteHandler.interaction(payload, client)
      }
      let author = payload.member.user.id
      let interaction = require(`../interactions/${payload.data.name}`)

      if (!cooldowns.has(interaction.info.name)) {
        cooldowns.set(interaction.info.name, new Discord.Collection());
      }
    
      const now = Date.now();
      const timestamps = cooldowns.get(interaction.info.name);
      const cooldownAmount = (interaction.info.cooldown || 3) * 1000;
    
      if (timestamps.has(payload.member.user.id)) {
        const expirationTime = timestamps.get(payload.member.user.id) + cooldownAmount;
    
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return reply(payload, `⏱ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.info.name}\` interaction.`);
        }
      }
    
      timestamps.set(payload.member.user.id, now);
      setTimeout(() => timestamps.delete(payload.member.user.id), cooldownAmount);

      interaction.execute(payload, client)
    }catch(err){
      console.error(err)
      try{
        return fetch(`https://discord.com/api/v8/interactions/${payload.id}/${payload.token}/callback`, {
          method:"POST",
          headers:{
              "Content-Type":"application/json"
          },
          body:JSON.stringify({
              "type": 2,
              "data": {
                  "content": `⚠️ An Internal Server Error has occurred. If the issue persists, contact the developer.`
              }
          })
      })
      }catch(err){
        console.error(err)
      }
    }
}