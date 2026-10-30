with open('FRONTEND/html/sekolah-juara.html', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'btnBrosur' in line:
        start = max(0, i - 15)
        end = min(len(lines), i + 25)
        print(f"--- AT LINE {i} ---")
        print(''.join(lines[start:end]))
        break

