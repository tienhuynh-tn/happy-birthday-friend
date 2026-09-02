import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const indexPath = join(root, 'index.html')
const viteSsgBin = join(root, 'node_modules/.bin/vite-ssg')

const appTemplate = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🦀 🎂</title>
  <meta name="description" content="Bánh sinh nhật và nến dành cho Crabe.">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`

const runBuild = () => spawnSync(process.execPath, [viteSsgBin, 'build'], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
  stdio: 'inherit',
})

const originalIndex = await readFile(indexPath, 'utf8')

if (!existsSync(viteSsgBin)) {
  console.error('Cannot find local vite-ssg binary. Run pnpm install first.')
  process.exit(1)
}

try {
  await mkdir(dirname(indexPath), { recursive: true })
  await writeFile(indexPath, appTemplate)

  const result = runBuild()
  if (result.error)
    throw result.error

  process.exitCode = result.status ?? 1
}
finally {
  await writeFile(indexPath, originalIndex)
}
