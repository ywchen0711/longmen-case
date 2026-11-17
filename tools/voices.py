"""Records every spoken line of both books in the characters' voices (edge-tts neural voices; adapted from the Wulin
Bricks tool) and writes how long each runs.

    node tools/lines.mjs > tools/lines.json
    PYTHONIOENCODING=utf-8 python tools/voices.py tools/lines.json     # -> audio/v/<id>.mp3 and audio/voices.json

Each character has a voice, a pitch and a speed; a feeling changes them a little. The myna is the voice it copies
(錢萬里's, or once 溫如玉's), pitched up, sped up and crushed a little. Existing files are kept, so a rerun only records
what is new. Needs edge-tts and ffmpeg.
"""
import asyncio, json, os, subprocess, sys

import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
VOICES = {  # cast id: (voice, pitch Hz, rate %). The storyteller narrates too.
    'narr': ('zh-CN-YunyangNeural', -4, -12), 'baixian': ('zh-CN-YunyangNeural', -2, -10),
    'yirui': ('zh-CN-YunxiNeural', -3, 0), 'yishuo': ('zh-CN-YunxiaNeural', 2, 4),
    'tie': ('zh-CN-YunyangNeural', -16, -8), 'xiaotian': ('zh-CN-YunjianNeural', -14, -6),
    'qian': ('zh-CN-YunjianNeural', 8, 6), 'wen': ('zh-CN-YunxiNeural', 9, -6),
    'shouhou': ('zh-CN-YunxiNeural', 18, 16), 'daoba': ('zh-CN-YunyangNeural', -20, 4),
    'kuchan': ('zh-CN-YunyangNeural', -26, -16), 'ferry': ('zh-CN-YunjianNeural', -22, -4),
    'liu': ('zh-CN-XiaoxiaoNeural', -6, -8), 'xiaolian': ('zh-CN-XiaoyiNeural', 12, 6),
    # book two
    'lihan': ('zh-CN-YunyangNeural', -22, -18), 'yuweng': ('zh-CN-YunjianNeural', -16, -4),
    'xuedao': ('zh-CN-YunxiNeural', -10, 6), 'guard': ('zh-CN-YunxiNeural', -6, 10), 'heixiong': ('zh-CN-YunjianNeural', -22, 4),
    'bandit': ('zh-CN-YunxiNeural', -4, 10), 'villager': ('zh-CN-YunxiNeural', 6, 12),
}
FEEL = {'happy': (5, 4), 'excited': (12, 12), 'laugh': (6, 6), 'surprised': (16, 10), 'scared': (12, 12), 'sad': (-10, -10), 'worried': (-4, -4),
        'thinking': (-6, -8), 'shy': (2, -8), 'angry': (6, 12), 'shout': (10, 14), 'calm': (0, -4), 'proud': (3, 2), 'poem': (-2, -14)}

async def say(text, voice, pitch, rate, path):
    await asyncio.wait_for(edge_tts.Communicate(text, voice, rate=f'{rate:+d}%', pitch=f'{pitch:+d}Hz').save(path), 40)
    if os.path.getsize(path) == 0: os.remove(path); raise RuntimeError('nothing came back')

def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    try: return round(float(r.stdout.strip()), 2)
    except ValueError: return 0

def birdify(path):
    tmp = path + '.tmp.mp3'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-af', 'asetrate=24000*1.25,aresample=24000,atempo=1.05,highpass=f=500,acrusher=bits=10:mix=0.35,volume=1.3', '-ac', '1', '-b:a', '48k', tmp], check=True)
    os.replace(tmp, path)

async def main():
    L = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'lines.json'), encoding='utf-8'))['lines']
    d = os.path.join(ROOT, 'audio', 'v'); os.makedirs(d, exist_ok=True)
    jp = os.path.join(ROOT, 'audio', 'voices.json')
    durs = json.load(open(jp, encoding='utf-8')) if os.path.exists(jp) else {}
    tp = os.path.join(HERE, 'voices_text.json'); texts = json.load(open(tp, encoding='utf-8')) if os.path.exists(tp) else {}
    for n, ln in enumerate(L):
        cast = ln['cast']; bird = cast == 'bird'
        if bird: cast = 'wen' if ln.get('soft') else 'qian'
        v, p, r = VOICES.get(cast, ('zh-CN-YunxiNeural', 0, 0)); fp, fr = FEEL.get(ln.get('feel') or '', (0, 0))
        if bird: p += 20; r += 6
        name = ln['id'] + '.mp3'; path = os.path.join(d, name)
        said = (ln['text'], v, p + fp, r + fr)
        changed = ln['id'] in texts and texts[ln['id']] != list(said)
        if changed or not (os.path.exists(path) and os.path.getsize(path) > 0 and name in durs):
            for attempt in range(6):
                try: await say(ln['text'], v, p + fp, r + fr, path); break
                except Exception as e: print('retry', ln['id'], e, flush=True); await asyncio.sleep(2)
            if bird: birdify(path)
            durs[name] = duration(path); texts[ln['id']] = list(said)
            if n % 10 == 0: json.dump(durs, open(jp, 'w', encoding='utf-8'))
        print(f"{n:4d} {durs.get(name, 0):5.2f}s {ln['cast']:9s} {ln['text'][:30]}", flush=True)
    json.dump(durs, open(jp, 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(texts, open(tp, 'w', encoding='utf-8'), ensure_ascii=False)

asyncio.run(main())
