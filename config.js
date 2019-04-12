//Config for Discordbot
const {RichEmbed} = require("discord.js"); 

module.exports = 
{
    botToken: "", //API token for the bot (Create one here: https://discordapp.com/developers/applications/)
    commandPrefix: ".", //Prefix for commands
    botGame: ".help for a list of commands", //The "game" the bot is playing

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
    
    sendEmbed: function(channel, title, color, text, footer) //Function for easy embedded messages
    {
        let msg = new RichEmbed()
        .setTitle(title)
        .setColor(color)
        .setDescription(text);
        if(footer) msg.setFooter(footer);
        channel.send(msg);
    },
 
    checkPerms: function(user, command) //Checks if a user has permissions for the command
    {
        let hasPerms = false;
        let cmdExists = false;
        const admin = module.exports.roles.adminRole;
        const mod = module.exports.roles.modRole;
        switch(command)
        {
            case "cleanup":
            {
                cmdExists = true;
                if(user.roles.has(admin)) hasPerms = true;
                else if(user.roles.has(mod)) hasPerms = true;
                break;
            }
            case "warn":
            {
                cmdExists = true;
                if(user.roles.has(admin)) hasPerms = true;
                else if(user.roles.has(mod)) hasPerms = true;
                break;
            }
            case "unwarn":
            {
                cmdExists = true;
                if(user.roles.has(admin)) hasPerms = true;
                else if(user.roles.has(mod)) hasPerms = true;
                break;
            }
            case "kick":
            {
                cmdExists = true;
                if(user.roles.has(admin)) hasPerms = true;
                else if(user.roles.has(mod)) hasPerms = true;
                break;
            }
            case "ban":
            {
                cmdExists = true;
                if(user.roles.has(admin)) hasPerms = true;
                else if(user.roles.has(mod)) hasPerms = true;
                break;
            }
        }
        if(cmdExists) return hasPerms; //If the commands has custom permissions, return the permissions
        else return true; //If the command has no custom permissions, everyone has permissions
    },

    cmdExists: function(command)
    {
        let commands = [  //Add new commands into this array!
            "help",
            "cleanup",
            "poke",
            "admins",
            "developer",
            "userinfo",
            "warn",
            "unwarn",
            "feed",
            "kick",
            "ban"
        ];
        if(commands.indexOf(command) === -1) return false;
        else return true;
    },

    timeConverter: function(UNIX_timestamp) //Converts Timestamp to a readable date
    {
        var a = new Date(UNIX_timestamp);
        var year = a.getFullYear();
        var month = a.getMonth() + 1;
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min;
        return time;
    },

    sendError: function(error)
    {
        console.log("******DISCORD BOT ERROR******");
        console.log(error);
        console.log("******DISCORD BOT ERROR******");
    }
}
