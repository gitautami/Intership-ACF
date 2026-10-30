import os, re

# Update index.html cache buster
index_file = os.path.join(os.path.dirname(__file__), '..', 'FRONTEND', 'html', 'index.html')
with open(index_file, 'r', encoding='utf-8') as f:
    idx_content = f.read()

idx_content = re.sub(r'chatbot\.js\?v=\d+', 'chatbot.js?v=33', idx_content)
with open(index_file, 'w', encoding='utf-8') as f:
    f.write(idx_content)
print("Bumped chatbot.js to v=33 in index.html")

# Update prompt in FRONTEND/js/chatbot.js
js_file = os.path.join(os.path.dirname(__file__), '..', 'FRONTEND', 'js', 'chatbot.js')
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

prompt_add = "- Jika pengguna bertanya tentang PPDB, syarat masuk, pendaftaran, atau brosur Sekolah Juara (misalnya 'ppdb ss sekolah juara batam'), langsung berikan tautan pendaftaran online dan tautan brosur unit yang dituju (misal: Batam daftar di http://bit.ly/SPMB2728-SDJBATAM dan brosur di sekolah-juara.html?brosur=batam) tanpa menuliskan syarat berkas panjang seperti SKTM atau KK."

if 'langsung berikan tautan pendaftaran online' not in js_content:
    js_content = js_content.replace(
        "- Jika pengguna bertanya 'cara donasi'",
        f"{prompt_add}\n- Jika pengguna bertanya 'cara donasi'"
    )
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Updated systemPrompt in chatbot.js")

# Update prompt in BACKEND/api/chat.php
php_file = os.path.join(os.path.dirname(__file__), '..', 'BACKEND', 'api', 'chat.php')
with open(php_file, 'r', encoding='utf-8') as f:
    php_content = f.read()

if 'langsung berikan tautan pendaftaran online' not in php_content:
    php_content = php_content.replace(
        "- Jika pengguna bertanya 'cara donasi'",
        f"{prompt_add}\n- Jika pengguna bertanya 'cara donasi'"
    )
    with open(php_file, 'w', encoding='utf-8') as f:
        f.write(php_content)
    print("Updated systemPrompt in chat.php")

print("Done all!")

