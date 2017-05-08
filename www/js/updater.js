'use strict';

const path = require('path')
const url = require('url')
const fs = require('fs-extra')
const extract = require('extract-zip')

const consts = require('./consts.js')
const downloader = require('./download.js')

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

    updateFull(data, options) {
        if (fs.existsSync(this.minecraftDir)) {
            fs.remove(this.minecraftDir, (err) => {
                if (err)  {
                    alert(err.message)
                } else {
                    this.downloadMinecraft(data, options)
                }
            });
        } else {
            this.downloadMinecraft(data, options)
        }
    }

    downloadMinecraft(data, options) {
        // Create MC dir
        fs.mkdirSync(this.minecraftDir)

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

                        recursiveDownload(index + 1)
                    })
                } else {
                    recursiveDownload(index + 1)
                }
            }).catch((err) => {
                alert(err.message)
            })
        }

        recursiveDownload(0)
    }

}

module.exports = {UpdaterMinecraft}
