<?php
$q = strtolower($_GET["q"]);
if (!$q) return;
$items = array(
	"Peter Pan"=>"peter@pan.de",
	"Molly"=>"molly@yahoo.com",
	"Forneria Marconi"=>"live@japan.jp",
	"Master Sync"=>"205bw@samsung.com",
	"Dr. Tech de Log"=>"g15@logitech.com",
	"Don Corleone"=>"don@vegas.com",
	"Mc Chick"=>"info@donalds.org",
	"Donnie Darko"=>"dd@timeshift.info",
	"Quake The Net"=>"webmaster@quakenet.org",
	"Dr. Write"=>"write@writable.com"
);

$result = array();
foreach ($items as $key=>$value) {
	if (strpos(strtolower($key), $q) !== false) {
		array_push($result, array(
			"name" => $key,
			"to" => $value
		));
	}
}
echo json_encode($result);
?>