import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { after, before, HookPriority, instead } from '.'

describe('Patcher', () => {
    let originalMethod: (...args: any[]) => string
    let obj: { method: typeof originalMethod }

    beforeEach(() => {
        originalMethod = mock(s => s ?? 'original')
        obj = {
            method: originalMethod,
        }
    })

    describe('before', () => {
        test('should execute callback before original method', () => {
            const beforeCallback = mock(args => args)
            before(obj, 'method', beforeCallback)

            obj.method('arg1', 'arg2')

            expect(beforeCallback).toHaveBeenCalledWith(['arg1', 'arg2'])
            expect(originalMethod).toHaveBeenCalled()
        })

        test('should allow modifying arguments', () => {
            before(obj, 'method', args => {
                args[0] = 'modified'
                return args
            })

            obj.method('original')

            expect(originalMethod).toHaveBeenCalledWith('modified')
        })

        test('should unpatch correctly', () => {
            const beforeCallback = mock(args => {
                args[0] = 'modified'
                return args
            })
            const unpatch = before(obj, 'method', beforeCallback)

            obj.method('original')
            expect(originalMethod).toHaveBeenCalledWith('modified')

            unpatch()

            obj.method('original')
            expect(originalMethod).toHaveBeenCalledWith('original')
            expect(beforeCallback).toHaveBeenCalledTimes(1)
        })

        test('should handle multiple before hooks and unpatch correctly', () => {
            const firstHook = mock(args => {
                args[0] = 'first'
                return args
            })
            const secondHook = mock(args => {
                args[0] = `${args[0]}-second`
                return args
            })

            const unpatch2 = before(obj, 'method', secondHook)
            const unpatch1 = before(obj, 'method', firstHook)

            obj.method('original')
            expect(originalMethod).toHaveBeenCalledWith('first-second')

            unpatch2()

            obj.method('original')
            expect(originalMethod).toHaveBeenCalledWith('first')

            unpatch1()

            obj.method('original')
            expect(originalMethod).toHaveBeenCalledWith('original')
        })

        test('should not crash when unpatch is called multiple times', () => {
            const beforeCallback = mock(args => args)
            const unpatch = before(obj, 'method', beforeCallback)

            unpatch()
            expect(() => unpatch()).not.toThrow()
            expect(() => unpatch()).not.toThrow()
        })
    })

    describe('after', () => {
        test('should execute callback after original method', () => {
            const afterCallback = mock(() => 'original')
            after(obj, 'method', afterCallback)

            const result = obj.method()

            expect(afterCallback).toHaveBeenCalledWith('original')
            expect(result).toBe('original')
        })

        test('should allow modifying return value', () => {
            after(obj, 'method', () => 'modified')

            const result = obj.method()

            expect(result).toBe('modified')
        })

        test('should unpatch correctly', () => {
            const afterCallback = mock(() => 'modified')
            const unpatch = after(obj, 'method', afterCallback)

            let result = obj.method()
            expect(result).toBe('modified')
            expect(afterCallback).toHaveBeenCalledWith('original')

            unpatch()

            result = obj.method()
            expect(result).toBe('original')
            expect(afterCallback).toHaveBeenCalledTimes(1)
        })

        test('should handle multiple after hooks and unpatch correctly', () => {
            const firstHook = mock(result => `${result}-first`)
            const secondHook = mock(result => `${result}-second`)

            const unpatch1 = after(obj, 'method', firstHook)
            const unpatch2 = after(obj, 'method', secondHook)

            let result = obj.method()
            expect(result).toBe('original-second-first')

            unpatch2()
            result = obj.method()
            expect(result).toBe('original-first')

            unpatch1()
            result = obj.method()
            expect(result).toBe('original')
        })

        test('should not crash when unpatch is called multiple times', () => {
            const afterCallback = mock(result => result)
            const unpatch = after(obj, 'method', afterCallback)

            unpatch()
            expect(() => unpatch()).not.toThrow()
            expect(() => unpatch()).not.toThrow()
        })
    })

    describe('instead', () => {
        test('should replace original method', () => {
            const replacement = mock(() => 'replaced')
            instead(obj, 'method', replacement)

            const result = obj.method('arg1')

            expect(replacement).toHaveBeenCalledWith(
                ['arg1'],
                expect.any(Function),
            )
            expect(originalMethod).not.toHaveBeenCalled()
            expect(result).toBe('replaced')
        })

        test('should provide access to original method', () => {
            instead(obj, 'method', (_args, original) => {
                return `${original()} modified`
            })

            const result = obj.method()

            expect(result).toBe('original modified')
        })

        test('should unpatch correctly', () => {
            const replacement = mock(() => 'replaced')
            const unpatch = instead(obj, 'method', replacement)

            let result = obj.method()
            expect(result).toBe('replaced')
            expect(originalMethod).not.toHaveBeenCalled()

            unpatch()

            result = obj.method()
            expect(result).toBe('original')
            expect(originalMethod).toHaveBeenCalled()
            expect(replacement).toHaveBeenCalledTimes(1)
        })

        test('should handle multiple instead hooks and unpatch correctly', () => {
            const firstHook = mock((_args, original) => `first-${original()}`)
            const secondHook = mock((_args, original) => `second-${original()}`)

            const unpatch1 = instead(obj, 'method', firstHook)
            const unpatch2 = instead(obj, 'method', secondHook)

            let result = obj.method()
            expect(result).toBe('second-first-original')

            unpatch2()
            result = obj.method()
            expect(result).toBe('first-original')

            unpatch1()
            result = obj.method()
            expect(result).toBe('original')
        })

        test('should not crash when unpatch is called multiple times', () => {
            const replacement = mock(() => 'replaced')
            const unpatch = instead(obj, 'method', replacement)

            unpatch()
            expect(() => unpatch()).not.toThrow()
            expect(() => unpatch()).not.toThrow()
        })
    })

    describe('mixed hooks', () => {
        test('should handle before + after', () => {
            const beforeHook = mock(args => {
                args[0] = 'modified'
                return args
            })
            const afterHook = mock(result => `${result}-after`)

            const unpatchBefore = before(obj, 'method', beforeHook)
            const unpatchAfter = after(obj, 'method', afterHook)

            let result = obj.method('original')
            expect(result).toBe('modified-after')
            expect(beforeHook).toHaveBeenCalledWith(['modified'])
            expect(afterHook).toHaveBeenCalledWith('modified')

            unpatchAfter()
            result = obj.method('original')
            expect(result).toBe('modified')

            unpatchBefore()
            result = obj.method('original')
            expect(result).toBe('original')
        })
        test('should handle instead + before', () => {
            const insteadHook = mock(
                (args, original) => `${original(...args)}-instead`,
            )
            const beforeHook = mock(args => {
                args[0] = 'modified'
                return args
            })

            const unpatchInstead = instead(obj, 'method', insteadHook)
            const unpatchBefore = before(obj, 'method', beforeHook)

            let result = obj.method('original')
            expect(result).toBe('modified-instead')
            expect(insteadHook).toHaveBeenCalledWith(
                ['modified'],
                expect.any(Function),
            )
            expect(beforeHook).toHaveBeenCalledWith(['modified'])

            unpatchBefore()
            result = obj.method('original')
            expect(result).toBe('original-instead')

            unpatchInstead()
            result = obj.method('original')
            expect(result).toBe('original')
        })

        test('should handle instead + after', () => {
            const insteadHook = mock(() => 'oops')
            const afterHook = mock(result => `${result}-after`)

            const unpatchInstead = instead(obj, 'method', insteadHook)
            const unpatchAfter = after(obj, 'method', afterHook)

            let result = obj.method('original')
            expect(result).toBe('oops-after')
            expect(insteadHook).toHaveBeenCalledWith(
                ['original'],
                expect.any(Function),
            )
            expect(afterHook).toHaveBeenCalledWith('oops')

            unpatchAfter()
            result = obj.method('original')
            expect(result).toBe('oops')

            unpatchInstead()
            result = obj.method('original')
            expect(result).toBe('original')
        })

        test('should handle instead + before + after', () => {
            const insteadHook = mock(
                (args, original) => `${original(...args)}-instead`,
            )

            const beforeHook = mock(args => {
                args[0] = 'modified'
                return args
            })

            const afterHook = mock(result => `${result}-after`)

            const unpatchInstead = instead(obj, 'method', insteadHook)
            const unpatchBefore = before(obj, 'method', beforeHook)
            const unpatchAfter = after(obj, 'method', afterHook)

            let result = obj.method('original')
            expect(result).toBe('modified-instead-after')
            expect(insteadHook).toHaveBeenCalledWith(
                ['modified'],
                expect.any(Function),
            )
            expect(beforeHook).toHaveBeenCalledWith(['modified'])
            expect(afterHook).toHaveBeenCalledWith('modified-instead')

            unpatchAfter()
            result = obj.method('original')
            expect(result).toBe('modified-instead')

            unpatchBefore()
            result = obj.method('original')
            expect(result).toBe('original-instead')

            unpatchInstead()
            result = obj.method('original')
            expect(result).toBe('original')
        })

        test('should handle before + after + instead', () => {
            const beforeHook = mock(args => {
                args[0] = 'before-modified'
                return args
            })

            const afterHook = mock(result => `${result}-after`)

            const insteadHook = mock(
                (args, original) => `${original(...args)}-instead`,
            )

            const unpatchBefore = before(obj, 'method', beforeHook)
            const unpatchAfter = after(obj, 'method', afterHook)
            const unpatchInstead = instead(obj, 'method', insteadHook)

            let result = obj.method('original')
            expect(result).toBe('before-modified-instead-after')
            expect(beforeHook).toHaveBeenCalledWith(['before-modified'])
            expect(afterHook).toHaveBeenCalledWith('before-modified-instead')
            expect(insteadHook).toHaveBeenCalledWith(
                ['before-modified'],
                expect.any(Function),
            )

            unpatchAfter()
            result = obj.method('original')
            expect(result).toBe('before-modified-instead')

            unpatchBefore()
            result = obj.method('original')
            expect(result).toBe('original-instead')

            unpatchInstead()
            result = obj.method('original')
            expect(result).toBe('original')
        })

        test('should restore original method when all hooks are unpatched', () => {
            const originalRef = obj.method

            const unpatch1 = before(obj, 'method', args => args)
            const unpatch2 = after(obj, 'method', result => result)

            expect(obj.method).not.toBe(originalRef)

            unpatch1()
            expect(obj.method).not.toBe(originalRef)

            unpatch2()
            expect(obj.method).toBe(originalRef)
        })
    })

    describe('constructor patching', () => {
        test('should patch constructor functions', () => {
            class TestClass {
                value: string
                constructor(value: string) {
                    this.value = value
                }
            }

            const obj = { TestClass }

            const beforeHook = mock(args => {
                args[0] = 'modified'
                return args
            })

            before(obj, 'TestClass', beforeHook)

            const instance = new obj.TestClass('original')
            expect(instance.value).toBe('modified')
            expect(beforeHook).toHaveBeenCalledWith(['modified'])
        })
    })

    describe('priority system', () => {
        test('before hooks should execute in ascending priority order', () => {
            const order: number[] = []

            before(
                obj,
                'method',
                args => {
                    order.push(2)
                    return args
                },
                { priority: HookPriority.NORMAL },
            )

            before(
                obj,
                'method',
                args => {
                    order.push(1)
                    return args
                },
                { priority: HookPriority.LOWEST },
            )

            before(
                obj,
                'method',
                args => {
                    order.push(3)
                    return args
                },
                { priority: HookPriority.HIGHEST },
            )

            obj.method()
            expect(order).toEqual([1, 2, 3])
        })

        test('after hooks should execute in descending priority order', () => {
            const order: number[] = []

            after(
                obj,
                'method',
                result => {
                    order.push(2)
                    return result
                },
                { priority: HookPriority.NORMAL },
            )

            after(
                obj,
                'method',
                result => {
                    order.push(3)
                    return result
                },
                { priority: HookPriority.LOWEST },
            )

            after(
                obj,
                'method',
                result => {
                    order.push(1)
                    return result
                },
                { priority: HookPriority.HIGHEST },
            )

            obj.method()
            expect(order).toEqual([1, 2, 3])
        })

        test('instead hooks should execute highest priority first', () => {
            const order: number[] = []

            instead(
                obj,
                'method',
                (args, original) => {
                    order.push(1)
                    return `1-${original(...args)}`
                },
                { priority: HookPriority.LOWEST },
            )

            instead(
                obj,
                'method',
                (args, original) => {
                    order.push(2)
                    return `2-${original(...args)}`
                },
                { priority: HookPriority.NORMAL },
            )

            instead(
                obj,
                'method',
                (args, original) => {
                    order.push(3)
                    return `3-${original(...args)}`
                },
                { priority: HookPriority.HIGHEST },
            )

            const result = obj.method()
            expect(order).toEqual([3, 2, 1])
            expect(result).toBe('3-2-1-original')
        })

        test('before hooks with custom priority values', () => {
            const order: number[] = []

            before(
                obj,
                'method',
                args => {
                    order.push(2)
                    return args
                },
                { priority: 0 },
            )

            before(
                obj,
                'method',
                args => {
                    order.push(1)
                    return args
                },
                { priority: -100 },
            )

            before(
                obj,
                'method',
                args => {
                    order.push(3)
                    return args
                },
                { priority: 100 },
            )

            before(
                obj,
                'method',
                args => {
                    order.push(4)
                    return args
                },
                { priority: 150 },
            )

            obj.method()
            expect(order).toEqual([1, 2, 3, 4])
        })

        test('hooks without priority should default to 0', () => {
            const order: number[] = []

            before(
                obj,
                'method',
                args => {
                    order.push(2)
                    return args
                },
                { priority: -10 },
            )

            before(obj, 'method', args => {
                order.push(3)
                return args
            })

            before(
                obj,
                'method',
                args => {
                    order.push(4)
                    return args
                },
                { priority: 10 },
            )

            obj.method()
            expect(order).toEqual([2, 3, 4])
        })
    })
})
