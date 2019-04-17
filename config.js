//Config for Discordbot
const {RichEmbed} = require("discord.js"); 
const fs = require("fs");
const commands = require("./commands.json");

module.exports = 
{
    botToken: "NTY2MTc2NTE1MDI5NDY3MTQ3.XLGvew.gXf1taPSKpWzN9BonFwl4wwS4js", //API token for the bot (Create one here: https://discordapp.com/developers/applications/)
    commandPrefix: ".", //Prefix for commands
    botGame: ".help for a list of commands", //The "game" the bot is playing
    antiSpam: 10, //How many seconds a user has to wait to use the next command

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

        fs.writeFileSync(__dirname + "/commands.json", JSON.stringify(commands, undefined, 2)); //Save after all the commands have been loaded
    },

    roles:
    {
        adminRole: "214024301425197056", //Administrator role (RoleID)
        modRole: "363354882847014913" //Moderator role (RoleID)
    },

    channels:
    {
        botChannel: "565870599793016859", //Channel for bot commands (ChannelID)
        infoChannel: "565969775063203840" //Channel for bot informations (ChannelID)
    },

    colors: 
    {
        green: "GREEN",
        red: "RED",
        blue: "BLUE"
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
        console.log(error);
        console.log("******DISCORD BOT ERROR******");
    }
}
