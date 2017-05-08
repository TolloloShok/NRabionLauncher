'use strict';

const path = require('path');
const fs = require('fs-extra');

const consts = require('./consts.js');

class UpdaterMinecraft {

    constructor() {
        this.minecraftDir = path.join(process.env.APPDATA, consts.MINECRAFT_DIR_NAME)
    }

    getDir() {
        return this.minecraftDir;
    }

    checkUpdate() {
        return !fs.existsSync(this.minecraftDir)
    }

    updateFull(data, callbackFileDownload, callbackProgressDownload, callbackComplete) {
        if (fs.existsSync(this.minecraftDir)) {
            fs.remove(this.minecraftDir, (err) => {
                if (err)  {
                    alert(err.message)
                } else {
                    this.downloadMinecraft()
                }
            });
        } else {
            this.downloadMinecraft()
        }
    }

    downloadMinecraft(callbackFileDownload, callbackProgressDownload, callbackComplete) {
        // Create MC dir
        fs.mkdirSync(this.minecraftDir)
    }

}

module.exports = {UpdaterMinecraft}
