const discord = require('js-cord');
const { ButtonStyle } = require('js-cord/js-cord/enums');
const staticDataLoader = require('./utils/staticDataLoader.js');
const client = new discord.Client();
const staticData = staticDataLoader.loadStaticDataSync()

const Games = {
    tictactoe: require('./Games/tictactoe')
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user}`)
});

client.on('message', async (msg) => {
    if (msg.content === 'tttpls') {
        try {
            Games.tictactoe.initGame(msg)
        } catch(err) {
            console.log(err)
        }  
    }
});





client.login( staticData["TOKEN"] );