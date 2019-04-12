//Variables for Discordbot
const {RichEmbed} = require("discord.js");

module.exports = 
{
    commandPrefix: ".",
    botGame: ".help for a list of commands",

    colors: 
    {
        green: "GREEN",
        red: "RED",
        blue: "BLUE"
    },

    roles:
    {
        adminRole: "214024301425197056",
        modRole: "363354882847014913"
    },
    
    sendEmbed: function(channel, title, color, text, footer) 
    {
        let msg = new RichEmbed()
        .setTitle(title)
        .setColor(color)
        .setDescription(text);
        if(footer) msg.setFooter(footer);
        channel.send(msg);
    },

    checkPerms: function(user, command)
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
        }
        if(cmdExists) return hasPerms;
        else return true;
    },

    cmdExists: function(command)
    {
        let commands = [
            "help",
            "cleanup",
            "poke",
            "admins",
            "developer",
            "userinfo",
            "warn",
            "unwarn",
            "feed"
        ];
        if(commands.indexOf(command) === -1) return false;
        else return true;
    },

    timeConverter: function(UNIX_timestamp)
    {
        var a = new Date(UNIX_timestamp);
        var year = a.getFullYear();
        var month = a.getMonth() + 1;
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min;
        return time;
    }
}