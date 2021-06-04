const discord = require('js-cord');
const { ButtonStyle } = require('js-cord/js-cord/enums');
const staticDataLoader = require('./utils/staticDataLoader.js');
const client = new discord.Client();
const staticData = staticDataLoader.loadStaticDataSync()


let ttt_boards =  {}
let playersDiscordIDs = {}
let turnPlayers = {};
let gameRunning = {}
let gameMessages = {};

client.on('ready', () => {
    console.log(`Logged in as ${client.user}`)
});

client.on('message', async (msg) => {
    if (msg.content === 'tttpls') {
        instanceRunning = true;
        try {
            let timestamp = Date.now();
            ttt_boards[timestamp] = [
                [ " " ," " ," " ],
                [ " " ," " ," " ],
                [ " " ," " ," " ],
            ]
            playersDiscordIDs[timestamp] = [ null, null ]
            turnPlayers[timestamp] = 0
            titles[timestamp] = "Click to join"
            gameRunning[timestamp] = true
            let comps = generateBoard( timestamp )
            gameMessages[timestamp] = await msg.channel.send('Click this button', { components: comps });
        } catch(err) {
            console.log(err)
        }
        
    }
});

let titles = { };

const HandleBoardClick = ( square, boardtimestamp, interaction ) => {
    try {
        let m = gameMessages[boardtimestamp]
        let ttt_board = ttt_boards[boardtimestamp]
        let turnPlayer = turnPlayers[boardtimestamp]
        let pDIDs = playersDiscordIDs[boardtimestamp]

        if ( !gameRunning[boardtimestamp] ) {
            deleteGame(boardtimestamp)
            return
        }

        if ( ttt_board[square.y][square.x] != ' ') {
            m.edit("**"+titles[boardtimestamp]+"**")
        } else {
            if ( pDIDs[turnPlayer] == interaction.author.id ) {
                ttt_board[square.y][square.x] = turnPlayer == 0 ? "X" : "O" 
                turnPlayers[boardtimestamp] = Number(!turnPlayer)
            }
            else if ( pDIDs[0] == null ) {
                pDIDs[0] = interaction.author.id;
                titles[boardtimestamp] =  "(X) "+ interaction.author.name + " vs. "
                turnPlayers[boardtimestamp] = Number(!turnPlayer)
            } 
            else if ( pDIDs[1] == null ) {
                pDIDs[1] = interaction.author.id;
                titles[boardtimestamp] += interaction.author.name  + " (O)"
                turnPlayers[boardtimestamp] = Number(!turnPlayer)
            }
            let ck = checkIfAnyoneWon( boardtimestamp )
            if ( ck != null ) {
                if ( ck == -1 ) titles[boardtimestamp] = "Draw"
                else titles[boardtimestamp] = (ck == 0 ? "X" : "O") + " won"
                gameRunning[boardtimestamp] = false
            }
            m.edit("**"+titles[boardtimestamp]+"**",{ components: generateBoard( boardtimestamp ) })
        }
    } catch(err) {
        // ignore :tf: :tf:
        console.log(err)
    }
    
}

const generateBoard = ( boardtimestamp ) => {
    let btnstyle = gameRunning[boardtimestamp] ? ButtonStyle.secondary : ButtonStyle.success
    return new discord.Components()
    .addRow([...ttt_boards[boardtimestamp][0].map( (e,i) => new discord.Button({ label: e, style: btnstyle }, async (interaction) => {
        HandleBoardClick( new Square(i, 0), boardtimestamp, interaction )
        await interaction.respond({ edit: true, defer: true });
    }))
    ])
    .addRow([...ttt_boards[boardtimestamp][1].map( (e,i) => new discord.Button({ label: e, style: btnstyle }, async (interaction) => {
        HandleBoardClick( new Square(i, 1), boardtimestamp, interaction )
        await interaction.respond({ edit: true, defer: true });
    }))
    ])
    .addRow([...ttt_boards[boardtimestamp][2].map( (e,i) => new discord.Button({ label: e, style: btnstyle }, async (interaction) => {
        HandleBoardClick( new Square(i, 2), boardtimestamp, interaction )
        await interaction.respond({ edit: true, defer: true });
    }))
])
}


const checkIfAnyoneWon = ( boardtimestamp ) => {


    let tb = ttt_boards[boardtimestamp]

    // 0 | 1 | 2
    // ---------
    // 3 | 4 | 5
    // ---------
    // 6 | 7 | 8

    let sb = [ tb[0][0],tb[0][1],tb[0][2],
                tb[1][0],tb[1][1],tb[1][2], 
                 tb[2][0],tb[2][1],tb[2][2],]

    const wQ = (a,b,c) => sb[a]+sb[b]+sb[c]

    let r1 = wQ(0,1,2)
    console.log(r1)
    let r2 = wQ(3,4,5)
    let r3 = wQ(6,7,8)

    let c1 = wQ(0,3,6)
    let c2 = wQ(1,4,7)
    let c3 = wQ(2,5,8)

    let d1 = wQ(0,4,8)
    let d2 = wQ(6,4,2)

    if      ( r1 == "OOO" ) return 1
    else if ( r1 == "XXX" ) return 0
    else if ( r2 == "OOO" ) return 1
    else if ( r2 == "XXX" ) return 0
    else if ( r3 == "OOO" ) return 1
    else if ( r3 == "XXX" ) return 0
    else if ( c1 == "OOO" ) return 1
    else if ( c1 == "XXX" ) return 0
    else if ( c2 == "OOO" ) return 1
    else if ( c2 == "XXX" ) return 0
    else if ( c3 == "OOO" ) return 1
    else if ( c3 == "XXX" ) return 0
    else if ( d1 == "OOO" ) return 1
    else if ( d1 == "XXX" ) return 0
    else if ( d2 == "OOO" ) return 1
    else if ( d2 == "XXX" ) return 0

    if ( !sb.includes(' ') ) return -1

    return null;
}

const deleteGame = async ( boardtimestamp ) => {
    gameMessages[boardtimestamp].delete()
    delete ttt_boards[boardtimestamp]
    delete turnPlayers[boardtimestamp]
    delete playersDiscordIDs[boardtimestamp]
    delete gameMessages[boardtimestamp]
}


class Square {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
}

client.login( staticData["TOKEN"] );