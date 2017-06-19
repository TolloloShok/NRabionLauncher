'use strict';

const http = require('http')
const url = require('url')
const nconf = require('nconf')
const path = require('path')
const child_process = require('child_process')
const {shell} = require('electron')

const CONFIG_VERSION_LAUNCHER = "version_minecraft"
const CONFIG_LAST_LOGIN = "last_login"
const CONFIG_SETTINGS = "settings"

const {UpdaterMinecraft, UpdaterLauncher} = require("./updater.js")
const {MinecraftRunner} = require("./minecraft.js")
const pager = require("./pager.js")
const consts = require('./consts.js')
const downloader = require('./download.js')
const rest_api = require("./rest.js")
const {LoadingButton, DownloadItemProgress} = require("./components.js")
const {ModalWindow} = require("./modal.js")
const notif = require("./notifications.js")
const {VkWall} = require("./vk.js")

let mcUpdater = new UpdaterMinecraft()
let launcherUpdater = new UpdaterLauncher()

let btnNrabionLink = $("#nrabion_link")
let btnRunMinecraft = $("#button-run")
let btnLogIn = $("#button-login")
let btnLogOut = $("#button-exit")
let btnReg = $("#button-registration")
let btnLastLogin = $("#button-last-login")
let txtBindUsername = $("[data-bind=username]")
let divLastLogin = $("#last-login-container")
let txtLastLoginUsername = $("#username-last-login")
let btnSettings = $("#button-settings")
let lblLoadingState = $("#loading-state")

var currentProfile = null
var currentSettings = null
var launcherData = null
var lockDoubleAuth = false

nconf.use('file', { file: path.join(mcUpdater.getDir(), 'launcher_config.json') })
nconf.load()

function checkMinecraftFiles(data) {
    return new Promise((resolve, reject) => {
        if (window.isDebug) {
            console.info("Start checkMinecraftFiles")
        }

        var divDownloadItems = null
        var downloadProgress = null

        mcUpdater.checkFiles(data, {
            callbackPrepare: () => {
                pager.show(pager.PAGE_DOWNLOAD)

                divDownloadItems = $("#download-client-progress")
            },
            callbackFileDownload: (name) => {
                downloadProgress = new DownloadItemProgress(divDownloadItems)
                downloadProgress.title(name)
            },
            callbackProgressDownload: (name, progress) => {
                downloadProgress.progress(progress)
            },
            callbackFileDownloadComplete: (name) => {
                downloadProgress.complete()
            },
            callbackComplete: () => {
                resolve()
            }
        })
    })
}

function versionsCheck(data) {
    return new Promise((resolve, reject) => {
        let version = nconf.get(CONFIG_VERSION_LAUNCHER)

        if (window.isDebug) {
            console.info("Start versionsCheck")
        }

        var divDownloadItems = null
        var downloadProgress = null

        // check launcher updates
        if (launcherUpdater.checkUpdate(data, window.launcherVersion)) {
            pager.show(pager.PAGE_DOWNLOAD_LAUNCHER)

            divDownloadItems = $("#download-launcher-progress")
            downloadProgress = new DownloadItemProgress(divDownloadItems)
            downloadProgress.title(data.launcher_setup)

            launcherUpdater.update(
                data,
                {
                    onProgress: (progress) => {
                        downloadProgress.progress(progress)
                    },
                    onSuccess: (localFileName) => {
                        downloadProgress.complete()
                        setTimeout(() => {
                            window.mainWindow.close()
                            shell.openExternal('"' + localFileName + '"')
                        }, 1500)
                    }
                })
            return
        }

        // check minecraft updates
        if (mcUpdater.checkUpdate(data, version)) {
            pager.show(pager.PAGE_DOWNLOAD)

            divDownloadItems = $("#download-client-progress")

            mcUpdater.updateFull(
                data,
                {
                    callbackFileDownload: (name) => {
                        downloadProgress = new DownloadItemProgress(divDownloadItems)
                        downloadProgress.title(name)
                    },
                    callbackProgressDownload: (name, progress) => {
                        downloadProgress.progress(progress)
                    },
                    callbackFileDownloadComplete: (name) => {
                        downloadProgress.complete()
                    },
                    callbackComplete: () => {
                        nconf.set(CONFIG_VERSION_LAUNCHER, data.version)
                        nconf.save()

                        resolve()
                    }
                })
            return
        }

        // check minecraft files
        checkMinecraftFiles(data).then(resolve)
    })
}

function openPageAccount() {
    if (currentProfile) {
        txtBindUsername.text(currentProfile.username)
    }
    pager.show(pager.PAGE_ACCOUNT)
}

function openPageAuth() {
    let last_login = nconf.get(CONFIG_LAST_LOGIN)

    if (last_login) {
        divLastLogin.removeClass("hide")
        txtLastLoginUsername.text(last_login.username)
    } else {
        divLastLogin.addClass("hide")
        txtLastLoginUsername.text("")
    }

    pager.show(pager.PAGE_AUTH)
}

