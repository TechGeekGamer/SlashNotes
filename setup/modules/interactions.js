//Created by TechGeekGamer

const endpoints = {
    discord_api:"https://discord.com/api/v8"
}
fetch = require("node-fetch")

function InteractionResponse(){
    this.version =  1,
    this.type =  2,
    this.token =  "",
    this.member =  {
      user: {
        username: "",
        public_flags: 0,
        id: "0",
        discriminator: "0",
        avatar: "0"
      },
      roles: [],
      premium_since: null,
      permissions: "0",
      pending: false,
      nick: null,
      mute: false,
      joined_at: "0",
      is_pending: false,
      deaf: false
    },
    this.id =  "",
    this.guild_id =  "",
    this.data =  { name :  "", id :  "" },
    this.channel_id =  ""
}

/**
 * 
 * @param {String} name 
 * @param {String} description 
 * @param {Array} options 
 * 
 */
function Interaction(name, description, options){
    this.name = name
    this.description = description
    this.options = options
    this.application_id = new String()
    this.bot_token = new String()
    this.application_id = new String()
    this.guild_id = undefined
    this.id = undefined
    this.setApplicationID = function(id){
        this.application_id = id
    }
    this.setBotToken = function(token){
        this.bot_token = token
    }
    this.setGuildID = function(id){
        this.guild_id = id
    }
    this.print = function(){
        console.log(`${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds/${this.guild_id}`:""}/commands${this.command_id?`/${this.command_id}`:""}`)
    }
    this.get = function(){
        return new Promise((resolve, reject) => {
            let payload = {
                name:this.name,
                description:this.description
            }
            if(this.options)payload["options"] = this.options
            fetch(`${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds${this.guild_id}`:""}/commands${this.command_id?`/${this.command_id}`:""}`, {
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    authorization:`Bot ${this.bot_token}`
                }
            })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
    }
    /**
     * @returns {Response}
     */
    this.post = function(){
        return new Promise((resolve, reject) => {
            let payload = {
                name:this.name,
                description:this.description
            }
            if(this.options)payload["options"] = this.options
            if(this.id)payload.id = this.id
            const url = `${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds/${this.guild_id}/`:"/"}commands${this.command_id?`/${this.command_id}`:""}`
            fetch(url, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    authorization:`Bot ${this.bot_token}`
                },
                body:JSON.stringify(payload)
            })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
    }
    /**
     * @returns {Response}
     */
    this.put = function(){
        return new Promise((resolve, reject) => {
            let payload = {
                name:this.name,
                description:this.description
            }
            if(this.options)payload["options"] = this.options
            fetch(`${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds${this.guild_id}`:""}/commands${this.command_id?`/${this.command_id}`:""}`, {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    authorization:`Bot ${this.bot_token}`
                },
                body:JSON.stringify(payload)
            })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
    }
    /**
     * @returns {Response}
     */
    this.patch = function(){
        return new Promise((resolve, reject) => {
            let payload = {
                name:this.name,
                description:this.description
            }
            if(this.options)payload["options"] = this.options
            fetch(`${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds${this.guild_id}`:""}/commands${this.command_id?`/${this.command_id}`:""}`, {
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json",
                    authorization:`Bot ${this.bot_token}`
                },
                body:JSON.stringify(payload)
            })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
    }
    /**
     * @returns {Response}
     */
    this.delete = function(){
        return new Promise((resolve, reject) => {
            let payload = {
                name:this.name,
                description:this.description
            }
            if(this.options)payload["options"] = this.options
            fetch(`${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds${this.guild_id}`:""}/commands${this.command_id?`/${this.command_id}`:""}`, {
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json",
                    authorization:`Bot ${this.bot_token}`
                },
                body:JSON.stringify(payload)
            })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
    }
    this.bulkCreate = function(commands){
        return new Promise((resolve, reject) => {
            let payload = commands;
            if(this.options)payload["options"] = this.options
            fetch(`${endpoints.discord_api}/applications/${this.application_id}${this.guild_id?`/guilds/${this.guild_id}`:""}/commands${this.command_id?`/${this.command_id}`:""}`, {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    authorization:`Bot ${this.bot_token}`
                },
                body:JSON.stringify(payload)
            })
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
    }
}
module.exports = Interaction