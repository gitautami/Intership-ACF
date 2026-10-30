import os

file_path = os.path.join(os.path.dirname(__file__), '..', 'BACKEND', 'api', 'chat.php')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_cond = """    // 10. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'daftar') !== false || strpos($q, 'gabung') !== false) &&
        (strpos($q, 'relawan') !== false || strpos($q, 'volunteer') !== false || strpos($q, 'sahabat') !== false)
    ) {"""

new_cond = """    // 10. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
        strpos($q, 'relawan') !== false ||
        strpos($q, 'volunteer') !== false ||
        (strpos($q, 'sahabat') !== false && (strpos($q, 'eduhub') !== false || strpos($q, 'daftar') !== false || strpos($q, 'gabung') !== false))
    ) {"""

if old_cond in content:
    content = content.replace(old_cond, new_cond)
    print("Replaced relawan condition (LF)")
elif old_cond.replace('\n', '\r\n') in content:
    content = content.replace(old_cond.replace('\n', '\r\n'), new_cond.replace('\n', '\r\n'))
    print("Replaced relawan condition (CRLF)")
else:
    print("Old cond not found directly, skipping replacement")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating chat.php")

