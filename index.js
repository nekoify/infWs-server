/*
test
 _____   _                                       
 |_   _| | |                                      
   | |   | | _____   _____   _ __ ___   ___ _ __  
   | |   | |/ _ \ \ / / _ \ | '_ ` _ \ / _ \ '_ \ 
  _| |_  | | (_) \ V /  __/ | | | | | |  __/ | | |
 |_____| |_|\___/ \_/ \___| |_| |_| |_|\___|_| |_|
                                                  
┌────────┐                                         ┌────────┐
│        │                                         │        │
│        ├                                         │        │
│        │                                         │        │
│        │  ◄──────────────────────────────────────┤        │ ◄───┐    ┌────────┐
│        │           send stuff           │        │     └────┤ Chunks │
│ Client │                                         │ Server │          └────────┘
│        │                                         │        │              ▲
│        │                                         │        │              │
│        │                                         │        │              │
│        │                Make Action              │        │              │
│        ├───────────────────────────────────────► │        ├──────────────┘
│        │                                         │        │
└────────┘                                         └────────┘




*/

const SERVER_UPDATES_PER_SECOND = 16
const CHAINBREAKING_LIMIT = 10
const RESET_ON_BOMB = false

const TILE_CLEAR_REWARD = 1
const TRIGGER_MINE_REWARD = -25

const LOOT_BOX_FREQ = 125 // boxes per tiles

var shopData = {
    flags:{
        1:{
            bought:true,
            name:"Defualt",
            rarity:"common",
            cost:0,
            src:"flag.png",
        },
        2:{
            name:"Purple",
            rarity:"common",
            cost:35,
            src:"./flags/purp.png",
        },
        3:{
            name:"Orange",
            rarity:"common",
            cost:35,
            src:"./flags/orange.png",
        },
        4:{
            name:"Chad",
            rarity:"common",
            cost:50,
            src:"./flags/flagChag.png",
        },
        5:{
            name:"Netherlands",
            rarity:"common",
            cost:50,
            src:"./flags/flagNetherlands.png",
        },
        6:{
            name:"Hick's Hexagons",
            rarity:"common",
            cost:60,
            src:"./flags/flagHicks.png",
        },
        7:{
            name:"Nerd",
            rarity:"common",
            cost:80,
            src:"./flags/flagNerd.png",
        },
        8:{
            name:"Garlic",
            rarity:"common",
            cost:100,
            src:"./flags/flagGarlic.png",
        },
        9:{
            name:"RainWorld",
            rarity:"common",
            cost:100,
            src:"./flags/flagRain.png",
        },
        10:{
            name:"Coc",
            rarity:"rare",
            cost:250,
            src:"./flags/flagCoc.png",
        },
        11:{
            name:"Men",
            rarity:"rare",
            cost:250,
            src:"./flags/flagMen.png",
        },
        12:{
            name:"Bleh Cat 1",
            rarity:"rare",
            cost:1000,
            src:"./flags/flagBleh.png",
        },
        13:{
            name:"Bleh Cat 2",
            rarity:"rare",
            cost:1000,
            src:"./flags/flagBleh1.png",
        },
        14:{
            name:"Bleh Cat 3",
            rarity:"rare",
            cost:1000,
            src:"./flags/flagBleh1.png",
        },

    }
}

var exec = require('child_process').exec;
require('dotenv').config()
const process = require("process")
const express = require('express');
//const puppeteer = require('puppeteer');
const app = express();
const os = require('os')
const http = require('http');
const fetch = require("cross-fetch")
const server = http.createServer(app);
const fs = require("fs")
var accountData = require(`${__dirname}/account.json`)
const chunkData = require(`${__dirname}/chunks.json`)
const { Client, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });





function clamp(num, min, max) {
    if (num > max) {
        num = max
    } else if (num < min) {
        num = min
    }
    return num
}

function v(x=0,y=0) {
    return {x:x,y:y}
}


function randInt(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
}


function getDst(x, y) {
    let xd = (x.x - y.x)
    let yd = (x.y - y.y)
    return Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2))
}








