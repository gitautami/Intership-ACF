import os, glob, re

html_files = glob.glob(os.path.join(os.path.dirname(__file__), '..', 'FRONTEND', 'html', '*.html'))
for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    if 'chatbot.js' in c:
        # bump version to v=31
        new_c = re.sub(r'chatbot\.js(\?v=\d+)?', 'chatbot.js?v=31', c)
        if new_c != c:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_c)
            print("Bumped chatbot.js in:", os.path.basename(fpath))

print("All HTML files checked.")

