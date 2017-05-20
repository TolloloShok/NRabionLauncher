'use strict';

const {shell} = require('electron')

function renderHTML(text) { 
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

    var textPrepared = text.replace(/<(?:.|\n)*?>/gm, '')
    var textWithLinks = textPrepared.replace(urlRegex, (url) => {   
        return '<a href="' + url + '">' + url + '</a>'
    })
    var textWithBr = textWithLinks.replace(/\n/g, "<br>")
    var textResult = textWithBr

    return textResult
} 

class VkWall {

    constructor(container, response) {
        this.container = container
        this.response = response
    }

    show() {
        for (var i = 0; i < this.response.items.length; i++) {
            var item = this.response.items[i]
            if (item.is_pinned == 1) continue
            this.container.append(this._createItem(item))
        }
    }

    _createItem(item) {
        let post = $('<div class="vk-post">')
        let postHeader = $('<div class="vk-post-header">')
        let postContent = $('<div class="vk-post-content">')
        let postAvatar = $('<div class="vk-post-avatar">')
        let postInfo = $('<div class="vk-post-info">')
        let imgGroup = $('<img class="vk-post-img">')
        let postTitle = $('<div class="vk-post-title">')
        let postDate = $('<div class="vk-post-date">')

        imgGroup.attr("src", this.response.groups[0].photo_50)
        postTitle.text(this.response.groups[0].name)
        postDate.text(new Date(item.date * 1000).toLocaleString())
        postContent.html(renderHTML(item.text))

        postContent.children('a').click(function (event) {
            shell.openExternal($(this).attr("href"))
            return false
        })

        postAvatar.append(imgGroup)
        postInfo.append(postTitle).append(postDate)
        postHeader.append(postAvatar).append(postInfo)
        post.append(postHeader).append(postContent)

        postInfo.click(() => {
            let link = "https://vk.com/wall-134583593_" + item.id
            shell.openExternal(link)
        })

        return post
    }

}

module.exports = {VkWall}
