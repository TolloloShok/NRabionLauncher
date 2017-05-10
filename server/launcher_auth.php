<?php
    
    /**
     * LAUNCHER LOGIC
     */
    
    require_once('config.php');
    
    if (!isset($_GET['action'])) {
        die();
    }
    
    $action = $_GET['action'];
    
    switch ($action) {
        
        // Launcher-side: Register
        
        /*case "register":
            if (isset($_POST['username']) && isset($_POST['password'])) {
                $username = $_POST['username'];
                $password = get_pass_hash($_POST['password']);
                $uuid = uuid_from_nickname($username);
                
                if (!preg_match("/^[a-zA-Z0-9_]+$/", $username)) {
                    die('{"success": false, "errorMessage": "Некорректный никнейм! Разрешены символы: a-z, A-Z, 0-9 и _"}');
                }
                
                // Check user exists
                $stmt = $mysqli->prepare("SELECT `id` FROM {$DB_TABLE} WHERE `username` = ?");
                $stmt->bind_param("s", $username);
                if ($stmt->execute()) {
                    $res = $stmt->get_result();
                    $item = $res->fetch_array(MYSQLI_ASSOC);
                    
                    if ($item) {
                        die('{"success": false, "errorMessage": "Такой пользователь уже существует!"}');
                    }
                }
                
                $stmt = $mysqli->prepare("INSERT INTO {$DB_TABLE}(`username`, `password`, `uuid`) VALUES (?, ?, ?)");
                $stmt->bind_param("sss", $username, $password, $uuid);
                
                if ($stmt->execute()) {
                    die('{"success": true}');
                } else {
                    die('{"success": false, "errorMessage": "Ошибка при запросе к БД!"}');
                }
            } else {
                die('{"success": false, "errorMessage": "Некорректный запрос!"}');
            }
            break;*/
        
        // Launcher-side: Login
        
        case "login":
            if (isset($_POST['username']) && isset($_POST['password'])) {
                $username = $_POST['username'];
                $password = $_POST['password'];
                
                if (!preg_match("/^[a-zA-Z0-9_]+$/", $username)) {
                    die('{"success": false, "errorMessage": "Некорректный никнейм! Разрешены символы: a-z, A-Z, 0-9 и _"}');
                }
                
                $stmt = $mysqli->prepare("SELECT `user_login`, `password` FROM {$DB_TABLE_WP_USERS} WHERE `user_login` = ?");
                $stmt->bind_param("s", $username);
                
                if ($stmt->execute()) {
                    $res = $stmt->get_result();
                    $item = $res->fetch_array(MYSQLI_ASSOC);
                    
                    if ($item && check_pass_hash($password, $item["password"])) {
                        $user_name = $item["user_login"];
                        $access_token = generate_access_token();
                        $uuid = uuid_from_nickname($user_name);
                        
                        // Check if exists row
                        $stmt = $mysqli->prepare("SELECT `id`, `uuid` FROM {$DB_TABLE} WHERE `username` = ?");
                        $stmt->bind_param("s", $user_name);
                        $stmt->execute();
                        $res = $stmt->get_result();
                        
                        // If exists
                        if ($res->num_rows > 0) {
                            $item = $res->fetch_array(MYSQLI_ASSOC);
                            
                            // Rewrite $uuid
                            $uuid = $item["uuid"];
                            
                            // Update access token
                            $stmt = $mysqli->prepare("UPDATE {$DB_TABLE} SET `accessToken` = ? WHERE `id` = ?");
                            $stmt->bind_param("si", $access_token, $item["id"]);
                            $stmt->execute();
                        } else {
                            $stmt = $mysqli->prepare("INSERT INTO {$DB_TABLE}(`username`, `accessToken`, `uuid`) VALUES (?, ?, ?)");
                            $stmt->bind_param("sss", $user_name, $access_token, $uuid);
                            $stmt->execute();
                        }
                        
                        die(json_encode(array(
                            "success" => true,
                            "accessToken" => $access_token,
                            "username" => $user_name,
                            "uuid" => $uuid
                        )));
                    } else {
                        die('{"success": false, "errorMessage": "Ошибка в имени пользователя или пароле!"}');
                    }
                } else {
                    die('{"success": false, "errorMessage": "Ошибка при запросе к БД!"}');
                }
            } else {
                die('{"success": false, "errorMessage": "Некорректный запрос!"}');
            }
            break;
    }
    