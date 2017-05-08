'use strict';

const PAGE_AUTH = 'auth';
const PAGE_DOWNLOAD = 'download';

function show(page) {
    switch (page) {
        case PAGE_AUTH:
            $("div[data-page=" + PAGE_AUTH + "]").removeClass("hidden")
            $("div[data-page=" + PAGE_DOWNLOAD + "]").addClass("hidden")
            break;
        case PAGE_DOWNLOAD:
            $("div[data-page=" + PAGE_AUTH + "]").addClass("hidden")
            $("div[data-page=" + PAGE_DOWNLOAD + "]").removeClass("hidden")
            break;
    }
}

module.exports = {PAGE_AUTH, PAGE_DOWNLOAD, show}
