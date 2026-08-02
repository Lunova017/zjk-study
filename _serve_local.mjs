// 循星台 · 本地预览静态服务器（Quartz 无内置 serve 子命令）
// 用法：先 build 生成 public/，再 `node _serve_local.mjs` → http://localhost:8080
// 坑：Windows 下必须用 fileURLToPath 计算 public 根，
//     不能直接用 .pathname（会得到 /d:/... 非法路径导致全部 404）。
import http from "node:http"
import { readFile, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.join(fileURLToPath(new URL(".", import.meta.url)), "public")
const PORT = 8080

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
}

async function tryFile(p) {
  try {
    const s = await stat(p)
    return s.isFile() ? p : null
  } catch {
    return null
  }
}

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0])
    if (urlPath.endsWith("/")) urlPath += "index.html"
    let filePath = path.join(root, urlPath)

    let found = await tryFile(filePath)
    if (!found && !path.extname(filePath)) found = await tryFile(filePath + ".html")
    if (!found) found = await tryFile(path.join(root, "404.html"))
    if (!found) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
      res.end("404 Not Found")
      return
    }

    const data = await readFile(found)
    res.writeHead(200, { "Content-Type": MIME[path.extname(found)] || "application/octet-stream" })
    res.end(data)
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("500 " + String(e))
  }
})

server.listen(PORT, () => {
  console.log(`循星台本地预览： http://localhost:${PORT}`)
})
