<?php

    //ini_set('error_reporting', E_ALL);
    //ini_set('display_errors', 1);
    //ini_set('display_startup_errors', 1);

    /**
     *  Authorization script by kapehh [MODIFICATION for WordPress]
     *  
     *  URLS:
     
     *   For client-side, client send JOIN request for player (UUID of player, AccessToken from authorization, ServerID from server)
     *     /kph/authorization.php?action=join
     *  
     *   For server-side, server check Username and ServerID
     *     /kph/authorization.php?action=hasjoined
     *  
     *  
     *  MySQL Table:
     *  
     *   CREATE TABLE `mc_auth_players` (
     *       `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
     *       `username` VARCHAR(255) NOT NULL DEFAULT '',
     *       `uuid` VARCHAR(255) NOT NULL DEFAULT '',
     *       `accessToken` VARCHAR(255) NOT NULL DEFAULT '',
     *       `serverID` VARCHAR(255) NOT NULL DEFAULT '',
     *       `skin` VARCHAR(255) NOT NULL DEFAULT '',
     *       `cloak` VARCHAR(255) NOT NULL DEFAULT '',
     *       PRIMARY KEY (`id`)
     *   )
     *
     */
    
    $DB_HOST = "localhost";
    $DB_PORT = 3306;
    $DB_USER = "karen";
    $DB_PASS = "password";
    $DB_NAME = "mc_test";
    $DB_TABLE = "mc_auth_players";
    
    require_once('lib/functions.php');
    
    /**
     * WordPress Hashing
     */
     
    require_once('lib/wp_password_hash.php');
    $wp_hasher = new PasswordHash(8, true);
    
    /**
     * MYSQL
     */
    
    $mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
    
    if ($mysqli->connect_errno) {
        dir("�� ������� ������������ � MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
    }
    