function sendNotification(title, body) {
    var notification = new Notification(title,
        {
            body: body,
            icon: '../icon.ico'
        })
}

module.exports = {sendNotification}
