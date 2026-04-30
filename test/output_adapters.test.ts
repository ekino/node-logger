import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    type MockInstance,
    vi,
} from 'vitest'
import { colors } from '../src/colors.js'
import {
    json,
    logStream,
    pretty,
    prettyOutput,
    prettyTime,
    twoDigitNumber,
} from '../src/output_adapters.js'

describe('Log Output Adapters', () => {
    const time = new Date(1547205226232)
    const timeFormatted = '2019-01-11 11:13:46'

    describe('twoDigitNumber', () => {
        it('adds a leading 0 for numbers < 10', () => {
            expect(twoDigitNumber(3)).toBe('03')
            expect(twoDigitNumber(1)).toBe('01')
        })

        it('returns numbers >= 10 unchanged as strings', () => {
            expect(twoDigitNumber(88)).toBe('88')
        })

        it('returns empty string for undefined input', () => {
            expect(twoDigitNumber(undefined)).toBe('')
        })
    })

    describe('prettyTime', () => {
        it('formats time as yyyy-mm-dd hh:mm:ss', () => {
            expect(prettyTime(time)).toBe(timeFormatted)
        })

        it('returns undefined if no time is provided', () => {
            expect(prettyTime(undefined)).toBeUndefined()
        })
    })

    describe('pretty', () => {
        let writeOutputStub: MockInstance

        beforeAll(() => {
            writeOutputStub = vi.spyOn(logStream, 'write')
        })

        beforeEach(() => {
            writeOutputStub.mockImplementation(() => {})
        })

        afterEach(() => writeOutputStub.mockClear())
        afterAll(() => writeOutputStub.mockRestore())

        it('writes formatted log output to stdout', () => {
            pretty({
                level: 'warn',
                namespace: 'test1',
                time,
                contextId: 'ctxId',
                meta: { field1: 'value1' },
                message: 'test message',
                data: { someData: 'someValue' },
            })

            const expectedOutput = `${timeFormatted} (test1) [warn] : ${colors.yellow('test message')}\n${prettyOutput({ contextId: 'ctxId', meta: { field1: 'value1' }, data: { someData: 'someValue' } }, { maxDepth: 6 }, 2)}\n`
            expect(writeOutputStub).toHaveBeenCalledWith(expectedOutput)
        })

        it('handles undefined log level with default to error', () => {
            pretty({
                level: undefined as unknown as 'error',
                namespace: 'test2',
                time,
                contextId: 'ctxId',
                meta: {},
                message: 'test message',
                data: {},
            })

            const expectedOutput = `${timeFormatted} (test2) [error] : ${colors.red('test message')}\n${prettyOutput({ contextId: 'ctxId', meta: {}, data: {} }, { maxDepth: 6 }, 2)}\n`
            expect(writeOutputStub).toHaveBeenCalledWith(expectedOutput)
        })

        it('handles undefined message with empty string', () => {
            pretty({
                level: 'info',
                namespace: 'test3',
                time,
                contextId: 'ctxId',
                meta: {},
                message: undefined as unknown as string,
                data: {},
            })

            const expectedOutput = `${timeFormatted} (test3) [info] : ${colors.blue('')}\n${prettyOutput({ contextId: 'ctxId', meta: {}, data: {} }, { maxDepth: 6 }, 2)}\n`
            expect(writeOutputStub).toHaveBeenCalledWith(expectedOutput)
        })
    })

    describe('json', () => {
        let writeOutputStub: MockInstance

        beforeAll(() => {
            writeOutputStub = vi.spyOn(logStream, 'write')
        })

        beforeEach(() => {
            writeOutputStub.mockImplementation(() => {})
        })

        afterEach(() => writeOutputStub.mockClear())
        afterAll(() => writeOutputStub.mockRestore())

        it('writes JSON formatted log output to stdout', () => {
            json({
                level: 'warn',
                namespace: 'test1',
                time,
                contextId: 'ctxId',
                meta: { field1: 'value1' },
                message: 'test message',
                data: { someData: 'someValue' },
            })

            expect(writeOutputStub).toHaveBeenCalledWith(
                `{"level":"warn","time":"2019-01-11T11:13:46.232Z","namespace":"test1","contextId":"ctxId","field1":"value1","message":"test message","data":{"someData":"someValue"}}\n`
            )
        })

        it('outputs JSON with time when time is provided', () => {
            json({
                level: 'warn',
                namespace: 'test1',
                time: time,
                contextId: 'ctxId',
                meta: { field1: 'value1' },
                message: 'test message',
                data: { someData: 'someValue' },
            })

            expect(writeOutputStub).toHaveBeenCalledWith(
                `{"level":"warn","time":"2019-01-11T11:13:46.232Z","namespace":"test1","contextId":"ctxId","field1":"value1","message":"test message","data":{"someData":"someValue"}}\n`
            )
        })
    })

    describe('logStream', () => {
        let writeSpy: MockInstance

        beforeEach(() => {
            writeSpy = vi.spyOn(process.stdout, 'write')
            writeSpy.mockImplementation(() => {})
        })

        afterEach(() => {
            writeSpy.mockRestore()
        })

        it('should write chunk to process.stdout with specified encoding', () => {
            const testChunk = Buffer.from('test log data')
            const testEncoding = 'utf8'

            logStream.write(testChunk, testEncoding, (error) => {
                expect(error).toBeUndefined()
                expect(writeSpy).toHaveBeenCalledOnce()
                expect(writeSpy).toHaveBeenCalledWith(testChunk, testEncoding, expect.any(Function))
            })
        })

        it('should handle multiple writes', () => {
            const chunks = ['log1', 'log2', 'log3']
            const encoding = 'utf8'

            chunks.forEach((chunk, index) => {
                logStream.write(chunk, encoding, (error) => {
                    expect(error).toBeUndefined()
                    if (index === chunks.length - 1) {
                        expect(writeSpy).toHaveBeenCalledTimes(chunks.length)
                        chunks.forEach((chk, idx) => {
                            expect(writeSpy).toHaveBeenNthCalledWith(
                                idx + 1,
                                chk,
                                encoding,
                                expect.any(Function)
                            )
                        })
                    }
                })
            })
        })
    })
})