function chunkArray2d(e, t, n = {}, r = v(1, 1), c) {
    let a = new Array(e);
    for (let e = 0; e < a.length; e++) {
        a[e] = new Array(t);
        for (let t = 0; t < a[e].length; t++)
            a[e][t] = new cChunk(v(e * r.x, t * r.y), c);
    }
    return { array: a, data: n };
}
function tileArray2d(e, t, n, r, c) {

    let a = new Array(e);
    for (let e = 0; e < a.length; e++) {
        a[e] = new Array(t);
        for (let t = 0; t < a[e].length; t++)
            a[e][t] = new cTile(
                n * 1 + e * (1 / c.options.rows),
                r * 1 + t * (1 / c.options.columns)
            );
    }
    return a;
}


function cTile(e, t) {
    this.pos = v(e, t)
    var dst = getDst(v(0,0),v(e,t))*0.5,
        num = Math.abs(Math.sin(dst))*0.075
    this.mine = Math.random()<((0.1+num))*0.8
    this.uncovered = false
    this.flagged = false
    this.lootBox = this.mine?false:Math.random()<(1/LOOT_BOX_FREQ)
    this.flaggedBy = null
}
function cChunk(e, t) {

    (this.mobiles = new Array()),
        (this.furnitureMobiles = new Array()),
        (this.grid = tileArray2d(t.options.rows, t.options.columns, e.x, e.y, t)),
        (this.pos = e);
}
;
let startingSize = 5;

class Chunks {
    constructor(options) {
        this.options = {
            rows: 5,
            columns: 5,
            width: 10,
            height: 10,
            xSet: randInt(-1e6, 1e6),
            ySet: randInt(-1e6, 1e6),
            ...options,
        }

        this.chunkMaps = {
            x1y1array: chunkArray2d(startingSize, startingSize, "x1y1", v(1, 1), this),
            x0y1array: chunkArray2d(startingSize, startingSize, "x0y1", v(-1, 1), this),
            x1y0array: chunkArray2d(startingSize, startingSize, "x1y0", v(1, -1), this),
            x0y0array: chunkArray2d(startingSize, startingSize, "x0y0", v(-1, -1), this),
        }
    }
    requestChunk(e, t) {
        let n = e < 0 ? (t < 0 ? "x0y0" : "x0y1") : t < 0 ? "x1y0" : "x1y1",
            r = this.chunkMaps[n + "array"].array;
        let a = e < 0 ? -1 * e : e,
            l = t < 0 ? -1 * t : t;
        return (
            r.length - 1 < a &&
            ((r[a] = new Array()), (r[a][l] = new cChunk(v(e, t), this))),
            null == r[a] && (r[a] = new Array()),
            r[a].length - 1 < l && (r[a][l] = new cChunk(v(e, t), this)),
            null == r[a][l] && (r[a][l] = new cChunk(v(e, t), this)),
            r[a][l]
        );
    }
    requestTile(e, t) {
        let n = v(Math.floor(e / this.options.rows), Math.floor(t / this.options.columns)),
            tileP = v(e - n.x * this.options.rows, t - n.y * this.options.columns)
        return (
            
            this.requestChunk(n.x, n.y).grid[tileP.x][tileP.y]
        );
    }
    requestChunks(e, t, n, r) {
        let a = new Array();
        for (let l = n; l > 0; l--)
            for (let n = 0; n < r; n++) {a.push(this.requestChunk(l + e, n + t));}
        return a;
    }
    getMobiles(e) {
        let t = new Array(),
            n = new Array();
        for (let r = 0; r < e.length; r++) {
            const a = e[r];
            for (let e = 0; e < a.mobiles.length; e++) {
                const n = a.mobiles[e];
                t.push(n);
            }
            for (let e = 0; e < a.furnitureMobiles.length; e++) {
                const t = a.furnitureMobiles[e];
                n.push(t);
            }
        }
        return { mobs: t, furnitureMobs: n };
    }
    removeMob(e, t, n) {
        let r = this.requestChunk(e, t);
        for (let e = 0; e < r.mobiles.length; e++) {
            if (r.mobiles[e].id == n) {
                r.mobiles.splice(e, 1);
                break;
            }
        }
    }
    insertMob(e, t, n) {
        let r = this.requestChunk(e, t);
        return this.removeMob(e, t, n.id), r.mobiles.push(n), n;
    }
};


mainChunks = new Chunks()
chunkData["chunks"] = mainChunks.chunkMaps
fs.writeFileSync(`${__dirname}/chunks.json`, JSON.stringify(chunkData));

