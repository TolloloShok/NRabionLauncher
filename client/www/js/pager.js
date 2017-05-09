'use strict';

const PAGE_AUTH = 'auth'
const PAGE_DOWNLOAD = 'download'
const PAGE_LOADING = 'loading'
const PAGE_PLAYING = 'playing'

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
}

module.exports = {PAGE_AUTH, PAGE_DOWNLOAD, PAGE_LOADING, PAGE_PLAYING, show}
