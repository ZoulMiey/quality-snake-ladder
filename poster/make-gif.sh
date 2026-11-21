#!/usr/bin/env bash
# Builds the two animated GIFs from the frames that `node shoot.cjs "$PWD" gif` writes.
set -e
cd "$(dirname "$0")/out"
for spec in "poster-A4:800" "poster-wide:1280"; do
  IFS=: read n w <<< "$spec"
  ffmpeg -loglevel error -y -framerate 12 -i "frames-$n/f%03d.png" \
    -vf "scale=$w:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" \
    -loop 0 "$n.gif"
done
rm -rf frames-poster-A4 frames-poster-wide
