<?php
/**
  * Copyright (C) 2016 omnizya.com
  * api.php
  *
  * changelog
  * 2016-11-04[14:26:39]:revised
  *
  * @author moughamir@gmail.com
  * @version 0.1.0
  * @since 0.1.0
  */

/* Db connection*/
$mysql_server = "localhost";
$mysql_user = "root";
$mysql_password = "";
$mysql_db = "myastro";

$db= new mysqli($mysql_server, $mysql_user, $mysql_password, $mysql_db);
if ($db->connect_errno) {
	printf("Connection failed: %s \n", $db->connect_error);
	exit();
}
$db->set_charset("utf8");
$q="SELECT * FROM tarot";
if ($tarot =  $db->query($q)) {

	/*$cards =  array();*/

/*	while ($row = $tarot->fetch_assoc()) {
	 $cards[] = $row;
	 $fp = fopen('cards.json', 'w');
	 fwrite($fp, json_encode($cards));
	 fclose($fp);
	}

	$tarot->free();*/

	while ($obj = $tarot->fetch_object()) {

		
	    echo json_encode($obj);
	}
	$tarot->close();
}
$db->close();



?>