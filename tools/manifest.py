"""Écrit assets/manifest.json : la liste des médias présents. Le jeu dessine un substitut pour tout le reste."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def liste(d, exts):
    p = os.path.join(ROOT, 'assets', d)
    return sorted(f for f in os.listdir(p) if os.path.splitext(f)[1].lower() in exts) if os.path.isdir(p) else []
m = {'img': liste('img', {'.png', '.webp', '.jpg'}), 'audio': liste('audio', {'.mp3', '.ogg'})}
json.dump(m, open(os.path.join(ROOT, 'assets', 'manifest.json'), 'w'), indent=1)
print(len(m['img']), 'images,', len(m['audio']), 'sons')