function acknowledgeAccount(id, name) {
    accountData[id] = accountData[id]||({
        name:name.substring(0, 5),
        score:0,
        coins:0,
        stats:{
            tilesCleared:0,
            minesFlagged:0,
            minesTriggered:0,
        },
        ownData:{
            1:true,
        },
        selectedFlag:1,
    });
    accountData[id].owns = accountData[id].owns||{1:true}
    accountData[id].selectedFlag = accountData[id].selectedFlag||1
    accountData[id].name = name
    fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
}
function modifyScore(id, score, type) {
    console.log(id, score, type)
    accountData[id] = accountData[id]||({
        name:"unamed",
        score:0,
        coins:0,
        stats:{
            tilesCleared:0,
            minesFlagged:0,
            minesTriggered:0,
        },
        ownData:{
            1:true,
        },
        selectedFlag:1,
    });
    if (type == "bomb") {
        console.log("bomb")
        console.log(accountData[id].coins+score)
        accountData[id].score = clamp(accountData[id].score+score,0, Infinity)
        fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
    } else {
        console.log("no bomb")
        console.log(accountData[id].coins+score)
        accountData[id].score = clamp(accountData[id].score+score,0, Infinity)
        accountData[id].coins = clamp(accountData[id].coins+score,0, Infinity)
        fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
    }
    
}
function updateStats(id, statsMod) {
    statsMod = {
        tilesCleared:0,
        minesFlagged:0,
        minesTriggered:0,
        ...statsMod,
    }
    let statsAccount = accountData[id]||({
        name:"unamed",
        score:0,
        coins:0,
        stats:{
            tilesCleared:0,
            minesFlagged:0,
            minesTriggered:0,
        },
        ownData:{
            1:true,
        },
        selectedFlag:1,
    });
    if (statsAccount.stats == undefined) {
        statsAccount.stats = {
            tilesCleared:0,
            minesFlagged:0,
            minesTriggered:0,
        }
    }

    //S

    statsAccount.stats.tilesCleared += statsMod.tilesCleared
    statsAccount.stats.minesFlagged += statsMod.minesFlagged
    statsAccount.stats.minesTriggered += statsMod.minesTriggered
}

function getLeaderboard() {
/*
    //=========placeholder==========
    let accountData = {
        "43":{name:"yya1",score:43},
        "4sd3":{name:"yippee",score:43},
        "4fd3":{name:"ysfv1",score:2},
        "423":{name:"yfds",score:7},
        "3":{name:"ywd1",score:69},
        "44333":{name:"yya21",score:420},
    }
    //=============================
*/
    let players = ((Object.keys(accountData)).map((e)=>{return accountData[e]})).filter(a=>{return a.score>2})
    return players.sort((a,b)=>{return -Math.sign(a.score-b.score)})

    
}

function getChunkStats() {
    let chunks = mainChunks.chunkMaps
    let stats = {
        tilesUncovered:0,
        flags:0,
        minesTriggered:0
    }
    function runQuad(quad) {
        let tiles = new Array()
        for (let x = 0; x < quad.length; x++) {
            if (quad[x]!=undefined){
                for (let y = 0; y < quad[x].length; y++) {
                    if (quad[x][y] != undefined) {
                           if (quad[x][y]!=undefined) {
                            let grid = quad[x][y].grid
                               for (let x2 = 0; x2 < grid.length; x2++) {
                                   if (grid[x2]!=undefined){
                                    for (let y2 = 0; y2 < grid[x2].length; y2++) {
                                        if (grid[x2][y2]!=undefined) {
                                            let tile = grid[x2][y2]
                                            if (tile.uncovered) stats.tilesUncovered++
                                            if (tile.flagged && !tile.uncovered) stats.flags++
                                            if (tile.mine && tile.uncovered) stats.minesTriggered++
                                        }
                                    }
                                   }
                               }
                           }
                    }
                }
            }
        }
        return tiles
    }
    runQuad(chunks.x0y0array.array)
    runQuad(chunks.x1y0array.array)
    runQuad(chunks.x0y1array.array)
    runQuad(chunks.x1y1array.array)
    return stats
}

function buy(id, cost) {
    console.log("func")
    console.log(accountData[id].coins>=cost)
    console.log(accountData[id].coins, cost)
    if (accountData[id].coins>=cost) {
        let costCalc = accountData[id].coins -= cost
        console.log(costCalc)
        accountData[id].coins = costCalc
        fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
        return costCalc

    } else return false
}

