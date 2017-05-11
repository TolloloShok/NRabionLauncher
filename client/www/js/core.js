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
const rest_api = require("./rest.js")

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
                    setTimeout(() => {
                        child_process.exec('"' + localFileName + '"')
                    }, 300)
                },
                onFinish: () => {
                    setTimeout(() => {
                        window.mainWindow.close()
                    }, 700)
                }
            })
        return;
    }

    // check minecraft updates
    if (mcUpdater.checkUpdate(data, version)) {
        pager.show(pager.PAGE_DOWNLOAD)

        let divDownloadItems = $("#download_items")
        let divDownloadItemsProgress = $("#download_items_progress")

        mcUpdater.updateFull(
            data,
            {
                callbackFileDownload: (name) => {
                    divDownloadItems.append("Start: ").append(name).append('<br>')
                },
                callbackProgressDownload: (name, progress) => {
                    divDownloadItemsProgress.text(name + " " + progress + " %")
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

// events

var currentProfile = null

$("#run").click(() => {
    if (currentProfile) {
        new MinecraftRunner(currentProfile.username,
                            currentProfile.uuid,
                            currentProfile.accessToken)
            .run({
                onStart: () => {
                    pager.show(pager.PAGE_PLAYING)
                    setTimeout(() => { window.mainWindow.minimize() }, 1500)
                },
                onFinish: () => {
                    pager.show(pager.PAGE_ACCOUNT)
                    window.mainWindow.restore()
                }
            })
    }
})

$("#nrabion_link").click(() => {
    const {shell} = require('electron')
    shell.openExternal('https://vk.com/nrabion')
})

$("#btnLogin").click(() => {
    rest_api.makePOST(consts.URL_AUTH_LOGIN,
        {
            username: $("#username").val(),
            password: $("#password").val()
        })
        .then((body) => {
            let data = JSON.parse(body)

            if (data.success) {
                currentProfile = data

                pager.show(pager.PAGE_ACCOUNT)
            } else {
                pager.show(pager.PAGE_AUTH)
                alert(data.errorMessage)
            }
        })
})

// main
rest_api.makeGET(url.resolve(consts.URL_BASE, 'data.json'))
    .then((body) => {
        let data = JSON.parse(body)
        versionsCheck(data)
    })
