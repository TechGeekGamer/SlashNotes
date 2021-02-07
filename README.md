# SlashNotes
A Slash Commands bot that you can use to take notes via Discord's Slash Command UI

## Setup

1. Rename `clients.template.js` to `clients.js`
2. In `clients.js`, fill out the `token` section with your Discord bot token
3. Run `npm i`
4. Run `app.js`

## Commands
**create**: Create a note

**delete**: Delete a note

**list**: View all notes you have made

**post**: Share a note you made in the current channel

**view**: View a note

## Notes
- The Manage Server permission is required to manage Server Slash notes. (Notes that can be seen by everyone in the server through the Slash Commands menu.)

- Due to Discord's limits on Slash Commands, you can only have up to 50 Server Slash notes.

- Due to Discord's limits, Slash Commands won't appear in servers with more than 50 bots.
