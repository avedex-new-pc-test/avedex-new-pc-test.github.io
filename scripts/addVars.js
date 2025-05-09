import fs from 'fs'
import path from 'path'

function normalizeColor(color) {
  color = color.replace('#', '').toUpperCase()
  if (
    color.length === 6 &&
    color[0] === color[1] &&
    color[2] === color[3] &&
    color[4] === color[5]
  ) {
    return '#' + color[0] + color[2] + color[4]
  }
  if (color.length === 3) {
    return '#' + color
  }
  return '#' + color
}

function parseVarName(varName) {
  const m = varName.match(/^--d-#?([0-9A-Fa-f]{3,6})-l-#?([0-9A-Fa-f]{3,6})$/)
  if (!m) throw new Error('变量名格式错误，应为 --d-#333-l-#ECECEC')
  return {
    dark: normalizeColor(m[1]),
    light: normalizeColor(m[2]),
    name: varName.replace(/-#?/g, '-').replace(/--d-([0-9A-Fa-f]{3,6})-l-([0-9A-Fa-f]{3,6})/, '--d-$1-l-$2')
  }
}

// 提取指定块（支持嵌套）
function extractBlock(css, blockSelector) {
  const startIdx = css.indexOf(blockSelector)
  if (startIdx === -1) return null
  let braceCount = 0
  let blockStart = css.indexOf('{', startIdx)
  if (blockStart === -1) return null
  let i = blockStart
  for (; i < css.length; i++) {
    if (css[i] === '{') braceCount++
    else if (css[i] === '}') braceCount--
    if (braceCount === 0) break
  }
  if (braceCount !== 0) return null
  return {
    start: startIdx,
    blockStart,
    end: i,
    content: css.slice(blockStart + 1, i)
  }
}

// 更新块内容，保持变量之间无空行
function updateBlock(css, blockSelector, varName, value) {
  const block = extractBlock(css, blockSelector)
  if (!block) throw new Error(`未找到 ${blockSelector} 块（请确保 ${blockSelector} 和 { 换行）`)
  let lines = block.content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0) // 只过滤空行，保留注释
  let found = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(varName + ':')) {
      lines[i] = `${varName}: ${value};`
      found = true
      break
    }
  }
  if (!found) {
    lines.push(`${varName}: ${value};`)
  }
  // 保证每行一个变量，无空行
  const newBody = lines.join('\n    ')
  return (
    css.slice(0, block.blockStart + 1) +
    '\n    ' + newBody + '\n' +
    '  }' +
    css.slice(block.end + 1)
  )
}

function updateCssVars(cssFile, varName) {
  const { dark, light, name } = parseVarName(varName)
  let css = fs.readFileSync(cssFile, 'utf-8')

  css = updateBlock(css, '&.dark', name, dark)
  css = updateBlock(css, '&.light', name, light)

  fs.writeFileSync(cssFile, css, 'utf-8')
  console.log(`已写入变量 ${name}，dark: ${dark}，light: ${light}`)
}

// 用法示例
const cssFile = path.resolve('../src/assets/css/var.scss') // 你的 CSS 文件路径
const args = process.argv.slice(2)
args.forEach(varName=>{
  updateCssVars(cssFile, varName)
})