function receveLootBox(item, id) {
    var flags = getAvalibleFlags(accountData[id].owns)
    if (item.id == "coins") {
        accountData[id].coins += 30
        return "30 coins"
    } else {
        var newFlag = pickRandomFlag(
            (item.id=="commonFlag")?flags.common:flags.rare
        )
        console.log(`id ${id} now owns ${newFlag}`)
        accountData[id].owns[newFlag] = true
        fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));

        return shopData.flags[newFlag]
    }
    
}
function getAvalibleFlags(owns) {
    var commonFlags = [1,2,3,4,5,6,7,8,9,10],
        rareFlags = [11,12,13,14,15,16]

    for (let i = 0; i < commonFlags.length; i++) {
        const cF = commonFlags[i];
        if (owns[cF]) {
            commonFlags.splice(i, 1)
            i--
        }
    }
    for (let i = 0; i < rareFlags.length; i++) {
        const cF = rareFlags[i];
        if (owns[cF]) {
            rareFlags.splice(i, 1)
        }
    }

    return {
        common:commonFlags,
        rare:rareFlags
    }
}

function pickRandomFlag(flags) {
    return flags[randInt(0,flags.length-1)]
}



var mainChunks = new Chunks(),
    updateTicker = 1000,
    previouseDelta = (new Date()).getTime()


function inputClick(data, user, tick=CHAINBREAKING_LIMIT) {
    user = {
        id:data.id,
        name:data.name,
    }

    function s(s, type) {modifyScore(user.id, s, type)}

    acknowledgeAccount(user.id, user.name)

    var isLootBox = false
    

    let tile = mainChunks.requestTile(data.pos.x,data.pos.y),
        count = countNeighbours(v(data.pos.x,data.pos.y))

        if (tile.lootBox&&count<=0) {
            tile.lootBox = false
        }
        if (tile.lootBox&&tile.uncovered) {
            isLootBox = true
            tile.lootBox = false
            
        }

        if (!tile.uncovered) {
            if (data.flag) {
                if (tile.flaggedById==data.id){
                    
                    tile.flagged = !tile.flagged
                    if (tile.flaggedBy != data.name) {
                        updateStats(user.id, {
                            minesFlagged:1,
                        })
                    }
                    tile.flaggedBy = data.name
                    tile.flaggedById = data.id
                    
                } else {
                    let neightbours = getNeighbours(v(data.pos.x,data.pos.y)),
                        notAllSearched = false
                    for (let i = 0; i < neightbours.length; i++) {
                        const ni = neightbours[i];
                        if (!((ni.uncovered&&!ni.mine)||(ni.flagged))) {
                            notAllSearched = true
                        }
                    }

                    tileHasBeenCleared = !notAllSearched

                    
                    if (!tileHasBeenCleared) {
                        tile.flagged = !tile.flagged
                        if (tile.flaggedBy != data.name) {
                            updateStats(user.id, {
                                minesFlagged:1,
                            })
                        }
                        tile.flaggedBy = data.name
                        tile.flaggedById = data.id
                    }
                }
                
                
            } else if (!tile.flagged) {
                updateStats(user.id, {
                    tilesCleared:1,
                })
                tile.uncovered = true
                tile.count = count
                if (tile.count>0 && tick==CHAINBREAKING_LIMIT) {
                    s(TILE_CLEAR_REWARD, "notbomb")
                }
                if (tile.mine && RESET_ON_BOMB) {
                    mainChunks = new Chunks()
                    return
                }
                if (tile.mine) {
                    
                    s(TRIGGER_MINE_REWARD, "bomb")
                    updateStats(user.id, {
                        minesTriggered:1,
                    })
                    if (accountData[user.id].score>0) io.sockets.emit("recChat", {"user":"SERVER","msg":`User ${(user.name).substring(0, 5)} hit a mine!`})
                    
                }
                
                if (tile.count==0&&!tile.mine) {
                    let neis = getNeighbours(v(data.pos.x,data.pos.y))
                    for (let i = 0; i < neis.length; i++) {
                        const nei = neis[i];
                        let neiTile = mainChunks.requestTile(nei.x, nei.y)
                        
                        if (!neiTile.uncovered && tick>0) {
                            inputClick({
                                pos:nei,
                                flag:false,
                            }, undefined, tick-1)
        
                           
                        }
                    }
                }
          }
            
        } else {
            tile.flagged = false
        }

    
    updateTicker = 2000
    return isLootBox
} 
function getNeighbours(tilePos) {
    
    let neighbours = [
        v(1,1),v(0,1),v(-1,1),
        v(1,0),v(-1,0),
        v(1,-1),v(0,-1),v(-1,-1),
    ]
    for (let i = 0; i < neighbours.length; i++) {
        const nei = neighbours[i];
        let pos = v(
            tilePos.x+nei.x,
            tilePos.y+nei.y
        )
        neighbours[i] = pos
    }
    return neighbours
}
function countNeighbours(tilePos) {
    let tile = mainChunks.requestTile(tilePos.x,tilePos.y),
        neighbours = [
            v(1,1),v(0,1),v(-1,1),
            v(1,0),v(-1,0),
            v(1,-1),v(0,-1),v(-1,-1),
        ]
        let count = 0
    for (let i = 0; i < neighbours.length; i++) {
        const nei = neighbours[i];
        let pos = v(
            tilePos.x+nei.x,
            tilePos.y+nei.y
        )
        neighbours[i] = mainChunks.requestTile(pos.x,pos.y)
        count += neighbours[i].mine?1:0
    }
    return count

}
function output() {
    return JSON.stringify({
        chunks:mainChunks,
        leaderboard:accountData,
    })
}


