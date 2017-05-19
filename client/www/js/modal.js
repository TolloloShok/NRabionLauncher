'use strict';

class ModalWindow {

    constructor(jContainer, callbacks) {
        this.modal = jContainer
        this.callbacks = callbacks
        this.scroll = this.modal.find("[data-modal=modal-scroll]")

        let btnOk = this.modal.find("[data-modal=modal-ok]")
        btnOk.unbind("click")
        btnOk.click(() => {
            this.close()
            if (callbacks !== undefined && callbacks.onSuccess) {
                callbacks.onSuccess()
            }
        })

        let btnCancel = this.modal.find("[data-modal=modal-cancel]")
        btnCancel.unbind("click")
        btnCancel.click(() => {
            this.close()
            if (callbacks !== undefined && callbacks.onCancel) {
                callbacks.onCancel()
            }
        })

        let btnClose = this.modal.find("[data-modal=modal-close]")
        btnClose.unbind("click")
        btnClose.click(() => {
            this.close()
            if (callbacks !== undefined && callbacks.onClose) {
                callbacks.onClose()
            }
        })

        let btnReset = this.modal.find("[data-modal=modal-reset]")
        btnReset.unbind("click")
        btnReset.click(() => {
            if (callbacks !== undefined && callbacks.onReset) {
                callbacks.onReset()
            }
        })
    }

    show() {
        this.modal.removeClass("hide")
        this.scroll.scrollTop(0)

        if (this.callbacks.onPreventShow) {
            this.callbacks.onPreventShow()
        }
    }

    close() {
        this.modal.addClass("hide")
    }

    get(selector) {
        return this.modal.find(selector)
    }
}

module.exports = {ModalWindow}
