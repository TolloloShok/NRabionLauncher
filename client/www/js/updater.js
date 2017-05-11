'use strict';

const path = require('path')
const url = require('url')
const fs = require('fs-extra')
const extract = require('extract-zip')

const consts = require('./consts.js')
const downloader = require('./download.js')

const minecraftDirectory = path.join(process.env.APPDATA, consts.MINECRAFT_DIR_NAME)

class UpdaterLauncher {

    constructor() {
        this.minecraftDir = minecraftDirectory
    }

    checkUpdate(data, currentVersion) {
        return currentVersion === undefined || currentVersion != data.launcher_version;
    }

    update(data, options) {
        let localFileName = path.join(this.minecraftDir, data.launcher_setup)
        let remoteFileName = url.resolve(consts.URL_BASE, data.launcher_setup)

        /*if (fs.existsSync(localFileName)) {
            if (options.onSuccess) {
                options.onSuccess(localFileName)
            }
            if (options.onFinish) {
                options.onFinish()
            }
            return;
        }*/

        downloader.downloadFile({
            localFile: localFileName,
            remoteFile: remoteFileName,
            onProgress: (received_bytes, total_bytes) => {
                var percent = (received_bytes * 100) / total_bytes
                if (options.onProgress) {
                    options.onProgress(percent)
                }
            }
        }).then(() => {
            if (options.onSuccess) {
                options.onSuccess(localFileName)
            }
            if (options.onFinish) {
                options.onFinish()
            }
        }).catch((err) => {
            alert(err.message)
            if (options.onFinish) {
                options.onFinish()
            }
        })
    }

}

class UpdaterMinecraft {

    constructor() {
        this.minecraftDir = minecraftDirectory

        // Create MC dir
        if (!fs.existsSync(this.minecraftDir)) {
            fs.mkdirSync(this.minecraftDir)
        }
    }

    getDir() {
        return this.minecraftDir;
    }

    checkUpdate(data, currentVersion) {
        return currentVersion === undefined || currentVersion != data.version;
    }

    updateFull(data, options) {
        let countFiles = data.files.length

        let recursiveDownload = (index) => {
            if (index >= countFiles) {
                if (options.callbackComplete) {
                    options.callbackComplete()
                }
                return;
            }

            let f = data.files[index]

            if (options.callbackFileDownload) {
                options.callbackFileDownload(f.name)
            }

            let urlFileName = url.resolve(consts.URL_CLIENT, f.name)
            let localFileName = path.join(this.minecraftDir, f.name)

            downloader.downloadFile({
                localFile: localFileName,
                remoteFile: urlFileName,
                onProgress: (received_bytes, total_bytes) => {
                    var percent = (received_bytes * 100) / total_bytes
                    if (options.callbackProgressDownload) {
                        options.callbackProgressDownload(f.name, percent)
                    }
                }
            }).then(() => {
                if (f.type == "zip") {
                    extract(localFileName, { dir: this.minecraftDir }, (err) => {
                        if (err) {
                            alert(err.message)
                            return;
                        }

                        fs.unlink(localFileName, (err) => { })

                        if (options.callbackFileDownloadComplete) {
                            options.callbackFileDownloadComplete(f.name)
                        }

                        recursiveDownload(index + 1)
                    })
                } else {
                    if (options.callbackFileDownloadComplete) {
                        options.callbackFileDownloadComplete(f.name)
                    }

                    recursiveDownload(index + 1)
                }
            }).catch((err) => {
                alert(err.message)
            })
        }

        recursiveDownload(0)
    }

}

module.exports = {UpdaterMinecraft, UpdaterLauncher, minecraftDirectory}
