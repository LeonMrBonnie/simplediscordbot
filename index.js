//Discord Bot by Leon
const Discord = require('discord.js');
const fs = require("fs");
const bot = new Discord.Client(); //Creates a new discord bot instance

let spamProtection = [];
let botChannel, infoChannel;
let globals = require("./config.js"); //Import our config data and our functions

bot.on('ready', () => //Called when the discord bot connects to the server
{   
    globals.loadCommands(); //Load all the commands using the commandhandler
    botChannel = bot.channels.get(globals.channels.botChannel); //Get the bot channel for later use
    if(botChannel === undefined) globals.sendError("The botchannel is not correctly set up!"); //The botchannel could not be found, send an error
    infoChannel = bot.channels.get(globals.channels.infoChannel); //Get the info channel for later use
    if(infoChannel === undefined) globals.sendError("The infochannel is not correctly set up!"); //The infochannel could not be found, send an error
    bot.user.setActivity(globals.botGame); //Set the "game" the bot is playing
    bot.user.setUsername(globals.botUsername); //Set the bot's username
    if(globals.options.sendConnectMessage === true && infoChannel !== undefined) globals.sendEmbed(infoChannel, "Bot connected", globals.colors.green, "The bot successfully connected to the server!"); //Send a message to the bot channel that the bot has connected
    console.log("The bot successfully started.");
});

