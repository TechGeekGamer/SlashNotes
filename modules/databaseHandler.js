//Load required
const Keyv = require('keyv');
const fs = require('fs')
const { EventEmitter } = require("events");

//Emitter
const emitter = new EventEmitter();

//Export emitter
module.exports.emitter = emitter

//Variables
const resourceDir = `./data`;
let errorCount = 0

//Check
if(!fs.existsSync(resourceDir))
    fs.mkdirSync(resourceDir)
    

//Error Handling
function databaseError(error = "None provided.", databaseName = "None provided.", section = "None provided."){
    errorCount++
    let now = new Date()
    console.error(`Database error.\nDatabase Name: ${databaseName}\nSection: ${section}\nOccured: ${now.toTimeString()}\nError: ${error}`)
    fs.
    appendFileSync("./errors.log",  `Database error: Database Name: ${databaseName} | Section: ${section} | Occured: ${now.toTimeString()} | Error: ${error}\n\n`)
    emitter.emit("failedToConnect", error, databaseName, section)
}

//Load databases
const notes = new Keyv(`sqlite://${resourceDir}/notes.sqlite`);
const guildSettings = new Keyv(`sqlite://${resourceDir}/guildSettings.sqlite`);
const internalStorage = new Keyv(`sqlite://${resourceDir}/internalStorage`);

//Handle connection errors
notes.on('error', err => databaseError(err, "notes", "load"));
guildSettings.on('error', err => databaseError(err, "guildSettings", "load"));

//Variables
let directCallJson = {
    notes:notes,
    guildSettings:guildSettings
}

//Export
module.exports.directCall = directCallJson
module.exports.errorCount = errorCount

//Load internal storage
internalStorage.get("directCall").then(i => {
    if(i == undefined){
        return emitter.emit("ready");
    }; //Doesn't override built in
    i.forEach((d, index) => {
        if(!this.directCall[d])
            this.directCall[d] = new Keyv(`sqlite://${resourceDir}/${d}.sqlite`)
        if(index+1 == i.length)
            emitter.emit("ready")
    });
});

/**
 * @description Get a key from a database
 * @param {String} databaseName 
 * @param {String} key 
 */
module.exports.get = (databaseName, key) => {
    //Get a key in a database
    return new Promise((resolve, reject) => {
        if(!this.directCall[databaseName])
            return reject(Error("Invalid Database."))
        if(!key)
            return reject(Error("No Key Provided."))
        this.directCall[databaseName].get(key).then(d => {
            d !=undefined ?resolve(d):resolve(d)
        })
    });
};

/**
 * @description Set a key in a database
 * @param {String} databaseName 
 * @param {String} key 
 * @param {String} data
 */
module.exports.set = (databaseName, key, data) => {
    //Set a key in a database
    return new Promise((resolve, reject) => {
        if(!this.directCall[databaseName])
            return reject(Error("Invalid Database."))
        if(!key)
            return reject(Error("No Key Provided."))
        if(!data)
            return reject(Error("No Data Provided."))
        this.directCall[databaseName].set(key, data).then(d => {
            d === true ?
            this.get(databaseName, key).then(r => resolve(r)):
            reject(Error("Failed To Set Key."))
        })
        .catch(err => {
            databaseError(err, databaseName, "set")
        })
    });
};

/**
 * 
 * @param {String} databaseName 
 * @param {String} key 
 */
module.exports.delete = (databaseName, key) => {
    //Delete a key from database
    return new Promise((resolve, reject) => {
        if(!this.directCall[databaseName])
            return reject(Error("Invalid Database."))
        if(!key)
            return reject(Error("No Key Provided."))
        this.directCall[databaseName].delete(key).then(d => {
            d === true ?
            resolve(true):
            reject(Error("Failed To Delete Key."))
        })
        .catch(err => {
            databaseError(err, databaseName, "delete")
        });
    });
};

/**
 * @description Create a new database
 * @param {String} databaseName 
 */
module.exports.new = (databaseName) => {
    //Creates a new database
    return new Promise((resolve, reject) => {
        if(this.directCall[databaseName])
            return reject(Error("Database Already Exists."))
        try{
            this.directCall[databaseName] = new Keyv(`sqlite://${resourceDir}/${databaseName}.sqlite`)
            return internalStorage.set("directCall", Object.keys(this.directCall)).then(() => {
                resolve(true)
            })
        }catch(err){
            databaseError(err, databaseName, "new")
            reject(Error("Failed To Create New Database."))
        };
    });
};


emitter.on("error", err => {
    //require("../app").error(err)
})