'use strict';

const path = require('path')
const url = require('url')
const fs = require('fs-extra')
const extract = require('extract-zip')

const consts = require('./consts.js')
const downloader = require('./download.js')
const hash = require("./hash.js")

const minecraftDirectory = path.join(process.env.APPDATA, consts.MINECRAFT_DIR_NAME)

class UpdaterLauncher {

    constructor() {
        this.minecraftDir = minecraftDirectory
    }

    checkUpdate(data, currentVersion) {
        return currentVersion === undefined || currentVersion != data.launcher_version
    }

    update(data, options) {
        let localFileName = path.join(this.minecraftDir, data.launcher_setup)
        let remoteFileName = url.resolve(consts.URL_LAUNCHER, data.launcher_setup)

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
        }).catch(err => {
            if (window.isDebug) {
                console.info("Error in UpdaterLauncher.update:")
                console.info(err)
            }
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
        return this.minecraftDir
    }

    checkFiles(data, options) {
        // Promise for check contains files
        let promiseDirs = new Promise((resolve, reject) => {
            let countDirs = data.dir_checker.length

            if (countDirs == 0) {
                resolve()
                return
            }

            let recursiveDir = index => {
                if (index >= countDirs) {
                    resolve()
                    return
                }

                let d = data.dir_checker[index]
                let dir_name = path.join(this.minecraftDir, d.dir)

                if (fs.existsSync(dir_name)) {
                    fs.readdirSync(dir_name).forEach(file => {
                        let fileName = path.join(dir_name, file)
                        let fileStat = fs.statSync(fileName)

                        if (fileStat.isFile() && !d.files.includes(file)) {
                            fs.removeSync(fileName)
                        } else if (fileStat.isDirectory() && !d.dirs.includes(file)) {
                            fs.removeSync(fileName)
                        }
                    })
                }

                recursiveDir(index + 1)
            }

            recursiveDir(0)
        })

        // Promise for download file
        let promiseDownloadFiles = filesForDownload =>
            new Promise((resolve, reject) => {
                let countFiles = filesForDownload.length

                if (options.callbackPrepare) {
                    options.callbackPrepare()
                }

                let recursiveDownload = index => {
                    if (index >= countFiles) {
                        resolve()
                        return
                    }

                    let f = filesForDownload[index].file_download

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
                        })
                        .then(() => {
                            if (f.type == "zip") {
                                extract(localFileName, { dir: this.minecraftDir }, err => {
                                    if (err) {
                                        alert(err.message)
                                        return
                                    }

                                    fs.unlink(localFileName, err => {})

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
                        })
                        .catch(err => {
                            if (window.isDebug) {
                                console.info("Error in UpdaterMinecraft.checkFiles:promiseDownloadFiles:")
                                console.info(err)
                            }
                        })
                }

                recursiveDownload(0)
            })

        // Promise for check checksums
        let promiseFiles = new Promise((resolve, reject) => {
            let countFiles = data.file_checker.length
            let downloadFileChecker = []

            if (countFiles == 0) {
                resolve()
                return
            }

            let recursiveCheckDir = index => {
                if (index >= countFiles) {
                    if (downloadFileChecker.length > 0) {
                        promiseDownloadFiles(downloadFileChecker)
                            .then(resolve)
                    } else {
                        resolve()
                    }
                    return
                }

                let f = data.file_checker[index]
                let dir_name = path.join(this.minecraftDir, f.dir)

                if (fs.existsSync(dir_name)) {
                    let promisesFilesForHashing = []
                    var needReDownload = false

                    f.file_list.forEach(item => {
                        let fileName = path.join(dir_name, item.name)

                        if (fs.existsSync(fileName)) {
                            promisesFilesForHashing.push(hash.file_md5(fileName))
                        } else {
                            needReDownload = true
                        }
                    })

                    if (needReDownload) {
                        downloadFileChecker.push(f)

                        recursiveCheckDir(index + 1)
                    } else {
                        Promise.all(promisesFilesForHashing)
                            .then(hashItems => {
                                f.file_list.forEach(item => {
                                    for (var i = 0; i < hashItems.length; i++) {
                                        var it = hashItems[i]

                                        if (it.name == item.name && it.hash != item.hash) {
                                            needReDownload = true
                                            break
                                        }
                                    }
                                })

                                if (needReDownload) {
                                    downloadFileChecker.push(f)
                                }

                                recursiveCheckDir(index + 1)
                            })
                            .catch(err => {
                                if (window.isDebug) {
                                    console.info("Error in UpdaterMinecraft.checkFiles:promiseFiles:")
                                    console.info(err)
                                }
                            })
                    }
                } else {
                    recursiveCheckDir(index + 1)
                }
            }

            recursiveCheckDir(0)
        })

        promiseDirs
            .then(() => promiseFiles)
            .then(options.callbackComplete)
            .catch(err => {
                if (window.isDebug) {
                    console.info("Error in UpdaterMinecraft.checkFiles:summaryError:")
                    console.info(err)
                }
            })
    }

    checkUpdate(data, currentVersion) {
        return currentVersion === undefined || currentVersion != data.version
    }

    updateFull(data, options) {
        let countFiles = data.files.length

        if (countFiles == 0) {
            if (options.callbackComplete) {
                options.callbackComplete()
            }
            return
        }

        let recursiveDownload = (index) => {
            if (index >= countFiles) {
                if (options.callbackComplete) {
                    options.callbackComplete()
                }
                return
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
                            return
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
            }).catch(err => {
                if (window.isDebug) {
                    console.info("Error in UpdaterMinecraft.updateFull:")
                    console.info(err)
                }
            })
        }

        recursiveDownload(0)
    }

}

module.exports = {UpdaterMinecraft, UpdaterLauncher, minecraftDirectory}
