import os, re

# 1. UPDATE FRONTEND/js/chatbot.js
js_file = os.path.join(os.path.dirname(__file__), '..', 'FRONTEND', 'js', 'chatbot.js')
with open(js_file, 'r', encoding='utf-8') as f:
    js_code = f.read()

sj_data_js = """  // Data 10 Unit Sekolah Juara (SD) lengkap dengan link pendaftaran & brosur
  const SJ_SCHOOLS = [
    { key: 'batam', name: 'SD Juara Batam', daftar: 'http://bit.ly/SPMB2728-SDJBATAM', brosur: 'sekolah-juara.html?brosur=batam' },
    { key: 'cilegon', name: 'SD Juara Cilegon', daftar: 'https://bit.ly/SPMB2728SDJUARACILEGON', brosur: 'sekolah-juara.html?brosur=cilegon' },
    { key: 'jakbar', name: 'SD Juara Jakarta Barat', aliases: ['jakarta barat', 'jakbar'], daftar: 'https://forms.gle/7WoWewcTqsPCZ4Aq7', brosur: 'sekolah-juara.html?brosur=jakbar' },
    { key: 'jaktim', name: 'SD Juara Jakarta Timur', aliases: ['jakarta timur', 'jaktim'], daftar: 'https://bit.ly/PPDBSDJuaraJakartaTimur20272028', brosur: 'sekolah-juara.html?brosur=jaktim' },
    { key: 'jakut', name: 'SD Juara Jakarta Utara', aliases: ['jakarta utara', 'jakut'], daftar: 'https://bit.ly/SPMBINDENSDITJAKUT2728', brosur: 'sekolah-juara.html?brosur=jakut' },
    { key: 'medan', name: 'SD Juara Persa Medan', aliases: ['medan', 'persa'], daftar: 'https://linktr.ee/sdspersa', brosur: 'sekolah-juara.html?brosur=medan' },
    { key: 'jayapura', name: 'SD Juara AL Hikmah Jayapura', aliases: ['jayapura', 'hikmah', 'papua'], daftar: 'https://bit.ly/SPMBSDJUARAJayapura', brosur: 'sekolah-juara.html?brosur=jayapura' },
    { key: 'semarang', name: 'SD Juara Semarang', daftar: 'https://bit.ly/ForPeminatPPDB20272028', brosur: 'sekolah-juara.html?brosur=semarang' },
    { key: 'surabaya', name: 'SD Juara Surabaya', daftar: 'https://s.id/spmb-sdjuarasurabaya27-28', brosur: 'sekolah-juara.html?brosur=surabaya' },
    { key: 'tangerang', name: 'SD Juara AL Hakim Tangerang', aliases: ['tangerang', 'hakim'], daftar: 'https://bit.ly/DaftarIndenAlhakim2728', brosur: 'sekolah-juara.html?brosur=tangerang' }
  ];

  function getSekolahJuaraPpdbReply(query) {
    const q = (query || '').toLowerCase();
    
    // Jika menanyakan unit spesifik tertentu
    for (const s of SJ_SCHOOLS) {
      const matchKey = q.includes(s.key);
      const matchAlias = s.aliases && s.aliases.some(a => q.includes(a));
      if (matchKey || matchAlias) {
        return `🎒 **Pendaftaran & Brosur SPMB ${s.name}**:\\n\\n` +
               `Berikut adalah tautan resmi pendaftaran dan dokumen brosur untuk **${s.name}**:\\n\\n` +
               `• 📝 **Link Pendaftaran**: [Daftar Online ${s.name}](${s.daftar})\\n` +
               `• 📖 **Brosur Resmi**: [Lihat & Unduh Brosur](${s.brosur})\\n\\n` +
               `Anda juga dapat melihat profil lengkap unit ini di halaman [Sekolah Juara](sekolah-juara.html). Bantuan lebih lanjut hubungi WhatsApp admin di **+62 851-7979-7661**! 😊`;
      }
    }

    // Tampilkan seluruh 10 unit dengan tautan pendaftaran & brosur
    let reply = "🎒 **Link Pendaftaran & Brosur SPMB/PPDB Sekolah Juara (SD)**:\\n\\n" +
                "Silakan klik tautan di bawah ini untuk langsung mengisi formulir pendaftaran atau mengunduh brosur resmi unit yang dituju:\\n\\n";

    SJ_SCHOOLS.forEach((s, idx) => {
      reply += `${idx + 1}. **${s.name}**\\n` +
               `   • 📝 [Formulir Pendaftaran](${s.daftar})\\n` +
               `   • 📖 [Lihat & Unduh Brosur](${s.brosur})\\n\\n`;
    });

    reply += "Detail profil seluruh unit dapat Anda lihat di menu [Sekolah Juara](sekolah-juara.html)! ✨";
    return reply;
  }
"""

