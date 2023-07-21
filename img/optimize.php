<?php
// Optimize any images added to the stock image collection

$dir = '/stockimgs/';
$files = scandir($dir);

foreach($files as $filename) {
  if(!str_starts_with($filename, '.') && !str_ends_with($filename, '.gif') && !str_ends_with($filename, '.svg') && !str_ends_with($filename, '.webp')) {
    $im = imagecreatefrompng($dir.$filename);
    imagepalettetotruecolor($im);
    $ofilename = $filename;
    $filename = explode('.', $ofilename);
    array_pop($filename);
    $filename = implode('.', $filename).'.webp';
    if(imagewebp($im, $dir.$filename)) {
      unlink($dir.$ofilename);
    }else{
      unlink($dir.$filename);
    }
  }
}
?>