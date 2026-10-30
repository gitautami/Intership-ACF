with open('FRONTEND/html/sekolah-juara.html', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'<a\s+[^>]*?>.*?</a>', text, re.DOTALL | re.IGNORECASE)
for m in matches:
    if any(k in m.lower() for k in ['daftar', 'brosur', 'ppdb', 'download', 'unduh', 'modal']):
        print("MATCH:", m.strip().replace('\n', ' '))

print("\n--- BUTTONS ---")
matches_btn = re.findall(r'<button\s+[^>]*?>.*?</button>', text, re.DOTALL | re.IGNORECASE)
for m in matches_btn:
    if any(k in m.lower() for k in ['daftar', 'brosur', 'ppdb', 'download', 'unduh', 'modal']):
        print("BTN:", m.strip().replace('\n', ' '))

