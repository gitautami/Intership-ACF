[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$apiUrl = 'https://acf.or.id/wp-json/wp/v2/posts?per_page=100&_embed=true'
Write-Host "Fetching posts from $apiUrl..."
$response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing
$posts = $response.Content | ConvertFrom-Json

Write-Host "Total posts fetched: $($posts.Count)"

function Clean-SqlString($str) {
    if ([string]::IsNullOrEmpty($str)) { return "''" }
    $escaped = $str.Replace("'", "''").Replace("\", "\\")
    return "'$escaped'"
}

function Format-DisplayDate($dateStr) {
    if ([string]::IsNullOrEmpty($dateStr)) { return "Terbaru" }
    try {
        $dt = [DateTime]::Parse($dateStr)
        $months = @('Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des')
        return "$($dt.Day) $($months[$dt.Month - 1]) $($dt.Year)"
    } catch {
        return "Terbaru"
    }
}

$insertRows = @()

foreach ($p in $posts) {
    $id = "ART-" + $p.id
    $title = $p.title.rendered
    if ($title) {
        $title = [System.Web.HttpUtility]::HtmlDecode($title)
    }
    $slug = $p.slug
    
    # Category detection
    $catSlug = "artikel"
    $catLabel = "Artikel Pendidikan"
    
    if ($p._embedded -and $p._embedded.'wp:term') {
        $terms = $p._embedded.'wp:term'[0]
        foreach ($t in $terms) {
            $tSlug = $t.slug
            $tName = [System.Web.HttpUtility]::HtmlDecode($t.name)
            if ($tSlug -and $tSlug -ne 'uncategorized') {
                if ($tSlug -like '*daya-setara*' -or $tName -like '*Daya Setara*') {
                    $catSlug = "kabar-sekolah-daya-setara"
                    $catLabel = "Artikel Sekolah Daya Setara"
                    break
                } elseif ($tSlug -like '*juara*' -or $tName -like '*Juara*') {
                    $catSlug = "kabar-sekolah-juara"
                    $catLabel = "Artikel Sekolah Juara"
                    break
                } elseif ($tSlug -like '*vokasi*') {
                    $catSlug = "vokasi"
                    $catLabel = "Program Vokasi"
                    break
                } elseif ($tSlug -like '*liputan*') {
                    $catSlug = "liputan"
                    $catLabel = "Liputan Lapangan"
                    break
                } elseif ($tSlug -like '*opini*' -or $tSlug -like '*kolaborasi*') {
                    $catSlug = "opini"
                    $catLabel = "Kolaborasi & Opini"
                    break
                } else {
                    $catSlug = $tSlug
                    $catLabel = $tName
                }
            }
        }
    }
    
    $author = "cerianak"
    if ($p._embedded -and $p._embedded.author -and $p._embedded.author[0]) {
        $author = $p._embedded.author[0].name
    }
    
    $dateDisplay = Format-DisplayDate($p.date)
    
    # Featured media image
    $cover = "assets/logo-acf/LOGO_ACF-removebg-preview.png"
    if ($p._embedded -and $p._embedded.'wp:featuredmedia' -and $p._embedded.'wp:featuredmedia'[0]) {
        $fm = $p._embedded.'wp:featuredmedia'[0]
        if ($fm.source_url) {
            $cover = $fm.source_url
        }
    }
    
    # Excerpt
    $excerpt = ""
    if ($p.excerpt -and $p.excerpt.rendered) {
        $excerpt = [System.Web.HttpUtility]::HtmlDecode($p.excerpt.rendered)
        # Strip html tags
        $excerpt = [System.Text.RegularExpressions.Regex]::Replace($excerpt, "<[^>]+>", " ")
        $excerpt = [System.Text.RegularExpressions.Regex]::Replace($excerpt, "\s+", " ").Trim()
        if ($excerpt.Length -gt 180) {
            $excerpt = $excerpt.Substring(0, 180) + "..."
        }
    }
    
    # Content
    $content = ""
    if ($p.content -and $p.content.rendered) {
        $content = $p.content.rendered.Trim()
    }
    if ([string]::IsNullOrEmpty($content)) {
        $content = "<p>$excerpt</p>"
    }
    
    $status = "Terbit"
    if ($p.status -eq 'draft') {
        $status = "Draf"
    }
    
    $escapedId = Clean-SqlString $id
    $escapedTitle = Clean-SqlString $title
    $escapedSlug = Clean-SqlString $slug
    $escapedCatSlug = Clean-SqlString $catSlug
    $escapedCatLabel = Clean-SqlString $catLabel
    $escapedAuthor = Clean-SqlString $author
    $escapedDate = Clean-SqlString $dateDisplay
    $escapedCover = Clean-SqlString $cover
    $escapedExcerpt = Clean-SqlString $excerpt
    $escapedContent = Clean-SqlString $content
    $escapedStatus = Clean-SqlString $status
    
    $insertRows += "($escapedId, $escapedTitle, $escapedSlug, $escapedCatSlug, $escapedCatLabel, $escapedAuthor, $escapedDate, $escapedCover, $escapedExcerpt, $escapedContent, $escapedStatus)"
}

$header = "INSERT INTO " + [char]96 + "articles" + [char]96 + " (" + [char]96 + "id" + [char]96 + ", " + [char]96 + "title" + [char]96 + ", " + [char]96 + "slug" + [char]96 + ", " + [char]96 + "category_slug" + [char]96 + ", " + [char]96 + "category_label" + [char]96 + ", " + [char]96 + "author" + [char]96 + ", " + [char]96 + "date_display" + [char]96 + ", " + [char]96 + "cover_image" + [char]96 + ", " + [char]96 + "excerpt" + [char]96 + ", " + [char]96 + "content" + [char]96 + ", " + [char]96 + "status" + [char]96 + ") VALUES`r`n"
$outputSql = $header + ($insertRows -join ",`r`n")
$outputSql += "`r`nON DUPLICATE KEY UPDATE " + [char]96 + "title" + [char]96 + " = VALUES(" + [char]96 + "title" + [char]96 + "), " + [char]96 + "cover_image" + [char]96 + " = VALUES(" + [char]96 + "cover_image" + [char]96 + "), " + [char]96 + "content" + [char]96 + " = VALUES(" + [char]96 + "content" + [char]96 + "), " + [char]96 + "excerpt" + [char]96 + " = VALUES(" + [char]96 + "excerpt" + [char]96 + ");`r`n"

[System.IO.File]::WriteAllText("c:\Kuliah\INTERSHIP\INTERSHIP ACF\Github\Intership-ACF\database\all_articles_seed.sql", $outputSql, [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated all_articles_seed.sql with $($insertRows.Count) articles!"
