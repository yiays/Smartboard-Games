#!/bin/bash

### Available audio filters for the audio pipeline
# Remove any silence longer than 0.1s from the start of the sample
f_startsilenceremoval="silenceremove=start_periods=1:start_duration=0.1:start_threshold=-54.2dB:detection=peak,aformat=dblp"
# Reuse the same silence removal filter, but at the end of the sample
f_endsilenceremoval="areverse,$f_startsilenceremoval,areverse"
# Compress the dynamic range of the sample
f_compressor="acompressor=threshold=-15dB:ratio=3:attack=100:release=500"

readarray -d '' files < <(find . -type f -regextype posix-extended -regex '^.*\.raw\.(ogg|oga|mp3|wav)$' -print0)
len=${#files[@]}
len=$((len - 1))
for i in $(seq $len); do
  # trim silence
	file=${files["$i"]}
  newfile="${file%.*.*}.ogg"

  # First pass, get the peak volume for amplification
  peak_vol=$(ffmpeg -hide_banner -i "$file" -af volumedetect -vn -f null - 2>&1 | grep -oP "(?<=max_volume:\s-)[^dB]+" | tr -d '[:space:]')
  f_amplify="volume=+${peak_vol:-0}"dB

  # Second pass, apply audio filters
  ffmpeg -v error -i "$file" \
    -af "$f_startsilenceremoval,$f_endsilenceremoval,$f_compressor,$f_amplify" \
    -y "$newfile"
  
  # Third pass, graph spectrographs for a quick quality assessment
  comparefile="${newfile%.*}.compare.png"
  ffmpeg -v error -i "$file" -i "$newfile" \
    -filter_complex "[0:a]showwavespic=s=800x200:colors=gray[v1];[1:a]showwavespic=s=800x200:colors=red[v2];[v1][v2]vstack=inputs=2[out]" \
    -frames:v 1 -map "[out]" -y "$comparefile"

done