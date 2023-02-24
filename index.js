/*

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
│        │           Spam all clients              │        │     └────┤ Chunks │
│ Client │                                         │ Server │          └────────┘
│        │                                         │        │              ▲
│        │                                         │        │              │
│        │                                         │        │              │
│        │                Make Action              │        │              │
│        ├───────────────────────────────────────► │        ├──────────────┘
│        │                                         │        │
└────────┘                                         └────────┘




*/

const atatus = require("atatus-nodejs");
atatus.start({
    licenseKey: "lic_apm_c7ead171c6d14a509f211d91de05fadb",
    appName: "infms",
});

const SERVER_UPDATES_PER_SECOND = 20
const CHAINBREAKING_LIMIT = 10
const RESET_ON_BOMB = false

const TILE_CLEAR_REWARD = 1
const TRIGGER_MINE_REWARD = -25

var exec = require('child_process').exec;
require('dotenv').config()
const process = require("process")
const express = require('express');
const puppeteer = require('puppeteer');
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

function createElementFromHTML(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
  
	// Change this to div.childNodes to support multiple top-level nodes.
	return div.firstChild;
  }
function angleDifference( angle1, angle2 )
{	
	angle1 = angle1*(Math.PI/180)
	angle2 = angle2*(Math.PI/180)
	
	var diff = ( angle2 - angle1 + Math.PI ) % (Math.PI*2) - Math.PI;
	return (diff < -Math.PI ? diff + (Math.PI*2) : diff)/(Math.PI/180)
}
var pSBC = (p, c0, c1, l) => {
	let r, g, b, P, f, t, h, i = parseInt,
		m = Math.round,
		a = typeof(c1) == "string";
	if (typeof(p) != "number" || p < -1 || p > 1 || typeof(c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr) this.pSBCr = (d) => {
		let n = d.length,
			x = {};
		if (n > 9) {
			[r, g, b, a] = d = d.split(","), n = d.length;
			if (n < 3 || n > 4) return null;
			x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
		} else {
			if (n == 8 || n == 6 || n < 4) return null;
			if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
			d = i(d.slice(1), 16);
			if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
			else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
		}
		return x
	};
	h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? {
		r: 0,
		g: 0,
		b: 0,
		a: -1
	} : {
		r: 255,
		g: 255,
		b: 255,
		a: -1
	}, p = P ? p * -1 : p, P = 1 - p;
	if (!f || !t) return null;
	if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
	else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
	a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
	if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
	else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}
function clamp(num, min, max) {
    if (num > max) {
        num = max
    } else if (num < min) {
        num = min
    }
    return num
}

function calculateIntersection(p1, p2, p3, p4) {

    var c2x = p3.x - p4.x; // (x3 - x4)
  	var c3x = p1.x - p2.x; // (x1 - x2)
  	var c2y = p3.y - p4.y; // (y3 - y4)
  	var c3y = p1.y - p2.y; // (y1 - y2)
  
  	// down part of intersection point formula
  	var d  = c3x * c2y - c3y * c2x;
  
  	if (d == 0) {
    	return false
    }
  
  	// upper part of intersection point formula
  	var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
  	var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)
  
  	// intersection point formula
  	
  	var px = (u1 * c2x - c3x * u4) / d;
  	var py = (u1 * c2y - c3y * u4) / d;
  	
  	var p = { x: px, y: py };
  
  	return p;
}

function v(x=0,y=0) {
    return {x:x,y:y}
}

function round(num, dec) {
    return Math.round(num * Math.pow(10, dec + 1)) / Math.pow(10, dec + 1)
}
function randInt(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
}


function average() {
    let num = 0
    for (let argument of arguments) {
        num += argument
    }
    return num / arguments.length
}
function lerp(a1,a2,t) {
	return ((a2-a1)*t)+a1
}
function lerpV(a1,a2,t) {
	return v(
		lerp(a1.x,a2.x,t),
		lerp(a1.y,a2.y,t),
	)
}

function testRectCollision(x, y, width, height, x2, y2, width2, height2) {
    if (((x2 > x && x2 < x + width) || (x2 + width2 > x && x2 + width2 < x + width)) && ((y2 > y && y2 < y + height) || (y2 + height2 > y && y2 + height2 < y + height))) {
        return true
    } else {
        return false
    }

}

function stopOverflow(num, max) {
    return ((((num)) % max + max) % max)

}

function randInt(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
}

function removeArray(array, position) {
    let returnArray = new Array()
    for (let i = 0; i <= position - 1; i++) {
        returnArray.push(array[i])
    }
    for (let i = array.length - 1; i >= position + 1; i--) {
        returnArray.push(array[i])
    }
    return returnArray
}

