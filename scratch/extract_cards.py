import re

with open('FRONTEND/html/sekolah-juara.html', encoding='utf-8') as f:
    html = f.read()

cards = html.split('<div class="sj-school-card">')[1:]
print(f"Total school cards: {len(cards)}")

schools = []
for i, card in enumerate(cards):
    title_m = re.search(r'<h3 class="sj-school-name">(.*?)</h3>', card)
    title = title_m.group(1).strip() if title_m else f"SD Juara {i+1}"
    
    loc_m = re.search(r'<span class="sj-school-location-text">(.*?)</span>', card) or re.search(r'<div class="sj-school-location">([\s\S]*?)</div>', card)
    loc = re.sub(r'<[^>]+>', '', loc_m.group(1)).strip() if loc_m else ""
    
    daftar_m = re.search(r'<a href="([^"]+)"[^>]*?class="sj-btn-daftar"', card)
    daftar = daftar_m.group(1).strip() if daftar_m else ""
    
    slug_m = re.search(r'data-brosur-slug="([^"]+)"', card)
    slug = slug_m.group(1).strip() if slug_m else ""
    
    brosur_file_m = re.search(r'data-brosur-file="([^"]+)"', card)
    brosur_file = brosur_file_m.group(1).strip() if brosur_file_m else ""

    schools.append({
        'name': title,
        'location': loc,
        'slug': slug,
        'daftar_link': daftar,
        'brosur_link': f"sekolah-juara.html?brosur={slug}"
    })
    print(f"{i+1}. {title} ({loc})")
    print(f"   Daftar: {daftar}")
    print(f"   Brosur: sekolah-juara.html?brosur={slug}\n")

import json
with open('scratch/all_schools.json', 'w', encoding='utf-8') as out:
    json.dump(schools, out, indent=2)

