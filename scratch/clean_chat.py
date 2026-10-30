import os

file_path = os.path.join(os.path.dirname(__file__), '..', 'BACKEND', 'api', 'chat.php')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hapus baris Jangkauan di Section 15 LOKASI & ALAMAT KANTOR
jangkauan_target = '               "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\\n" .\n               "🏫 **Jangkauan**: 17 Unit Pendidikan tersebar di 12 Kota/Kabupaten di Indonesia (Bandung, Cimahi, Jakarta, Tangerang, Yogya, Pekanbaru, Medan, Surabaya, dll).\\n\\n" .\n'
jangkauan_target_crlf = jangkauan_target.replace('\n', '\r\n')

jangkauan_replacement = '               "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\\n\\n" .\n'
jangkauan_replacement_crlf = jangkauan_replacement.replace('\n', '\r\n')

if jangkauan_target in content:
    content = content.replace(jangkauan_target, jangkauan_replacement)
    print("Replaced jangkauan (LF)")
elif jangkauan_target_crlf in content:
    content = content.replace(jangkauan_target_crlf, jangkauan_replacement_crlf)
    print("Replaced jangkauan (CRLF)")
else:
    print("Jangkauan target not found directly, trying line-based filter...")
    lines = content.splitlines(keepends=True)
    new_lines = []
    for line in lines:
        if 'Jangkauan' in line and '17 Unit Pendidikan tersebar' in line:
            print("Skipped jangkauan line:", line.strip())
            continue
        if 'Kantor Pusat' in line and '40275\\n"' in line:
            line = line.replace('\\n"', '\\n\\n"')
        new_lines.append(line)
    content = ''.join(new_lines)

# 2. Hapus sisa block unreachable comment di Section 16.5 jika ada
lines = content.splitlines(keepends=True)
cleaned = []
skip = False
for line in lines:
    if '/*' in line and 'formatArticlesReply' in ''.join(cleaned[-5:]):
        skip = True
    if skip:
        if '}' in line and ('17. UCAPAN' in line or len(cleaned) > 0 and '17. UCAPAN' in lines[lines.index(line)+1 if lines.index(line)+1 < len(lines) else 0]):
            skip = False
            continue
        if 'Buka halaman [Kabar]' in line:
            # next closing bracket
            continue
        if line.strip() == '}':
            skip = False
            continue
        continue
    cleaned.append(line)

content = ''.join(cleaned)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished updating chat.php successfully!")

