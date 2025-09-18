const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
let router = express.Router()
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE ||  `
🔥 NIMA V8 SESSIONS CONNECTED ✅
🔥 Your Bot is Now Alive! 🔥
━━━━━━━━━━━━━━━━━━━━━━
🟢 Session qr code Successfully ✅
🔗 Connect for Instant Support & Bot Help:
📌 WhatsApp Inbox:
https://wa.link/lg8il1
━━━━━━━━━━━━━━━━━━━━━━
📦 GitHub Repo — Star It For Power Boost!
✴️ Nima V8 GitHub:
🪂
https://github.com/Nimeshamadhushan/NIMA-V8.git
━━━━━━━━━━━━━━━━━━━━━━
🚀 Deploy Your Nima Bot Now
👑 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲: nimesha madhushan
🧠 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲: nima v8 multi virsion bot
✨ Deploy & Like My Repo
━━━━━━━━━━━━━━━━━━━━━━
📝 Royal Quote of the Bot:

> “𝐁𝐨𝐭 𝐁𝐲 𝐍𝐚𝐦𝐞, 𝐋𝐞𝐠𝐞𝐧𝐝 𝐁𝐲 Nima”
— Nima v8 Runs in the Code
━━━━━━━━━━━━━━━━━━━━━━
Nima V8 || NIMESHA MADHUSHAN || NIMA CODER
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys')
        try {
            let Smd = makeWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        try {
                            const qrBuffer = await toBuffer(qr);
                            res.end(qrBuffer);
                            return;
                        } catch (error) {
                            console.error("Error generating QR Code buffer:", error);
                            return;
                        }
                    }
                }

                if (connection === "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const Scan_Id = string_session;

                    let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                    await delay(1000);
                    try { 
                        await fs.emptyDirSync(__dirname + '/auth_info_baileys'); 
                    } catch(e) {}
                }

                Smd.ev.on('creds.update', saveCreds)

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                    if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...")
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.loggedOut) {
                        console.log("Device Logged Out, Please Delete Session and Scan Again.");
                        process.exit();
                    } else {
                        console.log('Connection closed:', reason);
                        exec('pm2 restart qasim');
                        process.exit(0);
                    }
                }
            });
        } catch (err) {
            console.log(err);
            exec('pm2 restart qasim');
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }
    return await SUHAIL();
});

module.exports = router;