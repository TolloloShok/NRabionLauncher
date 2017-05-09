'use strict';

let http = require('http')
let url = require('url')
let nconf = require('nconf')
let path = require('path')
let child_process = require('child_process')

const CONFIG_VERSION_LAUNCHER = "version_minecraft"

const {UpdaterMinecraft} = require("./updater.js")
const pager = require("./pager.js")
const consts = require('./consts.js')

let mcUpdater = new UpdaterMinecraft()

nconf.use('file', { file: path.join(mcUpdater.getDir(), 'launcher_config.json') })
nconf.load()

function showActualyScreen() {
    var version = nconf.get(CONFIG_VERSION_LAUNCHER)

    requestDataClient((data) => {
        if (mcUpdater.checkUpdate() || version === undefined || version != data.version) {
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
    })
}

function requestDataClient(callback) {
    // Get data for client update
    http.get(url.resolve(consts.URL_BASE, 'data.json'), function(resource) {
        resource.setEncoding('utf8')
        resource.on('data', function (data) {
            var data = JSON.parse(data)
            callback(data)
        })
    })
}

$("#run").click(() => {
    let minecraftDir = mcUpdater.getDir()

    pager.show(pager.PAGE_PLAYING)
    child_process.exec(
        'javaw -Xmx1024M "-Djava.library.path=' + minecraftDir +
        '\\versions\\ForgeOptiFine 1.11\\natives" -cp "' + minecraftDir +
        '\\libraries\\net\\minecraftforge\\forge\\1.11-13.19.1.2189\\forge-1.11-13.19.1.2189.jar;' + minecraftDir +
        '\\libraries\\net\\minecraft\\launchwrapper\\1.12\\launchwrapper-1.12.jar;' + minecraftDir +
        '\\libraries\\org\\ow2\\asm\\asm-all\\5.0.3\\asm-all-5.0.3.jar;' + minecraftDir +
        '\\libraries\\jline\\jline\\2.13\\jline-2.13.jar;' + minecraftDir +
        '\\libraries\\com\\typesafe\\akka\\akka-actor_2.11\\2.3.3\\akka-actor_2.11-2.3.3.jar;' + minecraftDir +
        '\\libraries\\com\\typesafe\\config\\1.2.1\\config-1.2.1.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-actors-migration_2.11\\1.1.0\\scala-actors-migration_2.11-1.1.0.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-compiler\\2.11.1\\scala-compiler-2.11.1.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\plugins\\scala-continuations-library_2.11\\1.0.2\\scala-continuations-library_2.11-1.0.2.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\plugins\\scala-continuations-plugin_2.11.1\\1.0.2\\scala-continuations-plugin_2.11.1-1.0.2.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-library\\2.11.1\\scala-library-2.11.1.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-parser-combinators_2.11\\1.0.1\\scala-parser-combinators_2.11-1.0.1.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-reflect\\2.11.1\\scala-reflect-2.11.1.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-swing_2.11\\1.0.1\\scala-swing_2.11-1.0.1.jar;' + minecraftDir +
        '\\libraries\\org\\scala-lang\\scala-xml_2.11\\1.0.2\\scala-xml_2.11-1.0.2.jar;' + minecraftDir +
        '\\libraries\\lzma\\lzma\\0.0.1\\lzma-0.0.1.jar;' + minecraftDir +
        '\\libraries\\net\\sf\\jopt-simple\\jopt-simple\\4.6\\jopt-simple-4.6.jar;' + minecraftDir +
        '\\libraries\\java3d\\vecmath\\1.5.2\\vecmath-1.5.2.jar;' + minecraftDir +
        '\\libraries\\net\\sf\\trove4j\\trove4j\\3.0.3\\trove4j-3.0.3.jar;' + minecraftDir +
        '\\libraries\\com\\mojang\\netty\\1.6\\netty-1.6.jar;' + minecraftDir +
        '\\libraries\\oshi-project\\oshi-core\\1.1\\oshi-core-1.1.jar;' + minecraftDir +
        '\\libraries\\net\\java\\dev\\jna\\jna\\3.4.0\\jna-3.4.0.jar;' + minecraftDir +
        '\\libraries\\net\\java\\dev\\jna\\platform\\3.4.0\\platform-3.4.0.jar;' + minecraftDir +
        '\\libraries\\com\\ibm\\icu\\icu4j-core-mojang\\51.2\\icu4j-core-mojang-51.2.jar;' + minecraftDir +
        '\\libraries\\net\\sf\\jopt-simple\\jopt-simple\\4.6\\jopt-simple-4.6.jar;' + minecraftDir +
        '\\libraries\\com\\paulscode\\codecjorbis\\20101023\\codecjorbis-20101023.jar;' + minecraftDir +
        '\\libraries\\com\\paulscode\\codecwav\\20101023\\codecwav-20101023.jar;' + minecraftDir +
        '\\libraries\\com\\paulscode\\libraryjavasound\\20101123\\libraryjavasound-20101123.jar;' + minecraftDir +
        '\\libraries\\com\\paulscode\\librarylwjglopenal\\20100824\\librarylwjglopenal-20100824.jar;' + minecraftDir +
        '\\libraries\\com\\paulscode\\soundsystem\\20120107\\soundsystem-20120107.jar;' + minecraftDir +
        '\\libraries\\io\\netty\\netty-all\\4.0.23.Final\\netty-all-4.0.23.Final.jar;' + minecraftDir +
        '\\libraries\\com\\google\\guava\\guava\\17.0\\guava-17.0.jar;' + minecraftDir +
        '\\libraries\\org\\apache\\commons\\commons-lang3\\3.3.2\\commons-lang3-3.3.2.jar;' + minecraftDir +
        '\\libraries\\commons-io\\commons-io\\2.4\\commons-io-2.4.jar;' + minecraftDir +
        '\\libraries\\commons-codec\\commons-codec\\1.9\\commons-codec-1.9.jar;' + minecraftDir +
        '\\libraries\\net\\java\\jinput\\jinput\\2.0.5\\jinput-2.0.5.jar;' + minecraftDir +
        '\\libraries\\net\\java\\jutils\\jutils\\1.0.0\\jutils-1.0.0.jar;' + minecraftDir +
        '\\libraries\\com\\google\\code\\gson\\gson\\2.2.4\\gson-2.2.4.jar;' + minecraftDir +
        '\\libraries\\com\\mojang\\realms\\1.10.4\\realms-1.10.4.jar;' + minecraftDir +
        '\\libraries\\org\\apache\\commons\\commons-compress\\1.8.1\\commons-compress-1.8.1.jar;' + minecraftDir +
        '\\libraries\\org\\apache\\httpcomponents\\httpclient\\4.3.3\\httpclient-4.3.3.jar;' + minecraftDir +
        '\\libraries\\commons-logging\\commons-logging\\1.1.3\\commons-logging-1.1.3.jar;' + minecraftDir +
        '\\libraries\\org\\apache\\httpcomponents\\httpcore\\4.3.2\\httpcore-4.3.2.jar;' + minecraftDir +
        '\\libraries\\it\\unimi\\dsi\\fastutil\\7.0.12_mojang\\fastutil-7.0.12_mojang.jar;' + minecraftDir +
        '\\libraries\\org\\lwjgl\\lwjgl\\lwjgl\\2.9.4-nightly-20150209\\lwjgl-2.9.4-nightly-20150209.jar;' + minecraftDir +
        '\\libraries\\org\\lwjgl\\lwjgl\\lwjgl_util\\2.9.4-nightly-20150209\\lwjgl_util-2.9.4-nightly-20150209.jar;' + minecraftDir +
        '\\libraries\\org\\apache\\logging\\log4j\\log4j-api\\2.0-beta9\\log4j-api-2.0-beta9.jar;' + minecraftDir +
        '\\libraries\\org\\apache\\logging\\log4j\\log4j-core\\2.0-beta9\\log4j-core-2.0-beta9.jar;' + minecraftDir +
        '\\libraries\\com\\mojang\\authlib\\1.5.24\\authlib-1.5.24.jar;' + minecraftDir +
        '\\versions\\ForgeOptiFine 1.11\\ForgeOptiFine 1.11.jar" -Dfml.ignoreInvalidMinecraftCertificates=true -Dfml.ignorePatchDiscrepancies=true -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalMode -XX:-UseAdaptiveSizePolicy -Xmn128M net.minecraft.launchwrapper.Launch --username nnnn --version "ForgeOptiFine 1.11" --gameDir ' + minecraftDir +
        ' --assetsDir ' + minecraftDir + '\\assets --assetIndex 1.11 --uuid 00000000-0000-0000-0000-000000000000 --accessToken null --userProperties [] --userType mojang --tweakClass net.minecraftforge.fml.common.launcher.FMLTweaker --versionType Forge --width 925 --height 530',
        {
            cwd: minecraftDir
        },
        () => {
            pager.show(pager.PAGE_AUTH)
        })
})

showActualyScreen()
