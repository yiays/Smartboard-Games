<?php
// Generates list in JSON of stock images for use in storyshuffle

$dir = '../img/stock/';
$root = '/img/stock/';
$files = scandir($dir);

$out = [];
foreach($files as &$file) {
  if(strpos($file, '.') > 0)
    $out []= "$root$file";
}

file_put_contents('storyimgs.json', json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
?>