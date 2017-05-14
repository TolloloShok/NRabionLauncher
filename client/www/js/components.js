'use strict';

class DownloadItemProgress {
    constructor(container) {
        this.item = $('<div class="download-item">')
        this.itemTitle = $('<span class="title-text">')
        this.itemProgress = $('<span class="progress-text">')
        this.progressBar = $('<div class="progress-container">')

        this.progressBar.css("width", "0%")

        this.progressBar.append($('<div class="progress-offset-container">').append(this.itemProgress).append('%'))
        this.item.append($('<div class="title-container">').append('File: ').append(this.itemTitle)).append(this.progressBar)
        container.append(this.item)
    }

    title(newTitle) {
        if (newTitle) {
            this.itemTitle.text(newTitle)
        } else {
            return this.itemTitle.text()
        }
    }

    progress(newProgress) {
        if (newProgress) {
            this.itemProgress.text(newProgress)
            this.progressBar.css("width", newProgress + "%")
        } else {
            return this.itemProgress.text()
        }
    }

    complete() {
        this.item.addClass("complete")
    }
}

class LoadingButton {
    constructor(button) {
        this.button = button
        this.html = button.html()
    }

    start() {
        this.button.html('<i class="fa fa-refresh loading-spin" aria-hidden="true"></i>')
    }

    stop() {
        this.button.html(this.html)
    }
}

module.exports = {LoadingButton, DownloadItemProgress}