function arrayRange(array, min, max) {
    let returnArray = new Array()
    for (let i = min; i < max; i++) {
        returnArray.push(array[i])
    }
    return returnArray

}

function intersects(a, b, c, d, p, q, r, s) {
    let det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

function getDst(x, y) {
    let xd = (x.x - y.x)
    let yd = (x.y - y.y)
    return Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2))
}

function get3dDistance(x, y, z, a, b, c) {
    let xd = (x - a)
    let yd = (y - b)
    let zd = (z - c)
    return Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2) + Math.pow(zd, 2))
}



function getAngle(x, y) {
    return Math.atan2(x.x - y.x, x.y - y.y) / (Math.PI / 180)
}

function cos(num) {
    return Math.cos(num * Math.PI / 180)
}

function sin(num) {
    return Math.sin(num * Math.PI / 180)
}

function radians(num) {
    return num * Math.PI / 180
}

function drawText(ctx, x, y, text = "", size = 30, fill = "#000000") {
    ctx.fontSize = `${size} Arial`
    let length = ctx.measureText(text)

    ctx.fillStyle = fill
    ctx.textAlign = "center"
    ctx.fillText(x - (length / 2), y, text)
}


function rotateVelocity(vel, angle) {

	return v(vel.x * cos(angle) - vel.y * sin(angle), vel.x * sin(angle) + vel.y * cos(angle))
}

function drawLine(ctx, pos, angle, length=30) {
	var pos1 = pos,
		pos2 = v(pos.x+(cos(angle)*length), pos.y+(sin(angle)*length))

	ctx.beginPath()
	ctx.moveTo(pos1.x, pos1.y)
	ctx.lineTo(pos2.x, pos2.y)
	ctx.stroke()
	ctx.closePath()
}
function averageVertices() {
	var average = v()
	for (let i = 0; i < arguments.length; i++) {
		const vertice = arguments[i];
		average.x += vertice.x
		average.y += vertice.y
	}
	return v(average.x/arguments.length, average.y/arguments.length)
}

function rotate(cx, cy, x, y, angle) {
    let radians = angle,
        cos2 = cos(radians),
        sin2 = sin(radians),
        nx = (cos2 * (x - cx)) + (sin2 * (y - cy)) + cx,
        ny = (cos2 * (y - cy)) - (sin2 * (x - cx)) + cy;
    return v(nx, ny);
}

// LINE/RECTANGLE
function lineRect(pos1, pos2, rect, angle=0, ctx) {

	var x1 = pos1.x,  
		y1 = pos1.y,  
		x2 = pos2.x,  
		y2 = pos2.y,  
		rx = rect.x,  
		ry = rect.y,
		rw = rect.width,  
		rh = rect.height

	angle *= Math.PI/180

	var rectCenter = v(rx, ry),
		pos1 = rotate(rectCenter.x, rectCenter.y, pos1.x, pos1.y, angle),
		pos2 = rotate(rectCenter.x, rectCenter.y, pos2.x, pos2.y, angle),
		rectPos = rotate(rectCenter.x, rectCenter.y, rect.x, rect.y, angle),


		x1 = pos1.x,  
		y1 = pos1.y,  
		x2 = pos2.x,  
		y2 = pos2.y,

		rx = rectPos.x, 
		ry = rectPos.y,
		rw = rect.width,  
		rh = rect.height

	
	

	// check if the line has hit any of the rectangle's sides
	// uses the Line/Line function below
	var left =   lineLine(x1,y1,x2,y2, rx,ry,rx, ry+rh);
	var right =  lineLine(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
	var top =    lineLine(x1,y1,x2,y2, rx,ry, rx+rw,ry);
	var bottom = lineLine(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);
  

	// if ANy of the above are true, the line
	// has hit the rectangle
	if (left || right || top || bottom) {
	  return true;
	}
	return false;
  }
  function castLine(pos, angle, length) {
	  angle = -angle - (Math.PI*0.5)
	  return v(pos.x+(Math.cos(angle)*length), pos.y+(Math.sin(angle)*length))
  }  
  
  // LINE/LINE
  function lineLine( x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4) {

  
	// calculate the direction of the lines
    let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  
	// if uA and uB are between 0-1, lines are colliding
	if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
  
	  // optionally, draw a circle where the lines meet
	   intersectionx = x1 + (uA * (x2-x1));
	   intersectiony = y1 + (uA * (y2-y1));
	  
  
	  return v(intersectionx, intersectiony);
	}
	return false;
  }
  function bias(t, n) {
	let e = Math.pow(1 - n, 3);
	return (t * e) / (t * e - t + 1);
  }

  function IsPolygonsIntersecting(a, b)
  {
	  
	  [a, b].forEach(polygon => {
		
		  for (let i1 = 0; i1 < polygon.Points.Count; i1++)
		  {
              let i2 = (i1 + 1) % polygon.Points.Count;
			  let p1 = polygon.Points[i1];
			  let p2 = polygon.Points[i2];
  
			  let normal = new Point(p2.y - p1.y, p1.x - p2.x);
  
			  let minA = null, maxA = null;
			  a.Points.forEach(p => {
			  
				  let projected = normal.x * p.x + normal.y * p.y;
				  if (minA == null || projected < minA){
					  minA = projected;
				  }
				  if (maxA == null || projected > maxA){
					  maxA = projected;
				  }
			  })
  
			 minB = null
			 maxB = null;
			 b.Points.foreach(p =>
			  {
				  let projected = normal.x * p.x + normal.y * p.y;
				  if (minB == null || projected < minB)
					  minB = projected;
				  if (maxB == null || projected > maxB)
					  maxB = projected;
			  })
  
			  if (maxA < minB || maxB < minA)
				  return false;
		  }
	  })
	  return true;
  }

  function shuffle(array) {
	let currentIndex = array.length,  randomIndex;
  
	// While there remain elements to shuffle.
	while (currentIndex != 0) {
  
	  // Pick a remaining element.
	  randomIndex = Math.floor(rand() * currentIndex);
	  currentIndex--;
  
	  // And swap it with the current element.
	  [array[currentIndex], array[randomIndex]] = [
		array[randomIndex], array[currentIndex]];
	}
  
	return array;
  }

  String.prototype.hashCode = function() {
  let hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return cyrb53(hash);
}
function dec2bin(dec) {
	return (dec >>> 0).toString(2);
  }

