//Discord Bot by Leon
const Discord = require('discord.js');
const fs = require("fs");
const bot = new Discord.Client(); //Creates a new discord bot instance

let botChannel, infoChannel;
let globals = require("./config.js"); //Import our config data and our functions

bot.on('ready', () => //Called when the discord bot connects to the server
{   
    console.log("The bot successfully started.");
    botChannel = bot.channels.get(globals.channels.botChannel); //Get the bot channel for later use
    if(botChannel === undefined) globals.sendError("The botchannel is not correctly set up!"); //The botchannel could not be found, send an error
    infoChannel = bot.channels.get(globals.channels.infoChannel); //Get the info channel for later use
    if(infoChannel === undefined) globals.sendError("The infochannel is not correctly set up!"); //The infochannel could not be found, send an error
    bot.user.setActivity(globals.botGame); //Set the "game" the bot is playing
    //globals.sendEmbed(botChannel, "Bot connected", globals.colors.green, "The bot successfully connected to the server!"); //Send a message to the bot channel that the bot has connected
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
    switch(command)
    {
        case "help":
        {   
            let msg = new Discord.RichEmbed()
            .setTitle("**Command help:**")
            .setColor(globals.colors.blue)
            .addField("Command", "help\ncleanup\npoke\nadmins\ndeveloper\nuserinfo\nwarn\nunwarn\nfeed\nkick", true)
            .addField("Description", "Displays the help\nCleans up the channel\nPokes the bot\nShows all staff\nShows the developer\nShows a user's info\nWarns a user\nRemoves a users warn\nChecks if someone feeds\nKicks a user", true)
            .addField("Permissions", "Everyone\nAdmins, Mods\nEveryone\nEveryone\nEveryone\nEveryone\nAdmins, Mods\nAdmins, Mods\nEveryone\nAdmins, Mods", true)
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
            let reason = params.slice(1);
            if(!user || !reason) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to kick and give a reason!", "Requested by: " + message.member.user.username);
            if(user.roles.has(globals.adminRole) || !message.member.roles.has(globals.adminRole) && user.roles.has(globals.modRole)) return globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot kick this user!", "Requested by: " + message.member.user.username); //Admins cannot be kicked and mods cannot kick mods
            user.kick(reason)
            .then(() => {
                msg = new Discord.RichEmbed()
                .setTitle("**User kicked**")
                .setColor(globals.colors.red)
                .setDescription("**" + user.user.username + "** was kicked!\Kicked by: **" + message.member.user.username + "**\nReason: **" + reason + "**")
                .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                infoChannel.send(msg);
            });
            break;
        }
        case "ban":
        {
            let user = message.mentions.members.first();
            let reason = params.slice(1);
            if(!user || !reason) return globals.sendEmbed(botChannel, "**Missing parameter**", globals.colors.red, "You have to mention the user you want to ban and give a reason!", "Requested by: " + message.member.user.username);
            if(user.roles.has(globals.adminRole) || !message.member.roles.has(globals.adminRole) && user.roles.has(globals.modRole)) return globals.sendEmbed(botChannel, "**Permission denied**", globals.colors.red, "You cannot ban this user!", "Requested by: " + message.member.user.username); //Admins cannot be banned and mods cannot ban mods
            user.ban({days: "7", reason: reason})
            .then(() => {
                msg = new Discord.RichEmbed()
                .setTitle("**User banned**")
                .setColor(globals.colors.red)
                .setDescription("**" + user.user.username + "** was banned!\banned by: **" + message.member.user.username + "**\nReason: **" + reason + "**")
                .setFooter("Issued on: " + globals.timeConverter(message.createdTimestamp));
                infoChannel.send(msg);
            });
            break;
        }
    }
});

bot.on('guildMemberAdd', (member) => //Called when a user has joined the discord server
{
    globals.sendEmbed(infoChannel, "**A new user joined**", globals.colors.green, "**" + member.user.username + "** just joined the server!", "Joined on: " + globals.timeConverter(member.joinedTimestamp));
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

bot.on('guildMemberRemove', (member) => //Called when a user has left the discord server
{
    globals.sendEmbed(infoChannel, "**A user has left**", globals.colors.red, "**" + member.user.username + "** has left the server!", "Joined on: " + globals.timeConverter(member.joinedTimestamp));
});

bot.login(globals.botToken) //Connects the bot to the discord server
.catch((err) => 
{
    globals.sendError("The botToken is not correct!"); //Throw an error if the botToken is not correct
});