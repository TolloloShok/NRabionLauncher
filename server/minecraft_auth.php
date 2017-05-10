<?php
    
    /**
     * MINECRAFT LOGIC
     */
    
    if (!isset($_GET['action'])) {
        die();
    }
    
    $action = $_GET['action'];
    
    switch ($action) {
        
        // Client-side: join
        
        case "join":
            // Проверяем, что мы получили POST-запрос с JSON-содержимым
            if (($_SERVER['REQUEST_METHOD'] == 'POST') && (stripos($_SERVER["CONTENT_TYPE"], "application/json") === 0)) {
                $strData = file_get_contents('php://input');
                $data = json_decode($strData, TRUE);
                $access_token = $data["accessToken"];
                $selected_profile = $data["selectedProfile"];
                $server_id = $data["serverId"];
                
                $stmt = $mysqli->prepare("SELECT `id` FROM {$DB_TABLE} WHERE `uuid` = ? AND `accessToken` = ?");
                $stmt->bind_param("ss", $selected_profile, $access_token);
                
                if ($stmt->execute()) {
                    $res = $stmt->get_result();
                    $item = $res->fetch_array(MYSQLI_ASSOC);
                    
                    if ($item) {
                        // Update serverId token
                        $stmt = $mysqli->prepare("UPDATE {$DB_TABLE} SET `serverID` = ? WHERE `id` = ?");
                        $stmt->bind_param("si", $server_id, $item["id"]);
                        $stmt->execute();
                        die();
                    } else {
                        die('{"error": "Auth error", "errorMessage": "Authorization error! Please relogin!", "cause": "Auth error"}');
                    }
                } else {
                    die('{"error": "Auth error", "errorMessage": "Error query DB!", "cause": "Auth error"}');
                }
            } else {
                die('{"error": "Auth error", "errorMessage": "Invalid request! Use POST request and content-type application/json.", "cause": "Auth error"}');
            }
            break;
            
        // Server-side: hasJoined
        
        case "hasJoined":
            if (isset($_GET['username']) && isset($_GET['serverId'])) {
                $username = $_GET['username'];
                $server_id = $_GET["serverId"];
                
                $stmt = $mysqli->prepare("SELECT `username`, `uuid`, `skin`, `cloak` FROM {$DB_TABLE} WHERE `username` = ? AND `serverID` = ?");
                $stmt->bind_param("ss", $username, $server_id);
                
                if ($stmt->execute()) {
                    $res = $stmt->get_result();
                    $item = $res->fetch_array(MYSQLI_ASSOC);
                    
                    if ($item) {
                        $textures = array("SKIN" => array("url" => $item["skin"]));
                        
                        // If cloak exists then add to textures
                        if (strlen(trim($item["cloak"])) > 0) {
                            $textures["CAPE"] = array("url" => $item["cloak"]);
                        }
                        
                        $properties = array(
                            "timestamp" => time(),
                            "profileId" => $item["uuid"],
                            "profileName" => $item["username"],
                            "textures" => $textures
                        );
                        
                        $user_data = array(
                            "id" => $item["uuid"],
                            "name" => $item["username"],
                            "properties" => array(
                                array(
                                    "name" => "textures",
                                    "value" => base64_encode(json_encode($properties))
                                )
                            )
                        );
                        
                        die(json_encode($user_data));
                    } else {
                        die();
                    }
                }
                die();
                
            }
            break;
            
    }
    