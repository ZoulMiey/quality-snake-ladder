#!/bin/sh
# Quality Quest (E-Games) gift cards for places 1-5, from giftcard-quest.html:
# out/giftcard-quality-quest-noN.png + .pdf, and all five in out/giftcard-quality-quest-no1-5.pdf.
set -e
cd "$(dirname "$0")"
T=$(mktemp -d)
for n in 1 2 3 4 5; do
  case $n in 1) line="Champion of Quality Quest!";; 2) line="2nd place in Quality Quest!";;
    3) line="3rd place in Quality Quest!";; *) line="${n}th place in Quality Quest!";; esac
  sed -e "s#>No.1</text>#>No.$n</text>#" -e "s#>No. 1</div>#>No. $n</div>#" \
      -e "s#>Champion of Quality Quest!</div>#>$line</div>#" giftcard-quest.html > _quest-no$n.html
  FILE=_quest-no$n.html OUT=giftcard-quality-quest-no$n node giftcard.cjs "$PWD"
  rm _quest-no$n.html
done
pdfunite out/giftcard-quality-quest-no1.pdf out/giftcard-quality-quest-no2.pdf out/giftcard-quality-quest-no3.pdf out/giftcard-quality-quest-no4.pdf out/giftcard-quality-quest-no5.pdf out/giftcard-quality-quest-no1-5.pdf
