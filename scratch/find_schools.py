import re

with open('FRONTEND/html/sekolah-juara.html', encoding='utf-8') as f:
    text = f.read()

# find all school blocks: e.g. <div class="sj-unit-card" or similar
# let's find all pairs of (school_name, daftar_link, brosur)
items = re.findall(r'(<article[^>]*?>.*?</article>|<div[^>]*?class=[\'"][^\'"]*?(?:card|unit)[^\'"]*?[\'"][^>]*?>.*?</div>)', text, re.DOTALL | re.IGNORECASE)

# Or simply regex for data-school-name or title and href
schools = []
matches = re.finditer(r'<h3[^>]*?class=[\'"][^\'"]*?title[^\'"]*?[\'"][^>]*?>(.*?)</h3>.*?<a[^>]*?class=[\'"][^\'"]*?sj-btn-brosur[^\'"]*?[\'"][^>]*?(?:data-brosur-file=[\'"]([^\'"]*)[\'"])?.*?data-brosur-slug=[\'"]([^\'"]*)[\'"].*?<a[^>]*?class=[\'"][^\'"]*?sj-btn-daftar[^\'"]*?[\'"][^>]*?href=[\'"]([^\'"]*)[\'"]', text, re.DOTALL | re.IGNORECASE)

count = 0
for m in matches:
    count += 1
    name = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    brosur = m.group(2) or ''
    slug = m.group(3) or ''
    daftar = m.group(4) or ''
    print(f"{count}. Name: {name} | Slug: {slug} | Daftar: {daftar} | Brosur: {brosur}")

if count == 0:
    # let's inspect the cards simpler
    blocks = re.findall(r'(<div class="sj-card"[^>]*>.*?</div>\s*</div>\s*</div>)', text, re.DOTALL)
    print("Found cards blocks:", len(blocks))
    for b in re.findall(r'<div class="sj-grid".*?</section>', text, re.DOTALL):
        print("Grid found")