function run_minecraft() {
    checkMinecraftFiles(launcherData)
        .then(() => {
            if (currentProfile) {
                new MinecraftRunner(currentProfile, currentSettings)
                    .run({
                        onStart: () => {
                            pager.show(pager.PAGE_PLAYING)
                            setTimeout(() => { window.mainWindow.close() }, 3000)
                        },
                        onFinish: () => {
                            openPageAccount()
                            window.mainWindow.restore()
                        }
                    })
            }
        })
}

function authorization() {
    if (lockDoubleAuth) return

    lockDoubleAuth = true
    
    let loadBtn = new LoadingButton(btnLogIn)
    loadBtn.start()

    rest_api.makePOST(consts.URL_AUTH_LOGIN,
        {
            username: $("#username").val(),
            password: $("#password").val()
        })
        .then((body) => {
            let data = JSON.parse(body)

            if (data.success) {
                currentProfile = data

                nconf.set(CONFIG_LAST_LOGIN, data)
                nconf.save()

                openPageAccount()
            } else {
                openPageAuth()
                alert(data.errorMessage)
            }

            lockDoubleAuth = false
            loadBtn.stop()
        })
        .catch((err) => {
            alert(err.message)
            lockDoubleAuth = false
            loadBtn.stop()
        })
}

$("#username, #password").keydown((e) => {
    if (e.keyCode == 13) {
        authorization()
    }
})

btnNrabionLink.click(() => {
    shell.openExternal('https://vk.com/nrabion')
})

btnReg.click(() => {
    shell.openExternal('http://n-rabion.ru/register/')
})

btnRunMinecraft.click(run_minecraft)

btnLogIn.click(authorization)

btnLogOut.click(() => {
    openPageAuth()
})

btnLastLogin.click(() => {
    let last_login = nconf.get(CONFIG_LAST_LOGIN)

    if (last_login) {
        currentProfile = last_login
        openPageAccount()
    }
})

btnSettings.click(() => {
    const defaultSettings = {
        xmx: 1024,
        width: 925,
        height: 530
    }

    let modalSettings =
        new ModalWindow($("#settings-window"), {
            onPreventShow: () => {
                if (currentSettings) {
                    modalSettings.get("#mc-xmx").val(currentSettings.xmx ? currentSettings.xmx : defaultSettings.xmx)
                    modalSettings.get("#mc-width").val(currentSettings.width ? currentSettings.width : defaultSettings.width)
                    modalSettings.get("#mc-height").val(currentSettings.height ? currentSettings.height : defaultSettings.height)
                } else {
                    modalSettings.get("#mc-xmx").val(defaultSettings.xmx)
                    modalSettings.get("#mc-width").val(defaultSettings.width)
                    modalSettings.get("#mc-height").val(defaultSettings.height)
                }
            },
            onSuccess: () => {
                currentSettings = {}
                currentSettings.xmx = modalSettings.get("#mc-xmx").val()
                currentSettings.width = modalSettings.get("#mc-width").val()
                currentSettings.height = modalSettings.get("#mc-height").val()
                nconf.set(CONFIG_SETTINGS, currentSettings)
                nconf.save()
                notif.sendNotification("Настройки сохранены!", "Настройки успешно применены.")
            },
            onReset: () => {
                modalSettings.get("#mc-xmx").val(defaultSettings.xmx)
                modalSettings.get("#mc-width").val(defaultSettings.width)
                modalSettings.get("#mc-height").val(defaultSettings.height)
            }
        })

    modalSettings.show()
})

// main

function loadLauncherData() {
    return new Promise((resolve, reject) => {
        lblLoadingState.text("Загрузка информации лаунчера")

        if (window.isDebug) {
            console.info("Start loadLauncherData")
        }

        setTimeout(() => {
            rest_api.makeGET(url.resolve(consts.URL_BASE, 'data.json'))
                .then(body => {
                    let data = JSON.parse(body)

                    launcherData = data

                    resolve(data)
                })
                .catch(err => {
                    if (window.isDebug) {
                        console.info("Error in loadLauncherData:")
                        console.info(err)
                    }
                })
        }, 100)
    })
}

function loadVkNews() {
    return new Promise((resolve, reject) => {
        let groupWall = $('#vk-group-wall')

        if (window.isDebug) {
            console.info("Start loadVkNews")
        }

        lblLoadingState.text("Загрузка новостей")
        setTimeout(() => {
            rest_api
                .makeGET("https://api.vk.com/method/wall.get?owner_id=-134583593&count=5&filter=owner&extended=1&v=5.64&access_token=e2b75e31e2b75e31e2b75e3164e2f58867ee2b7e2b75e31bbf1e5155a52081210248389")
                .then((body) => {
                    let data = JSON.parse(body)
                    new VkWall(groupWall, data.response).show()

                    resolve()
                })
                .catch(err => {
                    // Произошла какая-то х*йня, скрываем лучше блок новостей
                    groupWall.addClass("hide")

                    if (window.isDebug) {
                        console.info("Error in loadVkNews:")
                        console.info(err)
                    }

                    resolve()
                })
        }, 100)
    })
}

currentSettings = nconf.get(CONFIG_SETTINGS)

loadVkNews()
    .then(loadLauncherData)
    .then(versionsCheck)
    .then(openPageAuth)
    .catch(err => {
        if (window.isDebug) {
            console.info("Error in core:")
            console.info(err)
        }
    })
