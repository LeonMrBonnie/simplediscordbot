//Discord Bot by Leon
const Discord = require('discord.js');
const fs = require("fs");
const client = new Discord.Client();
client.login('NTY1ODY3MzM3NzIzNjc0NjM1.XK8spw.Ga7qdmtASq6bsWd6617TY583Mzw');
let botChannel;
let welcomeChannel;
let globals = require("./config.js");

client.on('ready', () => 
{   
    console.log("The bot successfully started.");
    botChannel = client.channels.get("565870599793016859");
    welcomeChannel = client.channels.get("565969775063203840");
    client.user.setActivity(globals.botGame);
    //globals.sendEmbed(botChannel, "Bot connected", globals.colors.green, "The bot successfully connected to the server!");
});

client.on('message', (message) => 
{
    if(message.channel !== botChannel) return;
    if(message.author.bot) return;
    if(message.content[0] !== globals.commandPrefix) return;
    let command = message.content.substr(1).split(" ")[0];
    let params = message.content.split(" ");
    params.shift();
    if(!globals.cmdExists(command))
    {
        message.delete();
        globals.sendEmbed(botChannel, "**Command doesn't exist**", globals.colors.red, "The command **" + command + "** does not exist.", "Requested by: " + message.member.user.username);
        return;
    }
    if(!globals.checkPerms(message.member, command))
    {
        message.delete();
        globals.sendEmbed(botChannel, "**No permissions**", globals.colors.red, "You do not have the permissions for this command.", "Requested by: " + message.member.user.username);
        return;
    }
    message.delete();
    switch(command)
    {
        case "help":
        {   
            let msg = new Discord.RichEmbed()
            .setTitle("**Command help:**")
            .setColor(globals.colors.blue)
            .addField("Command", "help\ncleanup\npoke\nadmins\ndeveloper\nuserinfo\nwarn\nunwarn\nfeed", true)
            .addField("Description", "Displays the help\nCleans up the channel\nPokes the bot\nShows all staff\nShows the developer\nShows a user's info\nWarns a user\nRemoves a users warn\nChecks if someone feeds", true)
            .addField("Permissions", "Everyone\nAdmins, Mods\nEveryone\nEveryone\nEveryone\nEveryone\nAdmins, Mods\nAdmins, Mods\nEveryone", true)
            .setFooter("Requested by: " + message.member.user.username);
            botChannel.send(msg);
            break;
        }
        case "cleanup":
        {
            let count = 0;
            botChannel.fetchMessages({limit: 100})
            .then(messages => {
            let messagesArr = messages.array();
            let messageCount = messagesArr.length;
            for(let i = 0; i < messageCount; i++) 
            {
                messagesArr[i].delete()
                .then(function() {
                    count = count++;
                })
                .catch(function() 
                {
                    count = count++;
                });
                if(count >= 100) break;
            }
            globals.sendEmbed(botChannel, "**Cleanup**", globals.colors.green, "Successfully cleaned the channel.", "Requested by: " + message.member.user.username);
            })
            break;
        }
        case "poke":
        {
            let data = fs.readFileSync(__dirname + "/data.json");
            data = JSON.parse(data);
            data["pokes"] = parseInt(data["pokes"]) + 1;
            fs.writeFile(__dirname + "/data.json", JSON.stringify(data, undefined, 2), (err) => {});
            globals.sendEmbed(botChannel, "**Poke**", globals.colors.green, "Don't poke me!\nI was already poked **" + data["pokes"] + "** times!", "Requested by: " + message.member.user.username);
            break;
        }
        case "admins":
        {
            let admins = message.guild.roles.get(globals.roles.adminRole).members.array();
            let adminString = "", adminStatus = "";
            for(let admin in admins)
            {
                if(admins[admin].user.username === undefined) continue;
                adminString += admins[admin].user.username + "\n";
                adminStatus += admins[admin].user.presence.status + "\n";
            }
            let mods = message.guild.roles.get(globals.roles.modRole).members.array();
            let modString = "", modStatus = "";
            if(mods.length !== 0)
            {   
                for(let mod in mods)
                {
                    if(mods[mod].user.username === undefined) continue;
                    modString += mods[mod].user.username + "\n";
                    modStatus += mods[mod].user.presence.status + "\n";
                }
            }
            else modString = "None", modStatus = "None";
            let msg = new Discord.RichEmbed()
            .setTitle("**List of staff:**")
            .setColor(globals.colors.blue)
            .addField("Administrators:", adminString, true)
            .addField("Status:", adminStatus, true)
            .addBlankField()
            .addField("Moderators:", modString, true)
            .addField("Status:", modStatus, true)
            .setFooter("Requested by: " + message.member.user.username);
            botChannel.send(msg);
            break;
        }
        case "developer":
        {
            globals.sendEmbed(botChannel, "**Developed by**", globals.colors.blue, "This discord bot was created by **LeonMrBonnie**!\nYou can contact him on Discord here: *LeonMrBonnie#2251* ", "Requested by: " + message.member.user.username);
            break;
        }
        case "userinfo":
        {
            let user = message.mentions.members.first();
            if(!message.mentions.members.first()) return  globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to see the info about!", "Requested by: " + message.member.user.username);
            let data = fs.readFileSync(__dirname + "/data.json");
            data = JSON.parse(data);
            let msg = new Discord.RichEmbed()
            .setTitle("**" + user.user.username +"**")
            .setColor(globals.colors.blue)
            .setThumbnail(user.user.avatarURL)
            .setDescription("ID: **" + user.user.id + "**\nWarns: **" + data.users[user.user.id].warns + "/3**\nJoined at: **" + globals.timeConverter(data.users[user.user.id].joinedAt) + "**\n")
            .setFooter("Requested by: " + message.member.user.username);
            botChannel.send(msg);
            break;
        }
        case "warn":
        {
            let user = message.mentions.members.first();
            let reason = params.slice(1);
            if(!user || !reason) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to warn and give a reason!", "Requested by: " + message.member.user.username);
            let data = fs.readFileSync(__dirname + "/data.json");
            data = JSON.parse(data);
            data.users[user.user.id].warns++;
            fs.writeFile(__dirname + "/data.json", JSON.stringify(data, undefined, 2), (err) => {});
            let msg = new Discord.RichEmbed()
            .setTitle("**User warned**")
            .setColor(globals.colors.red)
            .setDescription("**" + user.user.username + "** was warned!\nCurrent Warns: **" + data.users[user.user.id].warns + "/3**\nWarned by: **" + message.member.user.username + "**\nReason: **" + reason.join(" ") + "**")
            .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
            botChannel.send(msg);
            if(data.users[user.user.id].warns === 3)
            {
                user.kick("Reached warning treshold");
                msg = new Discord.RichEmbed()
                .setTitle("**User kicked**")
                .setColor(globals.colors.red)
                .setDescription("**" + user.user.username + "** was kicked!\Kicked by: **Automatic Kick**\nReason: **Reached warning threshold**")
                .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                botChannel.send(msg);
            }
            break;
        }
        case "unwarn":
        {
            let user = message.mentions.members.first();
            if(!user) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to unwarn!", "Requested by: " + message.member.user.username);
            let data = fs.readFileSync(__dirname + "/data.json");
            data = JSON.parse(data);
            if(data.users[user.user.id].warns === 0) return globals.sendEmbed(botChannel, "**An error has occured**", globals.colors.red, "The specified user has no warns!", "Requested by: " + message.member.user.username);
            data.users[user.user.id].warns--;
            fs.writeFile(__dirname + "/data.json", JSON.stringify(data, undefined, 2), (err) => {});
            let msg = new Discord.RichEmbed()
            .setTitle("**User unwarned**")
            .setColor(globals.colors.green)
            .setDescription("**" + user.user.username + "** was unwarned!\nCurrent Warns: **" + data.users[user.user.id].warns + "/3**\nUnwarned by: **" + message.member.user.username + "**")
            .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
            botChannel.send(msg);
            break;
        }
        case "feed":
        {
            let user = message.mentions.members.first();
            if(!user) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to check for feed!", "Requested by: " + message.member.user.username);
            let game = user.user.presence;
            if(!game || !game.game || game.game.name !== "League of Legends" || !game.game.assets) return globals.sendEmbed(botChannel, "**Not feeding**", globals.colors.red, "**" + user.user.username + "** is not playing **League of Legends**!", "Requested by: " + message.member.user.username)
            let gameType = game.game.details;
            let gameChamp = game.game.assets.largeText;
            if(gameChamp === "Kayn")
            {
                let msg = new Discord.RichEmbed()
                .setTitle("**FEED ALERT! FEED ALERT!**")
                .setColor(globals.colors.red)
                .setThumbnail(game.game.assets.largeImageURL)
                .setDescription("**THIS PLAYER IS CURRENTLY FEEDING!**\n**EXIT THE GAME AS YASUO NOW OR YOU WILL BE BANNED!**\n\nUser: **" + user.user.username + "**\nGamemode: **" + gameType + "**\nChampion: **" + gameChamp + "**\n")
                .setFooter("Requested by: " + message.member.user.username);
                botChannel.send(msg);
            }
            else
            {
                let msg = new Discord.RichEmbed()
                .setTitle("**No feed alert**")
                .setColor(globals.colors.blue)
                .setThumbnail(game.game.assets.largeImageURL)
                .setDescription("User: **" + user.user.username + "**\nGamemode: **" + gameType + "**\nChampion: **" + gameChamp + "**\n")
                .setFooter("Requested by: " + message.member.user.username);
                botChannel.send(msg);
            }
            break;
        }
    }
});

client.on('guildMemberAdd', (member) => 
{
    globals.sendEmbed(welcomeChannel, "**A new user joined**", globals.colors.green, "**" + member.user.username + "** just joined the server!", "Joined on: " + globals.timeConverter(member.joinedTimestamp));
    let data = fs.readFileSync(__dirname + "/data.json");
    data = JSON.parse(data);
    if(!data.users.hasOwnProperty(member.id))
    {
        data.users[member.id] = {
            "warns": 0,
            "joinedAt": member.joinedTimestamp
        }
    }
    fs.writeFile(__dirname + "/data.json", JSON.stringify(data, undefined, 2), (err) => {});
});

client.on('guildMemberRemove', (member) => 
{
    globals.sendEmbed(welcomeChannel, "**A user has left**", globals.colors.red, "**" + member.user.username + "** has left the server!", "Joined on: " + globals.timeConverter(member.joinedTimestamp));
});