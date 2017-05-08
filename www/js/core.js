'use strict';

const {UpdaterMinecraft} = require("./updater.js");

let test = new UpdaterMinecraft();
test.checkUpdate();

const path = require('path');
console.info(path);
