//Config for Discordbot
const {RichEmbed} = require("discord.js"); 
const fs = require("fs");
const commands = require("./data/commands.json");

module.exports = 
{
    botToken: "", //API token for the bot (Create one here: https://discordapp.com/developers/applications/)
    commandPrefix: ".", //Prefix for commands
    botUsername: "Simple Discordbot", //The bot's username
    botGame: ".help for a list of commands", //The "game" the bot is playing

    options:
    {
        sendJoinMessage: true, //Should a info message be sent when a user joins the discord?
        sendLeaveMessage: false, //Should a info message be sent when a user leaves the discord?
        sendConnectMessage: false, //Should a info message be sent when the bot connects to the discord server?
        banHistoryDeleteTime: "7", //Amount of days that the text history of a banned user should be deleted (Keep this as a string!!)
        maxAllowedWarns: 3, //Max. allowed warns before the user gets kicked from the discord server
        antiSpamTime: 10 //How many seconds a user has to wait to use the next command
    },

    roles:
    {
        adminRole: "", //Administrator role (RoleID)
        modRole: "" //Moderator role (RoleID)
    },

    channels:
    {
        botChannel: "", //Channel for bot commands (ChannelID)
        infoChannel: "" //Channel for bot informations (ChannelID)
    },

    colors: 
    {
        green: "GREEN",
        red: "RED",
        blue: "BLUE"
    },
    
    loadUsers: (Discord, bot) =>
    {
        let data = fs.readFileSync(__dirname + "/data/data.json");
        data = JSON.parse(data);
        var Count;
        for(Count in bot.users.array()){
            var User = bot.users.array()[Count];
            if(!data.users.hasOwnProperty(User.id)) //If the user has no data saved, add them to our database
            {
                data.users[User.id] = {
                    "warns": 0,
                    "joinedAt": 0
                }
            }

        }
        fs.writeFile(__dirname + "/data/data.json", JSON.stringify(data, undefined, 2), (err) => {}); //Save the data to our database
    },

    loadCommands: () => //Add your own commands here and handle them in the index.js file
    {
        const createCmd = module.exports.createCommand;
        createCmd("help", "Displays the help", true);
        createCmd("cleanup", "Cleans up the channel", false);
        createCmd("poke", "Pokes the bot", true);
        createCmd("admins", "Shows a list of staff", true);
        createCmd("developer", "Shows the developer", true);
        createCmd("userinfo", "Shows info about a user", true);
        createCmd("warn", "Warns a user", false);
        createCmd("unwarn", "Unwarns a user", false);
        createCmd("feed", "Checks if a user is feeding", true);
        createCmd("kick", "Kicks a user", false);
        createCmd("ban", "Bans a user", false);
        createCmd("meme", "Outputs a random meme", true);
        createCmd("setusername", "Sets a users username", false);
        /*createCmd("playyoutube", "Plays a youtube video", true);
        createCmd("stopyoutube", "Stops the current video", true);*/

        fs.writeFileSync(__dirname + "/data/commands.json", JSON.stringify(commands, undefined, 2)); //Save after all the commands have been loaded
    },
    
    sendEmbed: (channel, title, color, text, footer) => //Function for easy embedded messages
    {
        let msg = new RichEmbed()
        .setTitle(title)
        .setColor(color)
        .setDescription(text);
        if(footer) msg.setFooter(footer);
        channel.send(msg);
    },
 
    checkPerms: (user, command) => //Checks if a user has permissions for the command
    {
        const admin = module.exports.roles.adminRole;
        const mod = module.exports.roles.modRole;
        if(user.roles.has(admin)) return true;
        else if(commands[command].allowUser === true) return true;
        else if(commands[command].allowUser === false && user.roles.has(mod)) return true;
        else return false;
    },

    cmdExists: (command) => //Checks if a command exists
    {
        if(commands[command] === undefined) return false;
        else return true;
    },

    createCommand: (command, description, allowUser) => //Adds a new command to the commandhandler
    {
        if(!commands.hasOwnProperty(command)) commands[command] = {
            "description": description,
            "allowUser": allowUser
        }
    },

    timeConverter: (UNIX_timestamp) => //Converts Timestamp to a readable date
    {
        let a = new Date(UNIX_timestamp);
        let year = a.getFullYear();
        let month = a.getMonth() + 1;
        let date = a.getDate();
        let hour = a.getHours();
        let min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        let time = date + '.' + month + '.' + year + ' ' + hour + ':' + min;
        return time;
    },

    sendError: (error) => //Sends an error to the console
    {
        console.log("******DISCORD BOT ERROR******");
        throw error;
    }
}
