"""Génère la musique et les bruitages de La Grande Feuille avec l'API ElevenLabs.

Usage : python tools/gen_audio.py [sfx|atelier|music|all]
Clé lue dans la variable d'environnement ELEVENLABS_API_KEY.
Les fichiers bruts vont dans assets/audio/raw/, les fichiers finaux (mp3 + ogg)
dans assets/audio/, après passage dans ffmpeg (silence de tête retiré, durée,
crête à -3 dBFS pour les bruitages, -16 LUFS pour la musique).
"""
import json, os, re, subprocess, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "assets", "audio", "raw")
OUT = os.path.join(ROOT, "assets", "audio")
KEY = os.environ["ELEVENLABS_API_KEY"]
LOG = os.path.join(ROOT, "assets", "audio", "provenance.json")

SFX = [
    # nom, prompt, durée cible (s), variantes
    ("sfx_pose", "small brass instrument set down on a wooden desk, soft thud", 0.3, "abc"),
    ("sfx_clic", "metal plug snapping into a socket, crisp click", 0.15, "abc"),
    ("sfx_cran", "single detent of a knurled brass dial turning one notch, tiny mechanical tick", 0.2, "abc"),
    ("sfx_manivelle", "hand crank turning on a small copper machine, smooth ratchet", 1.0, ""),
    ("sfx_remplir", "several small brass parts clicking into slots at the same instant", 0.4, ""),
    ("sfx_serrure", "key turning in a brass lock, satisfying unlock click", 0.5, ""),
    ("sfx_tuyau", "soft pneumatic puff, paper card sliding out of a slot", 0.5, "ab"),
    ("sfx_bloque", "key jamming in a lock, dull rattle, mechanism refusing", 0.5, ""),
    ("sfx_engrenages", "small brass gears spinning behind glass, fine clockwork whir", 1.5, ""),
    ("sfx_capsule", "soft magnetic snap, small capsule closing", 0.35, ""),
    ("sfx_fissure", "thin glass capsule cracking open gently", 0.25, ""),
    ("sfx_loupe", "quick paper flip, light swish", 0.2, "ab"),
    ("sfx_cible", "bright chime, a line completed on paper, single clear bell tone", 0.6, ""),
    ("sfx_pliage", "large sheet of paper folded several times", 1.2, ""),
    ("sfx_gravure", "engraving stylus on a metal plate, short scratch", 0.8, ""),
    ("sfx_etoile", "rubber stamp pressed firmly on paper, single thump", 0.3, "abc"),
    ("sfx_couvercle", "small blued steel box lid closing shut, soft metallic clack after a short hinge creak", 0.6, ""),
]

# Les bruitages propres à l'atelier Bric & Clé (étape 3 de la refonte) : python tools/gen_audio.py atelier
ATELIER = [
    ("sfx_clac", "small brass spring-loaded latch snapping shut on a lacquered wooden toy, bright crisp clack", 0.25, "ab"),
    ("sfx_declic", "small brass latch released on a wooden toy, soft spring tick then a tiny metal rattle", 0.3, ""),
    ("sfx_goupille", "tiny brass lock pin dropping into place, very short high metallic tick", 0.12, "abc"),
    ("sfx_pop", "cork popping out of a small glass bottle, light playful pop", 0.3, ""),
    ("sfx_boing", "small toy spring boing, short and dry, comic but subtle", 0.45, ""),
    ("sfx_vernis", "short aerosol spray burst, soft pschht of varnish on wood", 0.45, ""),
    ("sfx_rivet", "small hammer tapping a brass rivet once, short bright metallic tap", 0.25, ""),
    ("sfx_levier", "wooden lever pulled down on a toy machine, solid chunky clack with a brief ratchet", 0.6, ""),
    ("sfx_aspire", "small mechanical cradle grabbing a wooden toy, quick suction then a metal latch click", 0.3, ""),
    ("sfx_remontoir", "tin toy wind-up key turned several times, tightening ratchet clicks, then a short clockwork whirr", 1.4, ""),
    ("sfx_velours", "small wooden toy dropped into a padded velvet jewelry box, soft but clearly audible thud, close microphone", 0.35, ""),
    ("sfx_tampon", "rubber stamp slammed on a cardboard tag, firm dry thump", 0.35, ""),
    ("sfx_domino", "single small wooden domino tipping over onto another, tiny clack", 0.15, "abc"),
    ("sfx_rembobine", "small tape spool rewinding quickly, light mechanical whirr", 0.45, ""),
    ("sfx_copeaux", "handful of wood shavings swept into a bin, light dry rustle", 0.6, ""),
    ("sfx_rangement", "wooden toy pieces swept off a workbench into a wooden box, gentle clatter", 0.9, ""),
    ("sfx_cloche", "small brass desk bell, single clear ding", 1.0, ""),
    ("sfx_miroir", "row of small wooden tiles flipping over in a quick cascade, light clatter", 0.5, ""),
    ("sfx_dore", "soft sparkling chime, tiny glockenspiel shimmer, warm and magical", 0.7, ""),
]