function openLootbox() {
    var things = {
        coins:{
            name:"some coins",
            id:"coins",
            weight:0.65
        },
        commonflag:{
            name:"a common flag",
            id:"commonflag",
            weight:0.3
        },
        rareflag:{
            name:"a rare flag",
            id:"rareflag",
            weight:0.075
        },
    },
    total = 0
    Object.keys(things).forEach(function(key, index) {total+=things[key].weight});
    Object.keys(things).forEach(function(key, index) {
        things[key].weight /= total;
      });
    var rand = Math.random(),
      items = Object.keys(things),
        choice = "",
        value = 0
    items.forEach((key, index)=>{
        var lowerBounds = value,
            upperBounds = value+(things[key].weight)

        if (rand>lowerBounds&&rand<upperBounds) {
            choice = things[key]
        }
        value+=(things[key].weight)

    })
    return choice
}

const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});


app.get('/', (req, res) => {
    res.send('server');
});



io.on('connection', async(socket) => {
    updateTicker = 2000
    socket.on("account", (data) => {
        console.log(data)
      })
    moveQue=true

      
    socket.on('makeClick', (data) => {
        data = JSON.parse(data)
        var lootBox = inputClick(data)
        if (lootBox) {
            var item = receveLootBox(openLootbox(), data.id)
            
            socket.emit("openedLootbox", JSON.stringify({
                item:item,
            }))
        }
        moveQue = true
    });
    socket.on('setFlagselection', (data) => {
        data = JSON.parse(data)
        if (accountData[data.id]!=undefined) {
            accountData[data.id].selectedFlag = accountData[data.id].selectedFlag||1
         if(accountData[data.id].owns[data.selection]) {
            accountData[data.id].selectedFlag = data.selection
            }
        }


    });

    socket.on('sendChat', (data) => {
        io.sockets.emit("recChat", data)
    })










    socket.on('buyFlag', (data) => {
        console.log("event got")
        data = JSON.parse(data)
        if (accountData[data.id]) {
            console.log("yep")
            var flagChoice = data.buySelection
	    console.log(flagChoice)
	    console.log(shopData.flags[flagChoice])
            if (buy(data.id, shopData.flags[flagChoice].cost)){
                accountData[data.id].owns[flagChoice] = true
                fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
            }

        } else {
            throw console.error("account id not found uwu")
        }
        

    });
    socket.on('requestingChunks', (data) => {
        data = JSON.parse(data)
        viewport = data.viewport
        if (viewport!=undefined) {
            socket.emit("returningChunks", JSON.stringify({
                chunks:mainChunks.requestChunks(viewport.x, viewport.y, viewport.width, viewport.height),
                leaderboard:accountData
            }))
        }


    });

})

function updateClients() {
   io.sockets.emit("serverChange")
}


var moveQue = false

