# Gera os sprites do Explorar (public/pixel/) a partir dos pacotes CC0 da Kenney.
# Uso (precisa de Pillow): python scripts/pixel-art.py <pasta Tiny Town> <pasta Tiny Dungeon>
#   Tiny Town 1.1:   https://kenney.nl/assets/tiny-town
#   Tiny Dungeon:    https://kenney.nl/assets/tiny-dungeon
# Rodar de novo só se mudar a cor de uma área (data/categories.json) ou a composição abaixo.
import json, os, sys
from PIL import Image

town_dir, dungeon_dir = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'public', 'pixel')
os.makedirs(out, exist_ok=True)
cats = json.load(open(os.path.join(root, 'data', 'categories.json'), encoding='utf-8'))

def sheet(d):
    return Image.open(os.path.join(d, 'Tilemap', 'tilemap_packed.png')).convert('RGBA')
town, dungeon = sheet(town_dir), sheet(dungeon_dir)

def tile(s, i):
    r, c = divmod(i, 12)
    return s.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16))

def compose(s, rows):
    im = Image.new('RGBA', (len(rows[0]) * 16, len(rows) * 16))
    for y, row in enumerate(rows):
        for x, i in enumerate(row):
            if i is not None:
                im.alpha_composite(tile(s, i), (x * 16, y * 16))
    return im

hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
mix = lambda a, b, t: tuple(round(a[k] * (1 - t) + b[k] * t) for k in range(3))
OUTLINE = (63, 38, 49)
ROOF = {(90, 105, 136): 'dark', (139, 155, 180): 'mid', (192, 203, 220): 'light'}
GLASS = {(192, 203, 220), (139, 155, 180)}
LIT = {(192, 203, 220): (255, 214, 120), (139, 155, 180): (236, 158, 74)}

def night(px):
    r, g, b = px[:3]
    return (round(r * 0.5), round(g * 0.52), min(255, round(b * 0.66 + 16)), px[3])

def to_night(im, keep=frozenset()):
    im = im.copy(); p = im.load()
    for y in range(im.height):
        for x in range(im.width):
            if p[x, y][3] and (x, y) not in keep:
                p[x, y] = night(p[x, y])
    return im

# Prédio 4x3 tiles: telhado (2 linhas, recolorido na cor da área) + parede (madeira ou pedra).
WALLS = [  # (janela, parede, porta, canto, porta aberta)
    (84, 73, 85, 75, 74),
    (88, 77, 89, 79, 78),
]
glass_mask = [(x, y) for y in range(16) for x in range(16) if tile(town, 84).getpixel((x, y))[:3] in GLASS and 3 <= x <= 12 and 3 <= y <= 12]

def building(color, walls, open_door):
    win, wall, door, end, doorway = walls
    im = compose(town, [[48, 49, 50, 51], [60, 61, 62, 63], [win, wall, doorway if open_door else door, end]])
    shades = {'light': color, 'mid': mix(color, OUTLINE, 0.28), 'dark': mix(color, OUTLINE, 0.55)}
    p = im.load()
    for y in range(32):
        for x in range(64):
            k = ROOF.get(p[x, y][:3])
            if k and p[x, y][3]:
                p[x, y] = (*shades[k], 255)
    if open_door:  # interior escuro no vão da porta
        for y in range(32, 48):
            for x in range(32, 48):
                if p[x, y][3] == 0:
                    p[x, y] = (46, 30, 36, 255)
    return im

def building_night(day, open_door):
    keep = {(x, y + 32) for x, y in glass_mask}
    if open_door:
        keep |= {(x, y) for y in range(32, 48) for x in range(32, 48) if day.getpixel((x, y))[:3] == (46, 30, 36)}
    im = to_night(day, keep); p = im.load()
    for x, y in keep:
        c = p[x, y][:3]
        p[x, y] = (*(LIT.get(c) or ((236, 158, 74) if c == (46, 30, 36) else c)), 255)
    return im

for i, c in enumerate(cats):
    color = hexrgb(c['color'])
    w = WALLS[i % 2]
    frames = [building(color, w, False), building(color, w, True)]
    frames += [building_night(frames[0], False), building_night(frames[1], True)]
    strip = Image.new('RGBA', (256, 48))
    for f, im in enumerate(frames):
        strip.alpha_composite(im, (f * 64, 0))
    strip.save(os.path.join(out, f"b-{c['id']}.png"), optimize=True)

def save_pair(name, im):
    im.save(os.path.join(out, f'{name}.png'), optimize=True)
    to_night(im).save(os.path.join(out, f'{name}-night.png'), optimize=True)

grass = compose(town, [[0, 1, 0], [0, 0, 2], [1, 0, 0]])
dirt = tile(town, 25)
trees = compose(town, [[16, 28, 4, 5, 16, 27, 28, 29]])
save_pair('grass', grass)
save_pair('dirt', dirt)
save_pair('trees', trees)
npcs = compose(dungeon, [[85, 99]])
npcs.save(os.path.join(out, 'npcs.png'), optimize=True)

# Prévia estática da vila para a home (mesma grade do desktop: 4x2 lotes de 5x5 tiles, rua de 1 tile).
def village(is_night):
    U, cols, rows = 16, 4, 2
    w = U * 6 * cols
    h = U * (6 * rows) + 2 * U
    im = Image.new('RGBA', (w, h))
    g, d, tr = (to_night(x) if is_night else x for x in (grass, dirt, trees))
    for y in range(0, h, 48):
        for x in range(0, w, 48):
            im.alpha_composite(g, (x, y))
    for x in range(0, w, 128):
        im.alpha_composite(tr, (x, 0)); im.alpha_composite(tr, (x, h - U))
    top = U
    for y in range(top, top + U * 6 * rows, 16):
        for x in range(0, w, 16):
            im.alpha_composite(d, (x, y))
    plank = (118, 59, 54)
    for k, c in enumerate(cats):
        cx, cy = k % cols, k // cols
        lx, ly = U // 2 + cx * 6 * U, top + U // 2 + cy * 6 * U
        for y in range(ly, ly + 5 * U, 16):
            for x in range(lx, lx + 5 * U, 16):
                im.alpha_composite(g, (x, y), (0, 0, 16, 16))
        b = Image.open(os.path.join(out, f"b-{c['id']}.png")).crop((128 if is_night else 0, 0, (128 if is_night else 0) + 64, 48))
        im.alpha_composite(b, (lx + 8, ly + 8))
        sign = Image.new('RGBA', (40, 10), (*plank, 255))
        sign.paste((*OUTLINE, 255), (0, 0, 40, 1)); sign.paste((*OUTLINE, 255), (0, 9, 40, 10))
        sign.paste((*OUTLINE, 255), (0, 0, 1, 10)); sign.paste((*OUTLINE, 255), (39, 0, 40, 10))
        im.alpha_composite(sign, (lx + 20, ly + 60))
    return im

village(False).save(os.path.join(out, 'village.png'), optimize=True)
village(True).save(os.path.join(out, 'village-night.png'), optimize=True)
print('ok', sorted(os.listdir(out)))