const cyrb53 = (str, seed = 0) => {
	let h1 = 0xdeadbeef ^ seed,
	  h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
	  ch = str.charCodeAt(i);
	  h1 = Math.imul(h1 ^ ch, 2654435761);
	  h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };


  function snap(value, interval) {
	  return Math.round(value/interval)*interval
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
    let dst = getDst(v(0,0),v(e,t))*0.2,
        num = 7-Math.pow(Math.sqrt(dst*0.13),3.2)
    this.mine = Math.random()<(1/num)
    this.uncovered = false
    this.flagged = false
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




function acknowledgeAccount(id, name) {
    accountData[id] = accountData[id]||({
        name:name,
        score:0,
        coins:0,
        stats:{
            tilesCleared:0,
            minesFlagged:0,
            minesTriggered:0,
        },
    });
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
        }
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
        }
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
    let players = (Object.keys(accountData)).map((e)=>{return accountData[e]})
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
    

    let tile = mainChunks.requestTile(data.pos.x,data.pos.y),
        count = countNeighbours(v(data.pos.x,data.pos.y))

        if (!tile.uncovered) {
            if (data.flag) {
                tile.flagged = !tile.flagged
                if (tile.flaggedBy != data.name) {
                    updateStats(user.id, {
                        minesFlagged:1,
                    })
                }
                tile.flaggedBy = data.name
                
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
            
        } else tile.flagged = false

    
    updateTicker = 2000
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
        leaderboard:getLeaderboard(),
    })
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

      
    socket.on('makeClick', (data) => {
        data = JSON.parse(data)
        inputClick(data)


    });
    socket.on('requestingChunks', (data) => {
        data = JSON.parse(data)
        socket.emit("returningChunks", JSON.stringify({
            chunks:mainChunks.requestChunks(data.x, data.y, data.width, data.height),
            leaderboard:getLeaderboard()
        }))


    });



    

})

setInterval(() => {
    var time = ((new Date()).getTime())
    updateTicker -= time-previouseDelta
    previouseDelta = time
   
    
}, 1000/SERVER_UPDATES_PER_SECOND);


server.listen(process.env.PORT || 8085, () => {
    console.log('listxwening on *:8085');
    mainChunks.chunkMaps = chunkData["chunks"]
})

setInterval(() =>{
    chunkData["chunks"] = mainChunks.chunkMaps
    fs.writeFileSync(`${__dirname}/chunks.json`, JSON.stringify(chunkData));
},30000)

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
})*/
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
            message.channel.send(`__Stats for ${string[1]}__\nTile Cleared: ${stats.tilesCleared}\nMines Flagged: ${stats.minesFlagged}\nMines Triggered: ${stats.minesTriggered}\n Success Percentage: ${successPer}%`)
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
            text = text+`\n> ${i}. ${user.name} (${user.score})`
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