# Insert sj_data_js right before getLocalKnowledgeReply
if 'const SJ_SCHOOLS =' not in js_code:
    js_code = js_code.replace('  function getLocalKnowledgeReply(query) {', sj_data_js + '\n  function getLocalKnowledgeReply(query) {')
    print("Added SJ_SCHOOLS to chatbot.js")

# Replace section 8 in chatbot.js
old_sec8_pattern = r'    // 8\. CARA DAFTAR SEKOLAH JUARA / SYARAT MASUK / PPDB[\s\S]*?return "📝 \*\*Cara & Syarat Pendaftaran Siswa Sekolah Juara \(SD\)\*\*:[^;]+;\s*\}'
new_sec8 = """    // 8. INFO PPDB, DAFTAR, DAN BROSUR SEKOLAH JUARA
    if (
      q.includes('ppdb') ||
      q.includes('spmb') ||
      q.includes('brosur') ||
      ((q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('alur') || q.includes('daftar') || q.includes('masuk')) &&
       (q.includes('sekolah') || q.includes('juara') || q.includes('siswa') || q.includes('anak') || q.includes('sd')))
    ) {
      return getSekolahJuaraPpdbReply(raw);
    }"""

js_code = re.sub(old_sec8_pattern, new_sec8, js_code)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_code)
print("Updated FRONTEND/js/chatbot.js successfully!")


# 2. UPDATE BACKEND/api/chat.php
php_file = os.path.join(os.path.dirname(__file__), '..', 'BACKEND', 'api', 'chat.php')
with open(php_file, 'r', encoding='utf-8') as f:
    php_code = f.read()

