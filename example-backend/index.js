const { v4: uuidv4 } = require('uuid');

const { URL } = require("url");
const { tools } = require('nanocurrency-web');

const express = require("express");
const ws = require("ws");
const PORT = process.env.PORT || 9000;

let app = express();
let wss = new ws.Server({ noServer: true });

app.use(express.static("frontend"));

let server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
server.on("upgrade", (req, socket, head) => {
    if (new URL(req.url, `http://${req.headers.host}`).pathname === "/ws")
        wss.handleUpgrade(req, socket, head, (ws) =>
            wss.emit("connection", ws, req)
        );
});


// 2 WS routes:
// /challenge ~ retrieve challenge
// /verify ~ send challenge and get redirect url if match
wss.on("connection", async (ws, req) => {
    // secure random
    var bigChallenge = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

    console.log("New connection");
    ws.send(JSON.stringify({"type":"open"}));
    ws.on('message', function message(data) {
        console.log('received: %s', data);
        let reqdata = data.toString("utf-8");
        if (!reqdata) return; // Ignore empty messages
        if (!reqdata.startsWith("{")) return; // Ignore invalid messages
        try {
            reqdata = JSON.parse(reqdata);
        } catch (e) {
            return; // Ignore invalid JSON
        }
        if(reqdata.type==='challenge') {
            console.log("Got message, sending challenge");
            ws.send(JSON.stringify({ type: "challenge", "challenge":bigChallenge }));
        }
        
        if(reqdata.type==='verify') {
            console.log("Got message, verifying..");

            const publicKey = reqdata.publicKey; // retrieve from your Db?
            const signature = reqdata.signature;
            const match = tools.verify(publicKey, signature, bigChallenge);
            console.log({publicKey:publicKey,match:match});
            if(match) {
                // do something
                ws.send(JSON.stringify({ type: "redirect", "url":'https://nano.org' }));
                //ws.close();
            }
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
