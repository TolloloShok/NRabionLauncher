'use strict';

const MINECRAFT_DIR_NAME = "nrabion-minecraft";
const URL_BASE = "https://s3.ca-central-1.amazonaws.com/nrabion-minecraft/";
const URL_CLIENT = URL_BASE + "client/";
const URL_LAUNCHER = URL_BASE + "launcher/";
const URL_AUTH_LOGIN = "http://n-rabion.ru/kph_launcher/launcher_auth.php?action=login"

module.exports = {
    MINECRAFT_DIR_NAME,
    URL_BASE,
    URL_CLIENT,
    URL_LAUNCHER,
    URL_AUTH_LOGIN
}
