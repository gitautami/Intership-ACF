from bs4 import BeautifulSoup
import json

with open('FRONTEND/html/sekolah-juara.html', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

cards = soup.select('.sj-card, [class*="school-card"], .sekolah-card')
if not cards:
    # let's find all daftar buttons and brosur buttons
    daftar_btns = soup.find_all('a', class_=lambda c: c and 'sj-btn-daftar' in c)
    brosur_btns = soup.find_all('a', class_=lambda c: c and 'sj-btn-brosur' in c)
    print(f"Found {len(daftar_btns)} daftar buttons and {len(brosur_btns)} brosur buttons.")
    
    # Let's inspect the cards containing them
    for d in daftar_btns:
        parent = d.find_parent(class_=lambda c: c and ('card' in c or 'item' in c or 'unit' in c)) or d.parent.parent
        title_elem = parent.find(['h3', 'h4', 'h5', 'strong']) if parent else None
        title = title_elem.get_text(strip=True) if title_elem else "Sekolah"
        href = d.get('href', '')
        b = parent.find('a', class_=lambda c: c and 'sj-btn-brosur' in c) if parent else None
        brosur_slug = b.get('data-brosur-slug', '') if b else ''
        brosur_file = b.get('data-brosur-file', '') if b else ''
        print(f"School: {title} | Daftar: {href} | Brosur Slug: {brosur_slug} | File: {brosur_file}")

