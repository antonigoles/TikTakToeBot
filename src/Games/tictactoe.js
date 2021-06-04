const { ButtonStyle } = require('js-cord/js-cord/enums');
const discord = require('js-cord');

module.exports = {
    ttt_boards: {},
    playersDiscordIDs: {},
    turnPlayers: {},
    gameRunning:{},
    gameMessages: {},
    titles: { },

    initGame: async ( msg ) => {
        try {
            let timestamp = Date.now();
            module.exports.ttt_boards[timestamp] = [
                [ " " ," " ," " ],
                [ " " ," " ," " ],
                [ " " ," " ," " ],
            ]
            module.exports.playersDiscordIDs[timestamp] = [ null, null ]
            module.exports.turnPlayers[timestamp] = 0
            module.exports.titles[timestamp] = "Click to join"
            module.exports.gameRunning[timestamp] = true
            let comps = module.exports.generateBoard( timestamp )
            module.exports.gameMessages[timestamp] = await msg.channel.send(module.exports.renderTitleEmbed( timestamp ), { components: comps });
        } catch(err) {
            console.log(err)
        }
    },



    HandleBoardClick: ( square, boardtimestamp, interaction ) => {
        try {
            let m = module.exports.gameMessages[boardtimestamp]
            let ttt_board = module.exports.ttt_boards[boardtimestamp]
            let turnPlayer = module.exports.turnPlayers[boardtimestamp]
            let pDIDs = module.exports.playersDiscordIDs[boardtimestamp]

            if ( !module.exports.gameRunning[boardtimestamp] ) {
                module.exports.deleteGame(boardtimestamp)
                return
            }

            if ( ttt_board[square.y][square.x] != ' ') {
                m.edit(module.exports.renderTitleEmbed(boardtimestamp))
            } else {
                if ( pDIDs[turnPlayer] == interaction.author.id ) {
                    ttt_board[square.y][square.x] = turnPlayer == 0 ? "X" : "O" 
                    module.exports.turnPlayers[boardtimestamp] = Number(!turnPlayer)
                }
                else if ( pDIDs[0] == null ) {
                    pDIDs[0] = interaction.author.id;
                    module.exports.titles[boardtimestamp] =  "(X) "+ interaction.author.name + " vs. "
                    module.exports.turnPlayers[boardtimestamp] = Number(!turnPlayer)
                } 
                else if ( pDIDs[1] == null ) {
                    pDIDs[1] = interaction.author.id;
                    module.exports.titles[boardtimestamp] += interaction.author.name  + " (O)"
                    module.exports.turnPlayers[boardtimestamp] = Number(!turnPlayer)
                }
                let ck = module.exports.checkIfAnyoneWon( boardtimestamp )
                if ( ck != null ) {
                    if ( ck == -1 ) module.exports.titles[boardtimestamp] = "Draw"
                    else module.exports.titles[boardtimestamp] = (ck == 0 ? "X" : "O") + " won"
                    module.exports.gameRunning[boardtimestamp] = false
                }
                m.edit(module.exports.renderTitleEmbed(boardtimestamp),{ components: module.exports.generateBoard( boardtimestamp ) })
            }
        } catch(err) {
            // ignore :tf: :tf:
            console.log(err)
        }  
    },

    renderTitleEmbed: ( boardtimestamp ) => {
        return `**${module.exports.titles[boardtimestamp]}**`
    },


    generateBoard: ( boardtimestamp ) => {
        let btnstyle = module.exports.gameRunning[boardtimestamp] ? ButtonStyle.secondary : ButtonStyle.success
        return new discord.Components()
            .addRow([...module.exports.ttt_boards[boardtimestamp][0].map( (e,i) => new discord.Button({ label: e, style: btnstyle }, async (interaction) => {
                module.exports.HandleBoardClick( new module.exports.Square(i, 0), boardtimestamp, interaction )
                await interaction.respond({ edit: true, defer: true });
            }))
            ])

            .addRow([...module.exports.ttt_boards[boardtimestamp][1].map( (e,i) => new discord.Button({ label: e, style: btnstyle }, async (interaction) => {
                module.exports.HandleBoardClick( new module.exports.Square(i, 1), boardtimestamp, interaction )
                await interaction.respond({ edit: true, defer: true });
            }))
            ])

            .addRow([...module.exports.ttt_boards[boardtimestamp][2].map( (e,i) => new discord.Button({ label: e, style: btnstyle }, async (interaction) => {
                module.exports.HandleBoardClick( new module.exports.Square(i, 2), boardtimestamp, interaction )
                await interaction.respond({ edit: true, defer: true });
            }))
    ])
    },


    checkIfAnyoneWon: ( boardtimestamp ) => {
        let tb = module.exports.ttt_boards[boardtimestamp]

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
    },

    deleteGame: async ( boardtimestamp ) => {
        module.exports.gameMessages[boardtimestamp].delete()
        delete module.exports.ttt_boards[boardtimestamp]
        delete module.exports.turnPlayers[boardtimestamp]
        delete module.exports.playersDiscordIDs[boardtimestamp]
        delete module.exports.gameMessages[boardtimestamp]
    },


    Square: class {
        constructor(x,y) {
            this.x = x
            this.y = y
        }
    }
}