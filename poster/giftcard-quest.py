"""E-Games gift cards for places 1-5 (Quality Quest, or another game with GAME=...), from giftcard-quest.html.
Trophy and big number: 1 gold, 2 silver, 3 bronze, 4-5 blue crystal.
Writes out/giftcard-<slug>-noN.png + .pdf and out/giftcard-<slug>-no1-5.pdf.
Run in poster/: python3 giftcard-quest.py   or   GAME="Quality Word Search" python3 giftcard-quest.py"""
import os, subprocess
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
base = open("giftcard-quest.html").read()
GAME = os.environ.get("GAME", "Quality Quest")
slug = GAME.lower().replace(" ", "-")
if GAME != "Quality Quest":
    base = base.replace(">QUALITY QUEST<", f">{GAME.upper()}<").replace("Quality Quest Gift Card", f"{GAME} Gift Card")
    if len(GAME) > 14: base = base.replace("font-size:50px;letter-spacing:6px;color:#bfe3ff", "font-size:44px;letter-spacing:4px;color:#bfe3ff")
# (light, mid, dark, deep), (H left, H mid, H right), outline, plate text, star fill, star line, glow rgb, text-gradient
M = {
  "gold":   None,
  "silver": (("#ffffff", "#e3eaf3", "#9aabc2", "#55647c"), ("#7d8ca3", "#f4f7fb", "#8495ad"), "#3e4a5c", "#e8eef7", "#ffffff", "#8a9bb3", "220,232,250",
             "linear-gradient(180deg,#ffffff 0%,#eef3f9 35%,#a9b8cc 52%,#5d6c84 58%,#d5dfec 78%,#ffffff 100%)", "#2f3a4c"),
  "bronze": (("#ffe6cc", "#eaa166", "#b5662d", "#6e3a14"), ("#8a4a1c", "#f5bb88", "#93511f"), "#4f2a0e", "#f6c39a", "#fff0e0", "#a45a25", "240,160,100",
             "linear-gradient(180deg,#fff0e0 0%,#f5bb88 35%,#c9773a 52%,#7a4116 58%,#e6a06a 78%,#ffe6cc 100%)", "#4a2508"),
  "blue":   (("#f0f9ff", "#8fd0ff", "#3a8ff0", "#123f9c"), ("#1d5fc0", "#cdeaff", "#2266c8"), "#0a2a66", "#cdeaff", "#ffffff", "#3a8ff0", "120,200,255",
             "linear-gradient(180deg,#ffffff 0%,#cdeaff 35%,#5aa8f5 52%,#1a4fae 58%,#9fd4ff 78%,#f0f9ff 100%)", "#08245c"),
}
PLACE = {1: ("gold", f"Champion of {GAME}!"), 2: ("silver", f"2nd place in {GAME}!"), 3: ("bronze", f"3rd place in {GAME}!"),
         4: ("blue", f"4th place in {GAME}!"), 5: ("blue", f"5th place in {GAME}!")}
pdfs = []
for n, (metal, line) in PLACE.items():
    s = base.replace(">No.1</text>", f">No.{n}</text>").replace(">No. 1</div>", f">No. {n}</div>").replace(">Champion of Quality Quest!</div>", f">{line}</div>")
    m = M[metal]
    if m:
        (l, mi, d, dp), (h1, h2, h3), ol, txt, star, starl, glow, tgrad, tshadow = m
        a = s.index('<symbol id="iTrophy"'); b = s.index("</symbol>", a)
        t = s[a:b].replace("url(#gGold)", "url(#gT)").replace("url(#gGoldH)", "url(#gTH)").replace("#6b4708", ol) \
            .replace('fill="#ffd76a"', f'fill="{txt}"').replace('fill="#fff6c4" stroke="#b9811c"', f'fill="{star}" stroke="{starl}"').replace("var(--gold2)", h2)
        grads = (f'<linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{l}"/><stop offset=".35" stop-color="{mi}"/>'
                 f'<stop offset=".6" stop-color="{d}"/><stop offset="1" stop-color="{dp}"/></linearGradient>'
                 f'<linearGradient id="gTH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{h1}"/><stop offset=".45" stop-color="{h2}"/><stop offset="1" stop-color="{h3}"/></linearGradient>')
        s = s[:a] + t + s[b:]
        s = s.replace("</defs>", grads + "</defs>", 1)
        s = s.replace("rgba(255,210,90,.55),rgba(255,190,60,.15)", f"rgba({glow},.55),rgba({glow},.15)")
        s = s.replace("</style>", f".no1{{background-image:{tgrad}!important;-webkit-text-stroke:2px rgba(255,255,255,.55)!important;"
                      f"filter:drop-shadow(0 4px 0 {tshadow}) drop-shadow(0 8px 12px rgba(0,0,0,.7)) drop-shadow(0 0 20px rgba({glow},.45))!important}}</style>", 1)
    f = f"_quest-no{n}.html"; open(f, "w").write(s)
    subprocess.run(["node", "giftcard.cjs", here], check=True, env={**os.environ, "FILE": f, "OUT": f"giftcard-{slug}-no{n}"})
    os.remove(f); pdfs.append(f"out/giftcard-{slug}-no{n}.pdf")
subprocess.run(["pdfunite", *pdfs, f"out/giftcard-{slug}-no1-5.pdf"], check=True)
