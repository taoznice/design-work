import { exec } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'

const execAsync = promisify(exec)

// 本地 CMS 专用接口，仅在 localhost 使用，无需鉴权
export const dynamic = 'force-dynamic'

const PORTFOLIO_FILE = path.join(process.cwd(), 'content', 'portfolio.ts')

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLocalizedText(value: unknown): boolean {
  return isRecord(value) && typeof value.en === 'string' && typeof value.zh === 'string'
}

/**
 * 仅允许 CMS 写入四种自由内容区块：标题、文字、单张横图、三张竖图。
 * 这既避免写入破坏 TypeScript 结构的非法数据，也确保前台能够稳定渲染。
 */
function validateContentBlocks(value: unknown): string | null {
  if (!Array.isArray(value)) return '详情内容必须是区块数组'

  const ids = new Set<string>()
  for (const block of value) {
    if (!isRecord(block) || typeof block.id !== 'string' || !block.id.trim()) {
      return '每个内容区块都需要有效的 id'
    }
    if (ids.has(block.id)) return `内容区块 id 重复：${block.id}`
    ids.add(block.id)

    if (block.type === 'heading' || block.type === 'text') {
      if (!isLocalizedText(block.content)) return '标题和文字区块必须同时包含中英文内容'
      continue
    }

    if (block.type === 'image' && block.layout === 'wide' && typeof block.src === 'string') {
      continue
    }

    if (
      block.type === 'image' &&
      block.layout === 'triple' &&
      Array.isArray(block.srcs) &&
      block.srcs.length === 3 &&
      block.srcs.every((src) => typeof src === 'string')
    ) {
      continue
    }

    return '图片区块仅支持单张横图或恰好三张竖图'
  }

  return null
}

function validateWorkItems(value: unknown[]): string | null {
  for (const item of value) {
    if (!isRecord(item) || typeof item.slug !== 'string' || !isLocalizedText(item.title)) {
      return '作品数据缺少合法的 slug 或中英文标题'
    }

    if (item.detail !== undefined) {
      if (!isRecord(item.detail)) return `作品 ${item.slug} 的详情数据无效`
      const validationError = validateContentBlocks(item.detail.blocks)
      if (validationError) return `作品 ${item.slug}：${validationError}`
    }
  }

  return null
}

/**
 * 将任意 JS 值序列化为 TypeScript 字面量源码
 * 风格约定：单引号字符串、尾逗号、每层缩进 2 个空格
 */
