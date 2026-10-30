import re, json

with open('FRONTEND/html/sekolah-juara.html', encoding='utf-8') as f:
    html = f.read()

# Let's find all cards
cards = re.findall(r'<div class="sj-card"[^>]*>([\s\S]*?)</div>\s*</div>\s*</div>', html)
print(f"Total cards regex: {len(cards)}")

results = []
# Find each card with school name and buttons
matches = re.finditer(r'<h3 class="sj-card-title">([\s\S]*?)</h3>[\s\S]*?<div class="sj-card-location">([\s\S]*?)</div>[\s\S]*?<a [^>]*?class="[^"]*?sj-btn-brosur[^"]*?"[^>]*?data-brosur-slug="([^"]+)"[\s\S]*?<a [^>]*?class="[^"]*?sj-btn-daftar[^"]*?"[^>]*?href="([^"]+)"', html)

for m in matches:
    name = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    loc = re.sub(r'<[^>]+>', '', m.group(2)).strip()
    slug = m.group(3).strip()
    daftar = m.group(4).strip()
    results.append({
        'name': name,
        'location': loc,
        'slug': slug,
        'brosur_link': f"sekolah-juara.html?brosur={slug}",
        'daftar_link': daftar
    })

print(f"Matched {len(results)} schools:")
for r in results:
    print(r)

with open('scratch/sj_schools.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, indent=2)

