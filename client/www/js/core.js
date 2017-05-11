'use strict';

let http = require('http')
let url = require('url')
let nconf = require('nconf')
let path = require('path')
let child_process = require('child_process')

const CONFIG_VERSION_LAUNCHER = "version_minecraft"

const {UpdaterMinecraft, UpdaterLauncher} = require("./updater.js")
const {MinecraftRunner} = require("./minecraft.js")
const pager = require("./pager.js")
const consts = require('./consts.js')
const downloader = require('./download.js')

let mcUpdater = new UpdaterMinecraft()
let launcherUpdater = new UpdaterLauncher()

nconf.use('file', { file: path.join(mcUpdater.getDir(), 'launcher_config.json') })
nconf.load()

function versionsCheck(data) {
    let version = nconf.get(CONFIG_VERSION_LAUNCHER)

    // check launcher updates
    if (launcherUpdater.checkUpdate(data, window.launcherVersion)) {
        pager.show(pager.PAGE_DOWNLOAD_LAUNCHER)

        let divDownloadLauncher = $("#download_launcher")

        launcherUpdater.update(
            data,
            {
                onProgress: (progress) => {
                    divDownloadLauncher.text("Progress: " + progress)
                },
                onSuccess: (localFileName) => {
                    child_process.exec('"' + localFileName + '"')
                },
                onFinish: () => {
                    setTimeout(() => {
                        window.mainWindow.close()
                    }, 500)
                }
            })
        return;
    }

    // check minecraft updates
    if (mcUpdater.checkUpdate(data, version)) {
        pager.show(pager.PAGE_DOWNLOAD)

        let divDownloadItems = $("#download_items");
        mcUpdater.updateFull(
            data,
            {
                callbackFileDownload: (name) => {
                    divDownloadItems.append("Start: ").append(name).append('<br>')
                },
                callbackProgressDownload: (name, progress) => {
                    console.info(name, progress)
                },
                callbackFileDownloadComplete: (name) => {
                    divDownloadItems.append("Finish: ").append(name).append('<br>')
                },
                callbackComplete: () => {
                    nconf.set(CONFIG_VERSION_LAUNCHER, data.version)
                    nconf.save()

                    pager.show(pager.PAGE_AUTH)
                }
            })
    } else {
        pager.show(pager.PAGE_AUTH)
    }
}

$("#run").click(() => {
    new MinecraftRunner().run({
        onStart: () => {
            pager.show(pager.PAGE_PLAYING)
            setTimeout(() => { window.mainWindow.minimize() }, 1500)
        },
        onFinish: () => {
            pager.show(pager.PAGE_ACCOUNT)
            window.mainWindow.restore()
        }
    })
})

$("#nrabion_link").click(() => {
    const {shell} = require('electron')
    shell.openExternal('https://vk.com/nrabion')
})

// main
downloader.downloadObject(url.resolve(consts.URL_BASE, 'data.json'))
    .then(versionsCheck)
    .catch((err) => {
        alert(err.message)
    })