bot.on('message', (message) => //Called when a message is send to any channel
{
    if(message.channel !== botChannel) return; //The message was not send in the bot channel, ignore it
    if(message.author.bot) return; //The message author is a bot, ignore it
    if(message.content[0] !== globals.commandPrefix) return; //The message does not contain our command prefix, ignore it
    let command = message.content.substr(1).split(" ")[0]; //Get the command that was given in the message
    let params = message.content.split(" "); //Get the parameters given in the message
    params.shift(); //Remove the first element of the array, which is the command itself
    message.delete(); //Delete the message and respond later
    if(!globals.cmdExists(command)) //Check if the command exists
    {
        globals.sendEmbed(botChannel, "**Command doesn't exist**", globals.colors.red, "The command **" + command + "** does not exist.", "Requested by: " + message.member.user.username);
        return;
    }
    if(!globals.checkPerms(message.member, command)) //Check if the user has permissions to use the command
    {
        globals.sendEmbed(botChannel, "**No permissions**", globals.colors.red, "You do not have the permissions for this command.", "Requested by: " + message.member.user.username);
        return;
    }
    if(spamProtection[message.member.id] >= Date.now() && spamProtection[message.member.id]) return; //Do not handle the command, when the user has spam protection
    switch(command) //Add a new case for each command here
    {
        case "help":
        {   
            let cmdsString = new String(), descString = new String(), permsString = new String();
            let cmds = fs.readFileSync(__dirname + "/commands.json");
            cmds = JSON.parse(cmds);
            for(let cmd in cmds)
            {
                cmdsString += cmd + "\n";
                descString += cmds[cmd].description + "\n";
                let perms = "Everyone";
                if(cmds[cmd].allowUser === false) perms = "Admins, Mods";
                permsString += perms + "\n";
            }
            let msg = new Discord.RichEmbed()
            .setTitle("**Command help:**")
            .setColor(globals.colors.blue)
            .addField("Command", cmdsString, true)
            .addField("Description", descString, true)
            .addField("Permissions", permsString, true)
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
            let role = "User";
            if(user.roles.has(globals.roles.adminRole)) role = "Administrator";
            else if(user.roles.has(globals.roles.modRole)) role = "Moderator";
            let msg = new Discord.RichEmbed()
            .setTitle("**" + user.user.username +"**")
            .setColor(globals.colors.blue)
            .setThumbnail(user.user.avatarURL)
            .setDescription("ID: **" + user.user.id + "**\nRole: **" + role + "**\nWarns: **" + data.users[user.user.id].warns + "/3**\nJoined at: **" + globals.timeConverter(data.users[user.user.id].joinedAt) + "**\n")
            .setFooter("Requested by: " + message.member.user.username);
            botChannel.send(msg);
            break;
        }
        case "warn":
        {
            let user = message.mentions.members.first();
            let reason = params.slice(1).join(" ");
            if(!user || !reason) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to warn and give a reason!", "Requested by: " + message.member.user.username);
            let data = fs.readFileSync(__dirname + "/data.json");
            data = JSON.parse(data);
            data.users[user.user.id].warns++;
            fs.writeFile(__dirname + "/data.json", JSON.stringify(data, undefined, 2), (err) => {});
            let msg = new Discord.RichEmbed()
            .setTitle("**User warned**")
            .setColor(globals.colors.red)
            .setDescription("**" + user.user.username + "** was warned!\nCurrent Warns: **" + data.users[user.user.id].warns + "/3**\nWarned by: **" + message.member.user.username + "**\nReason: **" + reason + "**")
            .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
            infoChannel.send(msg);
            if(data.users[user.user.id].warns === 3) //The user has 3 warns, automatically kick them from the discord server
            {
                user.kick("Reached warning treshold")
                .then(() => {
                    msg = new Discord.RichEmbed()
                    .setTitle("**User kicked**")
                    .setColor(globals.colors.red)
                    .setDescription("**" + user.user.username + "** was kicked!\Kicked by: **Automatic Kick**\nReason: **Reached warning threshold**")
                    .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                    infoChannel.send(msg);
                });
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
            infoChannel.send(msg);
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
            if(gameChamp === "Yasuo") //The user is playing League of Legends as Yasuo, send a feed alert
            {
                let msg = new Discord.RichEmbed()
                .setTitle("**FEED ALERT! FEED ALERT!**")
                .setColor(globals.colors.red)
                .setThumbnail(game.game.assets.largeImageURL)
                .setDescription("**THIS PLAYER IS CURRENTLY FEEDING!**\n**EXIT THE GAME AS YASUO NOW OR YOU WILL BE BANNED!**\n\nUser: **" + user.user.username + "**\nGamemode: **" + gameType + "**\nChampion: **" + gameChamp + "**\n")
                .setFooter("Requested by: " + message.member.user.username);
                botChannel.send(msg);
            }
            else //The user is playing League of Legends, but not Yasuo, send no feed alert
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
        case "kick":
        {
            let user = message.mentions.members.first();
            let reason = params.slice(1).join(" ");
            if(!user || !reason) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to kick and give a reason!", "Requested by: " + message.member.user.username);
            if(user.roles.has(globals.roles.adminRole) || !message.member.roles.has(globals.roles.adminRole) && user.roles.has(globals.roles.modRole)) return globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot kick this user!", "Requested by: " + message.member.user.username); //Admins cannot be kicked and mods cannot kick mods
            user.kick(reason)
            .then(() => {
                msg = new Discord.RichEmbed()
                .setTitle("**User kicked**")
                .setColor(globals.colors.red)
                .setDescription("**" + user.user.username + "** was kicked!\nKicked by: **" + message.member.user.username + "**\nReason: **" + reason + "**")
                .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                infoChannel.send(msg);
            })
            .catch((err) => {
                if(err.message === "Missing Permissions") globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot kick this user!", "Requested by: " + message.member.user.username);
            });
            break;
        }
        case "ban":
        {
            let user = message.mentions.members.first();
            let reason = params.slice(1).join(" ");
            if(!user || !reason) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to ban and give a reason!", "Requested by: " + message.member.user.username);
            if(user.roles.has(globals.roles.adminRole) || !message.member.roles.has(globals.roles.adminRole) && user.roles.has(globals.roles.modRole)) return globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot ban this user!", "Requested by: " + message.member.user.username); //Admins cannot be banned and mods cannot ban mods
            user.ban({days: "7", reason: reason})
            .then(() => {
                msg = new Discord.RichEmbed()
                .setTitle("**User banned**")
                .setColor(globals.colors.red)
                .setDescription("**" + user.user.username + "** was banned!\nbanned by: **" + message.member.user.username + "**\nReason: **" + reason + "**")
                .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                infoChannel.send(msg);
            })
            .catch((err) => {
                if(err.message === "Missing Permissions") globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot ban this user!", "Requested by: " + message.member.user.username);
            });
            break;
        }
        case "meme":
        {
            let memes = fs.readdirSync(__dirname + "/memes");
            let meme = __dirname + "/memes/" + memes[Math.floor(Math.random() * memes.length)];
            let msg = new Discord.RichEmbed()
            .setTitle("**A random meme**")
            .setColor(globals.colors.blue)
            .attachFile(meme)
            .setFooter("Requested by: " + message.member.user.username);
            botChannel.send(msg);
            break;
        }
        case "setusername":
        {
            let user = message.mentions.members.first();
            let newUsername = params.slice(1).join(" ");
            if(!user || !newUsername) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to set the username of and give a new username!", "Requested by: " + message.member.user.username);
            if(newUsername === user.displayName) return globals.sendEmbed(botChannel, "**New name can't be old name**", globals.colors.red, "You can't set the username to the name the user currently has!", "Requested by: " + message.member.user.username);
            if(newUsername.length >= 32) return globals.sendEmbed(botChannel, "**Username too long**", globals.colors.red, "You can't set a username longer than 32 characters!", "Requested by: " + message.member.user.username);
            let oldName = user.displayName;
            user.setNickname(newUsername)
            .then(() => {
                let msg = new Discord.RichEmbed()
                .setTitle("**Username changed**")
                .setColor(globals.colors.blue)
                .setDescription("**" + user.user.username + "**'s username is now **" + newUsername + "**!\nSet by: **" + message.member.user.username + "**\n")
                .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                infoChannel.send(msg);
            })
            .catch((err) => {
                if(err.message === "Missing Permissions") globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot set this user's username!", "Requested by: " + message.member.user.username);
            });
            break;
        }
    }
    spamProtection[message.member.id] = Date.now() + globals.antiSpam * 1000;
});

bot.on('guildMemberAdd', (member) => //Called when a user has joined the discord server
{
    if(globals.options.sendJoinMessage === true) globals.sendEmbed(infoChannel, "**A new user joined**", globals.colors.green, "**" + member.user.username + "** just joined the server!", "Joined on: " + globals.timeConverter(member.joinedTimestamp));
    let data = fs.readFileSync(__dirname + "/data.json");
    data = JSON.parse(data);
    if(!data.users.hasOwnProperty(member.id)) //If the user has no data saved, add them to our database
    {
        data.users[member.id] = {
            "warns": 0,
            "joinedAt": member.joinedTimestamp
        }
    }
    fs.writeFile(__dirname + "/data.json", JSON.stringify(data, undefined, 2), (err) => {}); //Save the data to our database
});

if(globals.options.sendLeaveMessage === true)
{
    bot.on('guildMemberRemove', (member) => //Called when a user has left the discord server
    {
        globals.sendEmbed(infoChannel, "**A user has left**", globals.colors.red, "**" + member.user.username + "** has left the server!", "Joined on: " + globals.timeConverter(member.joinedTimestamp));
    });
}

bot.login(process.env.BOT_TOKEN || globals.botToken) //Connects the bot to the discord server
.catch((err) => 
{
    globals.sendError("The botToken is not correct!"); //Throw an error if the botToken is not correct
});