const Discord = require('discord.js');
const bot = new Discord.Client();
const ytdl = require("ytdl-core");


let musicConn;
let musicChannel;
let musicDispatcher;
let queue = [];
let npUrl = "";

function playNextSong() {

    let nextUrl = queue[0];

    musicDispatcher = musicConn.play(ytdl(nextUrl, {filter: "audioonly", quality: "highestaudio"}));

    queue.shift();

    npUrl = nextUrl;

    musicChannel.send("Nun wird gespielt : \`\`" + nextUrl + "\`\`");

    musicDispatcher.on("speaking", (speaking) => {

        if(!speaking) {

            if(queue.length === 0){
                musicChannel.send("Musik ist zuende");
                musicConn.disconnect();
                musicConn = null;
            } else {
                playNextSong();
            }

        }
    });

}

var version = '1.3'

const PREFIX = '_'

bot.on('ready', () =>{
    console.log('Bot ist an!')
});

bot.on('message', msg=>{

    let args = msg.content.substring(PREFIX.length).split(" ");
    let channel = msg.channel;

    switch(args[0].toUpperCase()){
        case "PLAY": {
                let url = args[1];
                if(!url) {
                    return channel.send("Ups.. da fehlt wohl eine URL ^^");
                }

                let voiceChannel = msg.member.voice.channel;
                if(!voiceChannel) {
                    return channel.send("Du musst in einem Sprachkanal sein!");
                }

                if(musicConn && musicConn.channel.id !== voiceChannel.id) {
                    return channel.send("Es wird bereits Musik in einem anderen Kanal gespielt!");
                }

                queue.push(url);

                channel.send("``" + url + "`` wurde zur Warteschlange hinzugefügt!:white_check_mark:");


                if(!musicConn) {
                    voiceChannel.join().then((conn) => {
                        musicConn = conn;
                        musicChannel = channel;
                        playNextSong();
                    });
                }
                
                break;
            }

            case "STOP": {
                if(!musicConn) {
                    return channel.send("Musik wird gestoppt!");
                }

                musicConn.disconnect();
                musicConn = null;
                queue = [];

                break;
            }

            case "QUEUE": {
                if(!musicConn) {
                    return channel.send("Musik wird gestoppt!");
                }

                if(queue.length === 0) {
                    return channel.send("Die Queue ist leer!")
                }

                let message = "__**QUEUE**__\n";

                for(let i = 0; i < queue.length; i++) {
                    let url = queue[i];
                    message += `**${(i + 1).toString()})** \`\`${url}\`\`\n`;
                }

                channel.send(message);
                break;
            }

            case "NP": {
                if(!musicConn) {
                    return channel.send("Musik wird gestoppt!");
                }

                channel.send("gerade läuft: \`\`" + npUrl + "\`\`");
                break;
            }

            case "SKIP": {
                if(!musicConn) {
                    return channel.send("Musik wird gestoppt!");
            }

            musicDispatcher.end();
            musicDispatcher = null;

            channel.send("Der Song wurde übersprungen!");

                break;
        }   }
    });

    bot.login(process.env.token);