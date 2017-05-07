'use strict';

class UpdaterMinecraft {

    constructor() {
        this.minecraftDir = process.env.APPDATA;
    }

    checkUpdate() {
        alert("UPDATER: " + this.minecraftDir);
    }

}
