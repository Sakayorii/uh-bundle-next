import MagicString from 'magic-string'
import type { RolldownPlugin } from 'rolldown'

const DEFER_NAMESPACE_IMPORT_REGEX =
    /import\s+defer\s+(\*\s+as\s+\w+)\s+from\s+(['"])([^'"]+)\2\s*;?/g

export default function importDefer() {
    return {
        name: 'import-defer',
        async transform(code) {
            const s = new MagicString(code)
            let hasReplacements = false

            const allBindingMatches = [
                ...code.matchAll(DEFER_NAMESPACE_IMPORT_REGEX),
            ]

            for (const match of allBindingMatches) {
                const [fullMatch, bindingsStr, , modulePath] = match
                const bindings = parseBindings(bindingsStr)

                if (bindings.length > 0) {
                    const localName = bindings[0].local

                    s.overwrite(
                        match.index,
                        match.index + fullMatch.length,
                        generateDeferReplacement(bindings, modulePath),
                    )
                    hasReplacements = true

                    const usageRegex = new RegExp(`\\b${localName}\\b`, 'g')

                    for (const usageMatch of code.matchAll(usageRegex)) {
                        if (
                            usageMatch.index >= match.index &&
                            usageMatch.index < match.index + fullMatch.length
                        ) {
                            continue
                        }

                        const startIndex = usageMatch.index
                        const endIndex = startIndex + usageMatch[0].length

                        if (isInsideStringLiteral(code, startIndex)) continue

                        let nextChar = ''
                        let i = endIndex
                        while (i < code.length) {
                            if (!/\s/.test(code[i])) {
                                nextChar = code[i]
                                break
                            }
                            i++
                        }

                        if (nextChar === ':') continue

                        let prevChar = ''
                        i = startIndex - 1
                        while (i >= 0) {
                            if (!/\s/.test(code[i])) {
                                prevChar = code[i]
                                break
                            }
                            i--
                        }

                        const isShorthand =
                            (prevChar === '{' || prevChar === ',') &&
                            (nextChar === '}' || nextChar === ',')

                        if (isShorthand)
                            s.overwrite(
                                startIndex,
                                endIndex,
                                `${localName}: ${localName}()`,
                            )
                        else s.overwrite(startIndex, endIndex, `${localName}()`)
                    }
                }
            }

            if (!hasReplacements) return null

            return {
                code: s.toString(),
                map: s.generateMap({ hires: true }),
            }
        },
    } satisfies RolldownPlugin
}

type Bindings = { local: string; imported: string }[]

function parseBindings(bindingsStr: string): Bindings {
    const remainingStr = bindingsStr.trim()
    const namespaceMatch = remainingStr.match(/^\*\s+as\s+(\w+)/)
    if (namespaceMatch) return [{ local: namespaceMatch[1], imported: '*' }]

    return []
}

function isInsideStringLiteral(code: string, position: number): boolean {
    let inSingleQuote = false
    let inDoubleQuote = false
    let inTemplate = false
    let escapeNext = false

    for (let i = 0; i < position; i++) {
        const char = code[i]

        if (escapeNext) {
            escapeNext = false
            continue
        }

        if (char === '\\') {
            escapeNext = true
            continue
        }

        if (char === "'" && !inDoubleQuote && !inTemplate) {
            inSingleQuote = !inSingleQuote
        } else if (char === '"' && !inSingleQuote && !inTemplate) {
            inDoubleQuote = !inDoubleQuote
        } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
            inTemplate = !inTemplate
        }
    }

    return inSingleQuote || inDoubleQuote || inTemplate
}

function generateDeferReplacement(bindings: Bindings, modulePath: string) {
    if (!bindings.length) return ''

    const [{ local: localName }] = bindings
    const cacheVar = `_cache_${modulePath.replace(/[^a-zA-Z0-9]/g, '_')}`

    return `var ${cacheVar};const ${localName}=()=>${cacheVar}??=require('${modulePath}');`
}
