import os

file_path = os.path.join(os.path.dirname(__file__), '..', 'BACKEND', 'api', 'chat.php')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update fallback greeting
old_reply = 'return "Halo! 👋 Senang bisa menyapa Anda. Saya **Cherry**, asisten virtual resmi ACF Eduhub.\\n\\nAda yang bisa Cherry bantu seputar Sekolah Juara (SD), program pendidikan, cara donasi, atau informasi lainnya hari ini? 😊";'
new_reply = 'return "Halo! 👋 Senang bisa menyapa Anda. Ada yang bisa Cherry bantu hari ini? 😊";'

if old_reply in content:
    content = content.replace(old_reply, new_reply)
    print("Replaced greeting in chat.php")
else:
    print("Greeting target not found directly")

# Update system prompt in chat.php
old_prompt = """Gaya Komunikasi:
- Berbicaralah dengan sangat ramah, hangat, komunikatif, solutif, dan NYAMBUNG dengan pertanyaan pengguna.
- Jika pengguna bertanya 'cara donasi'"""

new_prompt = """Gaya Komunikasi:
- Berbicaralah dengan sangat ramah, hangat, komunikatif, solutif, dan NYAMBUNG dengan pertanyaan pengguna.
- Jika pengguna hanya menyapa (seperti 'halo', 'hai', 'p', 'assalamualaikum', 'selamat pagi/siang/malam'), cukup balas singkat dan ramah: 'Halo! 👋 Senang bisa menyapa Anda. Ada yang bisa Cherry bantu hari ini? 😊' tanpa perlu menyebutkan Sekolah Juara atau daftar program.
- Jika pengguna bertanya 'cara donasi'"""

if old_prompt in content:
    content = content.replace(old_prompt, new_prompt)
    print("Replaced prompt (LF)")
elif old_prompt.replace('\n', '\r\n') in content:
    content = content.replace(old_prompt.replace('\n', '\r\n'), new_prompt.replace('\n', '\r\n'))
    print("Replaced prompt (CRLF)")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating chat.php")