function serializeValue(value: unknown, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel)
  const childIndent = '  '.repeat(indentLevel + 1)

  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  if (typeof value === 'string') {
    return serializeString(value)
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value
      .map((item) => `${childIndent}${serializeValue(item, indentLevel + 1)},`)
      .join('\n')
    return `[\n${items}\n${indent}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    )
    if (entries.length === 0) return '{}'
    const body = entries
      .map(([key, v]) => `${childIndent}${serializeKey(key)}: ${serializeValue(v, indentLevel + 1)},`)
      .join('\n')
    return `{\n${body}\n${indent}}`
  }

  // 兜底：无法识别的类型直接 JSON 序列化，避免写出非法代码
  return JSON.stringify(value)
}

/**
 * 序列化字符串为单引号形式，正确转义内部的单引号和反斜杠
 */
function serializeString(str: string): string {
  const escaped = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
  return `'${escaped}'`
}

/**
 * 对象 key 尽量保持无引号（合法标识符），非法标识符时使用引号包裹
 */
function serializeKey(key: string): string {
  const isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
  return isValidIdentifier ? key : serializeString(key)
}

/**
 * 将 workItems 数组序列化为完整的 `export const workItems: WorkItem[] = [...]` 代码块
 */
function serializeWorkItems(workItems: unknown[]): string {
  const body = serializeValue(workItems, 0)
  return `export const workItems: WorkItem[] = ${body}`
}

/**
 * 在 portfolio.ts 全文中定位 `export const workItems: WorkItem[] = [ ... ]`
 * 使用手动括号计数（而非纯正则）来找到匹配的数组结束位置，
 * 避免数组内部嵌套的 `[`/`]`（如 aspect 字符串、effectImages 数组）干扰匹配
 */
function replaceWorkItemsBlock(source: string, newBlock: string): string {
  const startMarker = 'export const workItems'
  const startIndex = source.indexOf(startMarker)
  if (startIndex === -1) {
    throw new Error('未在 portfolio.ts 中找到 workItems 声明，无法保存')
  }

  // 注意：声明形如 `export const workItems: WorkItem[] = [...]`
  // 类型注解 `WorkItem[]` 本身就带有一个 `[`，必须先定位到 `=` 号，
  // 再从 `=` 之后查找 `[`，才能拿到真正数组字面量的起始位置
  const equalsIndex = source.indexOf('=', startIndex)
  if (equalsIndex === -1) {
    throw new Error('未找到 workItems 声明中的赋值符号')
  }

  const arrayStart = source.indexOf('[', equalsIndex)
  if (arrayStart === -1) {
    throw new Error('未找到 workItems 数组的起始位置')
  }

  // 手动扫描括号匹配，跳过字符串字面量内的方括号
  let depth = 0
  let inString: '"' | "'" | '`' | null = null
  let arrayEnd = -1

  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i]
    const prevChar = source[i - 1]

    if (inString) {
      if (char === inString && prevChar !== '\\') {
        inString = null
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char
      continue
    }

    if (char === '[') {
      depth += 1
    } else if (char === ']') {
      depth -= 1
      if (depth === 0) {
        arrayEnd = i
        break
      }
    }
  }

  if (arrayEnd === -1) {
    throw new Error('未找到 workItems 数组的结束位置，文件可能已损坏')
  }

  const before = source.slice(0, startIndex)
  const after = source.slice(arrayEnd + 1)

  return `${before}${newBlock}${after}`
}

/**
 * 提交并推送变更到远程仓库
 * git push 需要 unset 代理环境变量，否则本地代理会拦截连接
 */
async function commitAndPush() {
  const cwd = process.cwd()
  const env = { ...process.env }
  delete env.http_proxy
  delete env.https_proxy
  delete env.all_proxy
  delete env.HTTP_PROXY
  delete env.HTTPS_PROXY
  delete env.ALL_PROXY

  const runGit = (command: string) => execAsync(command, { cwd, env })

  await runGit('git add content/portfolio.ts')

  // 若没有实际变更（例如保存了完全相同的内容），跳过提交避免报错
  const { stdout: diffStat } = await runGit('git diff --cached --name-only')
  if (!diffStat.trim()) {
    return { committed: false }
  }

  const commitMessage = `chore: update portfolio content via CMS (${new Date().toISOString()})`
  await runGit(`git commit -m "${commitMessage}"`)
  await runGit('git push')

  return { committed: true }
}

/**
 * POST /api/admin/save
 * body: 完整的 workItems 数组（JSON）
 * 步骤：读取 portfolio.ts 全文 → 定位并替换 workItems 声明 → 写回文件 → git commit + push
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'body 必须是 workItems 数组' },
        { status: 400 },
      )
    }

    const validationError = validateWorkItems(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const original = await fs.readFile(PORTFOLIO_FILE, 'utf-8')
    const newBlock = serializeWorkItems(body)
    const updated = replaceWorkItemsBlock(original, newBlock)

    await fs.writeFile(PORTFOLIO_FILE, updated, 'utf-8')

    try {
      await commitAndPush()
    } catch (gitError) {
      // 文件已写入成功，但 git 操作失败时单独提示，避免用户以为内容也丢了
      const message = gitError instanceof Error ? gitError.message : String(gitError)
      return NextResponse.json(
        { error: `内容已保存，但 git 提交/推送失败：${message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