sj_data_php = """// Data 10 Unit Sekolah Juara (SD) lengkap dengan link pendaftaran & brosur
function getSekolahJuaraPpdbReply($query) {
    $q = mb_strtolower(trim($query));
    
    $schools = [
        ['key' => 'batam', 'name' => 'SD Juara Batam', 'daftar' => 'http://bit.ly/SPMB2728-SDJBATAM', 'brosur' => 'sekolah-juara.html?brosur=batam'],
        ['key' => 'cilegon', 'name' => 'SD Juara Cilegon', 'daftar' => 'https://bit.ly/SPMB2728SDJUARACILEGON', 'brosur' => 'sekolah-juara.html?brosur=cilegon'],
        ['key' => 'jakbar', 'name' => 'SD Juara Jakarta Barat', 'aliases' => ['jakarta barat', 'jakbar'], 'daftar' => 'https://forms.gle/7WoWewcTqsPCZ4Aq7', 'brosur' => 'sekolah-juara.html?brosur=jakbar'],
        ['key' => 'jaktim', 'name' => 'SD Juara Jakarta Timur', 'aliases' => ['jakarta timur', 'jaktim'], 'daftar' => 'https://bit.ly/PPDBSDJuaraJakartaTimur20272028', 'brosur' => 'sekolah-juara.html?brosur=jaktim'],
        ['key' => 'jakut', 'name' => 'SD Juara Jakarta Utara', 'aliases' => ['jakarta utara', 'jakut'], 'daftar' => 'https://bit.ly/SPMBINDENSDITJAKUT2728', 'brosur' => 'sekolah-juara.html?brosur=jakut'],
        ['key' => 'medan', 'name' => 'SD Juara Persa Medan', 'aliases' => ['medan', 'persa'], 'daftar' => 'https://linktr.ee/sdspersa', 'brosur' => 'sekolah-juara.html?brosur=medan'],
        ['key' => 'jayapura', 'name' => 'SD Juara AL Hikmah Jayapura', 'aliases' => ['jayapura', 'hikmah', 'papua'], 'daftar' => 'https://bit.ly/SPMBSDJUARAJayapura', 'brosur' => 'sekolah-juara.html?brosur=jayapura'],
        ['key' => 'semarang', 'name' => 'SD Juara Semarang', 'daftar' => 'https://bit.ly/ForPeminatPPDB20272028', 'brosur' => 'sekolah-juara.html?brosur=semarang'],
        ['key' => 'surabaya', 'name' => 'SD Juara Surabaya', 'daftar' => 'https://s.id/spmb-sdjuarasurabaya27-28', 'brosur' => 'sekolah-juara.html?brosur=surabaya'],
        ['key' => 'tangerang', 'name' => 'SD Juara AL Hakim Tangerang', 'aliases' => ['tangerang', 'hakim'], 'daftar' => 'https://bit.ly/DaftarIndenAlhakim2728', 'brosur' => 'sekolah-juara.html?brosur=tangerang']
    ];

    // Cek apakah menanyakan cabang kota spesifik
    foreach ($schools as $s) {
        $match = strpos($q, $s['key']) !== false;
        if (!$match && !empty($s['aliases'])) {
            foreach ($s['aliases'] as $alias) {
                if (strpos($q, $alias) !== false) {
                    $match = true;
                    break;
                }
            }
        }
        if ($match) {
            return "🎒 **Pendaftaran & Brosur SPMB {$s['name']}**:\\n\\n" .
                   "Berikut adalah tautan resmi pendaftaran dan dokumen brosur untuk **{$s['name']}**:\\n\\n" .
                   "• 📝 **Link Pendaftaran**: [Daftar Online {$s['name']}]({$s['daftar']})\\n" .
                   "• 📖 **Brosur Resmi**: [Lihat & Unduh Brosur]({$s['brosur']})\\n\\n" .
                   "Anda juga dapat melihat profil lengkap unit ini di halaman [Sekolah Juara](sekolah-juara.html). Bantuan lebih lanjut hubungi WhatsApp admin di **+62 851-7979-7661**! 😊";
        }
    }

    // Tampilkan 10 unit dengan tautan pendaftaran & brosur
    $reply = "🎒 **Link Pendaftaran & Brosur SPMB/PPDB Sekolah Juara (SD)**:\\n\\n" .
             "Silakan klik tautan di bawah ini untuk langsung mengisi formulir pendaftaran atau mengunduh brosur resmi unit yang dituju:\\n\\n";

    $idx = 1;
    foreach ($schools as $s) {
        $reply .= "{$idx}. **{$s['name']}**\\n" .
                  "   • 📝 [Formulir Pendaftaran]({$s['daftar']})\\n" .
                  "   • 📖 [Lihat & Unduh Brosur]({$s['brosur']})\\n\\n";
        $idx++;
    }

    $reply .= "Detail profil seluruh unit dapat Anda lihat di menu [Sekolah Juara](sekolah-juara.html)! ✨";
    return $reply;
}
"""

if 'function getSekolahJuaraPpdbReply(' not in php_code:
    php_code = php_code.replace('function getSmartFallbackReply($query) {', sj_data_php + '\nfunction getSmartFallbackReply($query) {')
    print("Added getSekolahJuaraPpdbReply to chat.php")

old_sec8_php = r'    // 8\. CARA DAFTAR SEKOLAH JUARA / SYARAT MASUK / PPDB[\s\S]*?return "📝 \*\*Cara & Syarat Pendaftaran Siswa Sekolah Juara \(SD\)\*\*:[^;]+;\s*\}'
new_sec8_php = """    // 8. INFO PPDB, DAFTAR, DAN BROSUR SEKOLAH JUARA
    if (
        strpos($q, 'ppdb') !== false ||
        strpos($q, 'spmb') !== false ||
        strpos($q, 'brosur') !== false ||
        ((strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'langkah') !== false || strpos($q, 'alur') !== false || strpos($q, 'daftar') !== false || strpos($q, 'masuk') !== false) &&
         (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'siswa') !== false || strpos($q, 'anak') !== false || strpos($q, 'sd') !== false))
    ) {
        return getSekolahJuaraPpdbReply($raw);
    }"""

php_code = re.sub(old_sec8_php, new_sec8_php, php_code)

with open(php_file, 'w', encoding='utf-8') as f:
    f.write(php_code)
print("Updated BACKEND/api/chat.php successfully!")

