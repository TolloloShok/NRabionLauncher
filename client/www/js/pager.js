'use strict';

const PAGE_AUTH = 'auth'
const PAGE_DOWNLOAD = 'download'
const PAGE_LOADING = 'loading'
const PAGE_PLAYING = 'playing'
const PAGE_DOWNLOAD_LAUNCHER = 'download_launcher'
const PAGE_ACCOUNT = 'account'
const PAGE_START_UPDATE_LAUNCHER = 'start_update_launcher'

function show(page) {
    if (page == PAGE_AUTH) {
        $("div[data-page=" + PAGE_AUTH + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_AUTH + "]").addClass("hidden")
    }

    if (page == PAGE_DOWNLOAD) {
        $("div[data-page=" + PAGE_DOWNLOAD + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_DOWNLOAD + "]").addClass("hidden")
    }

    if (page == PAGE_LOADING) {
        $("div[data-page=" + PAGE_LOADING + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_LOADING + "]").addClass("hidden")
    }

    if (page == PAGE_PLAYING) {
        $("div[data-page=" + PAGE_PLAYING + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_PLAYING + "]").addClass("hidden")
    }

    if (page == PAGE_DOWNLOAD_LAUNCHER) {
        $("div[data-page=" + PAGE_DOWNLOAD_LAUNCHER + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_DOWNLOAD_LAUNCHER + "]").addClass("hidden")
    }
    
    if (page == PAGE_ACCOUNT) {
        $("div[data-page=" + PAGE_ACCOUNT + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_ACCOUNT + "]").addClass("hidden")
    }
    
    if (page == PAGE_START_UPDATE_LAUNCHER) {
        $("div[data-page=" + PAGE_START_UPDATE_LAUNCHER + "]").removeClass("hidden")
    } else {
        $("div[data-page=" + PAGE_START_UPDATE_LAUNCHER + "]").addClass("hidden")
    }
}

module.exports = {
    PAGE_AUTH,
    PAGE_DOWNLOAD,
    PAGE_LOADING,
    PAGE_PLAYING,
    PAGE_DOWNLOAD_LAUNCHER,
    PAGE_ACCOUNT,
    PAGE_START_UPDATE_LAUNCHER,
    show
}