MUSIC = [
    ("mus_titre", 80, "instrumental, no vocals, gentle chamber piece, felt piano, celesta, pizzicato strings, soft ticking clockwork percussion, curious and warm, 1920s study room, 84 BPM"),
    ("mus_atelier", 150, "instrumental, no vocals, calm focus loop, felt piano and marimba, light clockwork ticks, sparse, unhurried, thinking music, no drums, 80 BPM"),
    ("mus_atelier_2", 150, "instrumental, no vocals, focused loop with gentle forward motion, felt piano, celesta, pizzicato cello, soft mechanical rhythm, slightly more intricate, 90 BPM"),
    ("mus_defi", 150, "instrumental, no vocals, quiet tension, low strings drone, music box motif, ticking clock, patient and mysterious, 72 BPM"),
    ("mus_victoire", 10, "instrumental, no vocals, short triumphant sting, celesta and brass, warm resolution, ends cleanly"),
]


def post(url, body, dest):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                data = r.read()
            with open(dest, "wb") as f:
                f.write(data)
            return True
        except urllib.error.HTTPError as e:
            print("  HTTP", e.code, e.read()[:300], flush=True)
            if e.code in (400, 401, 402, 403, 422):
                return False
        except Exception as e:  # réseau
            print("  erreur", e, flush=True)
        time.sleep(3 * (attempt + 1))
    return False


def ff(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def max_volume(path):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.search(r"max_volume: (-?[\d.]+) dB", p.stderr)
    return float(m.group(1)) if m else 0.0


def finish_sfx(raw, name, dur):
    tmp = os.path.join(RAW, name + "_trim.wav")
    fade = min(0.08, dur * 0.4)
    ff("-i", raw, "-af",
       f"silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.005,"
       f"atrim=0:{dur:.3f},afade=t=out:st={max(0, dur - fade):.3f}:d={fade:.3f}", tmp)
    gain = -3.0 - max_volume(tmp)
    for ext, codec in (("mp3", ["-c:a", "libmp3lame", "-b:a", "160k"]), ("ogg", ["-c:a", "libvorbis", "-q:a", "5"])):
        ff("-i", tmp, "-af", f"volume={gain:.2f}dB", *codec, os.path.join(OUT, f"{name}.{ext}"))
    os.remove(tmp)


def finish_music(raw, name, dur=None):
    af = "loudnorm=I=-16:TP=-1.5:LRA=11"
    if dur:
        af = f"atrim=0:{dur},afade=t=out:st={dur - 1.2}:d=1.2," + af
    for ext, codec in (("mp3", ["-c:a", "libmp3lame", "-b:a", "192k"]), ("ogg", ["-c:a", "libvorbis", "-q:a", "6"])):
        ff("-i", raw, "-af", af, "-ar", "44100", *codec, os.path.join(OUT, f"{name}.{ext}"))


def log(entry):
    data = json.load(open(LOG, encoding="utf-8")) if os.path.exists(LOG) else []
    data = [d for d in data if d["file"] != entry["file"]] + [entry]
    json.dump(data, open(LOG, "w", encoding="utf-8"), indent=1, ensure_ascii=False)


def gen_sfx(liste=SFX):
    for name, prompt, dur, variants in liste:
        for v in (variants or [""]):
            fname = f"{name}_{v}" if v else name
            raw = os.path.join(RAW, fname + ".mp3")
            if not os.path.exists(raw):
                print("sfx", fname, flush=True)
                gen = max(0.5, round(dur + 0.4, 1))
                ok = post("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
                          {"text": prompt, "duration_seconds": gen, "prompt_influence": 0.55}, raw)
                if not ok:
                    continue
            finish_sfx(raw, fname, dur)
            log({"file": fname, "tool": "ElevenLabs sound-generation", "prompt": prompt,
                 "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")})


def gen_music():
    for name, secs, prompt in MUSIC:
        raw = os.path.join(RAW, name + ".mp3")
        if not os.path.exists(raw):
            print("music", name, flush=True)
            ok = post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192",
                      {"prompt": prompt, "music_length_ms": max(10000, secs * 1000),
                       "model_id": "music_v1", "force_instrumental": True}, raw)
            if not ok:
                continue
        finish_music(raw, name, 8 if name == "mus_victoire" else None)
        log({"file": name, "tool": "ElevenLabs Music (music_v1)", "prompt": prompt,
             "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")})


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("sfx", "all"):
        gen_sfx()
    if what in ("atelier", "all"):
        gen_sfx(ATELIER)
    if what in ("music", "all"):
        gen_music()
    print("fini", flush=True)
