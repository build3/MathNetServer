<?php
// db connection vars
// replace with values from physics secrets.js
$host = "";
$user = "";
$pass = "";
$db = "";
//absolute path to physics folder
$path = "";
// TODO: append class ID and datestamp csv filename
$fname = "logs.csv";
$fullName = $path.$fname;
$file = fopen($fullName,"w");

$connection = mysql_connect($host,$user,$pass); 
mysql_select_db($db,$connection);
// TODO: only query for logs from URL $_GET parameter classid
$mysql_string = "Select * from physics_logs";
$result = mysql_query($mysql_string);
fwrite($file,"log_id,student_name,log,date_created,class_id,group_id".PHP_EOL);
while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
    fwrite($file,$row["log_id"] .',"'. 
        $row["student_name"] .'","'. 
        $row["log"] .'","'. 
        $row["date_created"].'","'.
        $row["class_id"].'",'.
        $row["group_id"].PHP_EOL);
    }
fclose($file);
header('Content-Type: application/download');
header('Content-Disposition: attachment; filename="'.$fname.'"');
header("Content-Length: " . filesize($fullName));
$fp = fopen($fullName, "r");
fpassthru($fp);
fclose($fp);
?>