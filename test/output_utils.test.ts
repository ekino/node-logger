import { describe, expect, it } from 'vitest'
import * as outputUtils from '../src/output_utils.js'

describe('outputUtils', () => {
    describe('stringifyLog', () => {
        it('should handle non-circular objects correctly', () => {
            const obj = { a: '1', b: '2' }

            const result = outputUtils.stringifyLog(obj)
            expect(result).toBe('{"a":"1","b":"2"}')
        })

        it('should handle circular references without throwing errors', () => {
            const obj: { a: string; b: string; c?: Record<string, unknown> } = { a: '1', b: '2' }
            obj.c = obj

            const result = outputUtils.stringifyLog(obj)
            expect(result).toBe('{"a":"1","b":"2"}')
        })

        it('should gracefully stringify objects with deep circular references', () => {
            const obj = { a: { b: { c: {} } } }
            obj.a.b.c = obj

            const result = outputUtils.stringifyLog(obj)
            expect(result).toBe('{"a":{"b":{}}}')
        })

        it('should fallback to standard stringify when fastStringifyLog fails', () => {
            const obj = { test: 'value' }

            const result = outputUtils.stringifyLog(obj)
            expect(result).toBe('{"test":"value"}')
        })
    })

    describe('isObject', () => {
        it('should return true for objects', () => {
            expect(outputUtils.isObject({})).toBe(true)
            expect(outputUtils.isObject({ a: 1 })).toBe(true)
        })

        it('should return false for non-objects', () => {
            expect(outputUtils.isObject(null)).toBe(false)
            expect(outputUtils.isObject(undefined)).toBe(false)
            expect(outputUtils.isObject(42)).toBe(false)
            expect(outputUtils.isObject('string')).toBe(false)
            expect(outputUtils.isObject([])).toBe(false)
            expect(outputUtils.isObject(true)).toBe(false)
        })
    })
})
