# Static file server for machines without Node — same behavior as server.js,
# using the HttpListener built into Windows PowerShell.
$Port = if ($env:PORT) { [int]$env:PORT } else { 5174 }
$Root = [IO.Path]::GetFullPath($PSScriptRoot)

$Mime = @{
  ".html" = "text/html"
  ".js"   = "text/javascript"
  ".css"  = "text/css"
  ".json" = "application/json"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".webp" = "image/webp"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Serving The Floor at http://localhost:$Port"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $reqPath = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($reqPath -eq "/") { $reqPath = "/index.html" }
      $filePath = [IO.Path]::GetFullPath((Join-Path $Root $reqPath.TrimStart("/")))

      if (-not $filePath.StartsWith($Root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        $res.StatusCode = 403
        $body = [Text.Encoding]::UTF8.GetBytes("Forbidden")
      } elseif (-not [IO.File]::Exists($filePath)) {
        $res.StatusCode = 404
        $body = [Text.Encoding]::UTF8.GetBytes("Not found")
      } else {
        $ext = [IO.Path]::GetExtension($filePath).ToLower()
        $res.ContentType = if ($Mime.ContainsKey($ext)) { $Mime[$ext] } else { "application/octet-stream" }
        $body = [IO.File]::ReadAllBytes($filePath)
      }
      $res.ContentLength64 = $body.Length
      $res.OutputStream.Write($body, 0, $body.Length)
    } catch {
      $res.StatusCode = 500
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
}