setInterval(() => {
    var time = ((new Date()).getTime())
    updateTicker -= time-previouseDelta
    previouseDelta = time

    if (moveQue) {
	console.log("hi?")
        updateClients()
        moveQue = false
    }
   
    
}, 1000/SERVER_UPDATES_PER_SECOND);



server.listen(process.env.PORT || 8085, () => {
    console.log('listxwening on *:8085');
    mainChunks.chunkMaps = chunkData["chunks"]
})

setInterval(() =>{
    chunkData["chunks"] = mainChunks.chunkMaps
    fs.writeFileSync(`${__dirname}/chunks.json`, JSON.stringify(chunkData));
    fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
},30000)
/*
client.on("ready", ()=>{
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activities: [{ name: 'https://aeolus-1.github.io/infinateMuliMinesweeper/', }], status: 'available' });
})
/*
client.on("messageCreate", (message) => {
    if (message.content == "!stats") {
        console.log("trying")
        try {
            var stats = getChunkStats()
        } catch (error) {
            message.channel.send("error getting stats (maybe empty chunks)")
        }
        message.channel.send(`${stats.tilesUncovered} blocks uncovered, ${stats.flags} flags placed, ${stats.minesTriggered} mines triggered`)
    }
})
client.on("messageCreate", (message) => {
    var string = message.content
    string = string.split(" ")
    if (string[0] == "!stats" && string.length==2) {
        var names = {},
            ids = Object.keys(accountData)
        for (let i = 0; i < ids.length; i++) {
            const account = accountData[ids[i]]
            names[account.name] = ids[i]
        }
        
        if (names[string[1]]==undefined) {
            message.channel.send(`Failed to fetch stats for ${string[1]}. User doesn't exist`)
        } else {
            var id = names[string[1]]
            updateStats(id)
            var stats = accountData[id].stats
            let successPer = (100 - ((stats.minesTriggered / stats.tilesCleared) * 100)).toFixed(2)
            message.channel.send(`__Stats for ${string[1]}__\n🪙 Coins: ${accountData[id].coins}\nTile Cleared: ${stats.tilesCleared}\nMines Flagged: ${stats.minesFlagged}\nMines Triggered: ${stats.minesTriggered}\nSuccess Percentage: ${successPer}%\n`)
        }
        
    
    } else if (string.length==1 && string[0]=="!stats") {
        try {
            var first = Date.now()
            var stats = getChunkStats()
        } catch (error) {
            message.channel.send("error getting stats (maybe empty chunks)")
        }
        var timeTaken = Date.now() - first
        message.channel.send(`__Global Stats__\n${stats.tilesUncovered} blocks uncovered, ${stats.flags} flags placed, ${stats.minesTriggered} mines triggered \n Time taken: ${timeTaken}ms`)

    }


         //updateStats
    
})
client.on("messageCreate", (message) => {
    if (message.content == "!ping") {
        
    message.channel.send("pong")
    
    }
})
client.on("messageCreate", (message) => {
    if (message.content == "!leaderboard") {
        message.channel.send("getting leaderboard")

        var board = getLeaderboard(),
            text = ""

        for (let i = 0; i < board.length; i++) {
            const user = board[i];
            text = text+`\n> ${i+1}. ${user.name} (${user.score})`
        }
    message.channel.send(text)
    
    }
})
client.on("messageCreate", (message) => {
    if (message.content == "!help") {
        message.channel.send(`(https://aeolus-1.github.io/infinateMuliMinesweeper/)\nAvalible Commnads are:\n!link\n!help\n!ping\n!leaderboard\n!stats {username (or leave it blank for global stats)}\n!board`)
    
    }
})
client.on("messageCreate", (message) => {
    if (message.content == "!link") {
        message.channel.send(`go to https://aeolus-1.github.io/infinateMuliMinesweeper/`)
    
    } else if (message.content == "!mem") {
let osFreeMem = os.freemem()
let allFreeMem = (osFreeMem / (1024 * 1024))
let osTotalMem = os.totalmem()
let avbMem = (osTotalMem / (1024 * 1024))
message.channel.send(`Total free memory: ${allFreeMem}\nTotal available RAM: ${avbMem}`)
    }
})
client.on("messageCreate", (message) => {
    var string = message.content
    string = string.split(" ")
    if (string[0] == "!score") {
        if (message.author.id == "640147303939964930" || message.author.id == "416508744097071107") {
        var names = {},
            ids = Object.keys(accountData)
        for (let i = 0; i < ids.length; i++) {
            const account = accountData[ids[i]]
            names[account.name] = ids[i]
        }
        
        if (names[string[1]]==undefined) {
            message.channel.send(`Failed to set ${string[1]}'s score. Doesn't exist`)
        } else {
            var id = names[string[1]]
            accountData[id].score = parseInt(string[2])
            message.channel.send(`Set score of ${string[1]} to ${string[2]}`)
        }
        
        }
    }
})
client.on("messageCreate", (message) => {
    var string = message.content
    string = string.split(" ")
    if (string[0] == "!coins") {
        if (message.author.id == "640147303939964930" || message.author.id == "416508744097071107") {
        var names = {},
            ids = Object.keys(accountData)
        for (let i = 0; i < ids.length; i++) {
            const account = accountData[ids[i]]
            names[account.name] = ids[i]
        }
        
        if (names[string[1]]==undefined) {
            message.channel.send(`Failed to set ${string[1]}'s coins. Doesn't exist`)
        } else {
            var id = names[string[1]]
            accountData[id].coins = parseInt(string[2])
            message.channel.send(`Set coins of ${string[1]} to ${string[2]}`)
        }
        
        }
    }
})
client.on("messageCreate", (message) => {
    var string = message.content
    string = string.split(" ")
    if (string[0] == "!deleteUser") {
        if (message.author.id == "640147303939964930" || message.author.id == "416508744097071107") {
        var names = {},
            ids = Object.keys(accountData)
        for (let i = 0; i < ids.length; i++) {
            const account = accountData[ids[i]]
            names[account.name] = ids[i]
        }
        
        if (names[string[1]]==undefined) {
            message.channel.send(`Failed to delete ${string[1]}. Doesn't exist`)
        } else {
            var id = names[string[1]]
            delete accountData[id]
            message.channel.send(`Deleted ${string[1]}`)
        }
        
        }
    }
})


client.on("messageCreate", (message) => {
    if (message.content == "!resetBoard") {
        if (message.author.id == "640147303939964930" || message.author.id == "416508744097071107") {
        mainChunks = new Chunks()
        chunkData["chunks"] = mainChunks.chunkMaps
    message.channel.send("done, restarting server...")
    fs.writeFileSync(`${__dirname}/chunks.json`, JSON.stringify(chunkData));
    exec("pm2 restart 8")
        }
    }
})

client.on("messageCreate", async (message) => {
    message.content = message.content.split(" ")
    if (message.content[0] == "!board") {
        
        var zoomAmount = message.content[1]

        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        });
        // Create a new page
        const page = await browser.newPage();
      
        // Set viewport width and height
        await page.setViewport({ width: 1280, height: 720 });
      
        const website_url = 'https://aeolus-1.github.io/infinateMuliMinesweeper/';
      
        // Open URL in current page
        await page.goto(website_url, { waitUntil: 'networkidle2' });
        console.log(zoomAmount)
        for (let i = 0; i < Number(zoomAmount); i++) {
            await page.keyboard.press('NumpadSubtract');
            console.log("zooming")
          }
        

        // Capture screenshot
        await page.screenshot({
          path: 'screenshot.jpg',
        });
        await browser.close();
        message.channel.send({ files: [{ attachment: 'screenshot.jpg' }] });
    }
})

client.on("messageCreate", (message) => {
    if (message.content == "!resetDb") {
        if (message.author.id == "640147303939964930" || message.author.id == "416508744097071107") {
        if (message.content.includes('!eval')) {
      var code = message.content.split("!eval ")[1]
      try {
        eval(code)
      } catch (err) {
        message.channel.send(String(err))
      }
    }
        accountData = {}
    message.channel.send("done, restarting server...")
    fs.writeFileSync(`${__dirname}/account.json`, JSON.stringify(accountData));
    exec("pm2 restart 8")
        }
    } else {
        if (message.content.includes('!eval')) {
            if (message.author.id == "640147303939964930" || message.author.id == "416508744097071107") {
            var code = message.content.split("!eval ")[1]
            try {
              eval(code)
            } catch (err) {
              message.channel.send(String(err))
            }
          }
    }
}
})




client.login(process.env.TOKEN)
*/
