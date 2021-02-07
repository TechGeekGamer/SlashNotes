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
        "type": 4,
        "data": {
            "content": message,
            allowed_mentions:{
              users:[],
              roles:[]
          }
        }
    })
})
}

let cooldowns = new Map()

const commandIDs = {
  create:"800132653483294770",
  view:"800133537353039901",
  delete:"800133583129018419",
  list:"800905782391865394",
  help:"801200715259183125",
  post:"801731738925006859"
}

/**
 * 
 * @param {interactionTemplate} payload 
 * @param {Discord.Client} client 
 */
module.exports.interaction = function(payload, client){
    try{
        const databaseHandler = require("./databaseHandler")
        databaseHandler.get("notes", `${payload.guild_id}`).then((guildNotes = {}) => {
          let noteID = payload.data.id
          if(!guildNotes[noteID])
            return reply(payload, `😕 Sorry, that note could not be found. This shouldn't happen. Please contact the bot developer if it continues.`)
          return reply(payload, guildNotes[noteID].content)
        })
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