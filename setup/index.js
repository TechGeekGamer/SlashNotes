const {writeFileSync, existsSync} = require("fs")
const Interaction = require("./modules/interactions")
const commands = [
    {
      name: 'create',
      description: 'Create a note.',
      options: [
        {
          type: 3,
          name: 'title',
          description: 'The title of the note. (You will use this to lookup and view the note.)',
          required: true
        },
        {
          type: 3,
          name: 'content',
          description: 'The content of the note',
          required: true
        },
        {
          type: 5,
          name: 'public',
          description: "Have note appear in this server's slash commands menu? (Requires Manage Server permission)",
          required: true
        }
      ]
    },
    {
      name: 'view',
      description: 'View a note you own. (Does not work for Server Slash notes)',
      options: [
        {
          type: 3,
          name: 'title',
          description: 'The title of the note,',
          required: true
        }
      ]
    },
    {
      name: 'delete',
      description: 'Delete a note using its name.',
      options: [
        {
          type: 3,
          name: 'title',
          description: 'The title of the note,',
          required: true
        },
        {
          type: 5,
          name: 'public',
          description: 'Is this a server slash note? (Requires Manage Server permission)',
          required: true
        }
      ]
    },
    {
      name: 'list',
      description: 'View notes you own. (Does not work for Server Slash notes)',
    },
    {
      name: 'help',
      description: 'View all available commands or view information on a certain one.',
      options: [
        {
          type: 3,
          name: 'command',
          description: 'A command you want more info on.'
        }
      ]
    },
    {
      name: 'post',
      description: 'Share a note you own in the current channel. (Does not work for Server Slash notes)',
      options: [
        {
          type: 3,
          name: 'title',
          description: 'The title of the note you want to share.',
          required: true
        }
      ]
    }
  ]
  
  module.exports = new Promise((resolve, reject) => {
    if(!existsSync("./setup/config.json"))
        return reject(new Error("Please setup the config.json file in setup/"))
    const config = require("./config.json")
      
    const app = new Interaction()
    app.setApplicationID(config.applicationID)
    app.setBotToken(config.token)
    if(existsSync("./setup.flag"))
        return resolve(true)
    console.log("Setup in progress...")
    app.bulkCreate(commands).then(r => {
      if(r.status == 401)
        reject(new Error(`401: Make sure you provided the correct token.`))
      return r.json()
    }).then(commands => {
        console.log("Registered commands. May take up to an hour to appear in all guilds. Make sure to authorize the application using the applications.commands scope.")
        console.log(`Invite: https://discord.com/oauth2/authorize?client_id=${app.application_id}&scope=bot%20applications.commands`)
        let commandConfig = {}
        commands.forEach((cmd, i) => {
            commandConfig[cmd.name] = cmd.id
            if(i+1 == commands.length){
                writeFileSync("./setup.flag", "1")
                writeFileSync("./config.json", JSON.stringify(commandConfig, null, 2))
                console.log("Setup complete. Sending back to app.js...")
                resolve(true)
            }
        });
    })
    .catch(reject)
  })