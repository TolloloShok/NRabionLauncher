<?php

    /**
     * CORE FUNCTIONS
     */
    
    // fucking sashok launcher, bad md5 algorithm
    function uuidFromString($string) {
        $val = md5($string, true);
        $byte = array_values(unpack('C16', $val));
     
        $tLo = ($byte[0] << 24) | ($byte[1] << 16) | ($byte[2] << 8) | $byte[3];
        $tMi = ($byte[4] << 8) | $byte[5];
        $tHi = ($byte[6] << 8) | $byte[7];
        $csLo = $byte[9];
        $csHi = $byte[8] & 0x3f | (1 << 7);
     
        if (pack('L', 0x6162797A) == pack('N', 0x6162797A)) {
            $tLo = (($tLo & 0x000000ff) << 24) | (($tLo & 0x0000ff00) << 8) | (($tLo & 0x00ff0000) >> 8) | (($tLo & 0xff000000) >> 24);
            $tMi = (($tMi & 0x00ff) << 8) | (($tMi & 0xff00) >> 8);
            $tHi = (($tHi & 0x00ff) << 8) | (($tHi & 0xff00) >> 8);
        }
     
        $tHi &= 0x0fff;
        $tHi |= (3 << 12);
       
        $uuid = sprintf(
            '%08x-%04x-%04x-%02x%02x-%02x%02x%02x%02x%02x%02x',
            $tLo, $tMi, $tHi, $csHi, $csLo,
            $byte[10], $byte[11], $byte[12], $byte[13], $byte[14], $byte[15]
        );
        return $uuid;
    }
    
    // fucking minecraft client, send invalid UUID
    function getCorrectUUID($uuid) {
        if (strpos($uuid, "-") === false) {
            return sprintf("%s-%s-%s-%s-%s",
                substr($uuid, 0, 8),
                substr($uuid, 8, 4),
                substr($uuid, 12, 4),
                substr($uuid, 16, 4),
                substr($uuid, 20, 12));
        }
        return $uuid;
    }
    
    function get_pass_hash($pass) {
        global $wp_hasher;
        return $wp_hasher->HashPassword(trim($pass));
    }
    
    function check_pass_hash($pass, $hash) {
        global $wp_hasher;
        return $wp_hasher->CheckPassword($pass, $hash);
    }
    
    function generate_access_token() {
        $first_part = rand(1000000000, 2147483647) . rand(1000000000, 2147483647);
        $second_part = rand(1000000000, 2147483647) . rand(1000000000, 2147483647);
        $full_part = md5($first_part) . md5($second_part);
        return str_shuffle($full_part);
    }
    
    function uuid_from_nickname($string) {
        $string = uuidFromString("OfflinePlayer:" . $string);
        return $string;
    }