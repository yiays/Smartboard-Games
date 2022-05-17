<?php
// Generates list in JSON of storyshuffle images

$dir = 'storyshuffle/';
$root = '/english/';
$files = scandir($dir);

$out = [];
foreach($files as &$file) {
  if(strpos($file, '.') > 0)
    $out []= "$root$dir$file";
}

file_put_contents('storyimgs.json', json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
?>