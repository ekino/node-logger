import _ from 'lodash'

import * as outputAdapters from '../src/output_adapters'
import * as logger from '../src/index'
import { LogInstance } from '../src/definitions'

describe('outputAdapters', () => {
    let writeOutputSpy: jest.SpyInstance

    beforeAll(() => {
        writeOutputSpy = jest.spyOn(process.stdout, 'write')
    })
    beforeEach(() => {
        writeOutputSpy.mockImplementation(() => {})
        logger.setOutput([])
    })

    afterEach(() => {
        writeOutputSpy.mockClear()
    })
    afterAll(() => writeOutputSpy.mockRestore())

    const fakeTimer = (time: Date): void => {
        jest.useFakeTimers('modern')
        jest.setSystemTime(time)
    }

    describe('json', () => {
        it('should write a Json Object with expected data and an \\n to stdout if enabled', () => {
            const now = new Date()

            const log: LogInstance = {
                level: 'warn',
                namespace: 'test1',
                time: now,
                contextId: 'ctxId',
                meta: { field1: 'value1' },
                message: 'test',
                data: { someData: 'someValue' },
            }

            outputAdapters.json(_.cloneDeep(log))

            expect(writeOutputSpy).toHaveBeenCalledTimes(2)
            const firstCall = writeOutputSpy.mock.calls[0][0]
            const secondCall = writeOutputSpy.mock.calls[1][0]
            const parsedObject = JSON.parse(firstCall)

            expect(parsedObject.namespace).toEqual(log.namespace)
            expect(parsedObject.level).toEqual(log.level)
            expect(parsedObject.time).toEqual(log.time?.toISOString())
            expect(parsedObject.contextId).toEqual(log.contextId)
            expect(parsedObject.field1).toEqual(log.meta?.field1)
            expect(parsedObject.message).toEqual(log.message)
            expect(parsedObject.data).toEqual(log.data)
            expect(secondCall).toEqual('\n')
        })

        it('JSON Output Adpater should work if used by logger', () => {
            logger.setNamespaces('test:*')
            logger.setLevel('info')
            logger.setOutput(outputAdapters.json)
            const now = new Date()
            fakeTimer(now)

            const log = logger.createLogger('test:subTest')
            log.warn('ctxId', 'test', { someData: 'someValue' })

            expect(writeOutputSpy).toHaveBeenCalledTimes(2)
            const firstCall = writeOutputSpy.mock.calls[0][0]
            const secondCall = writeOutputSpy.mock.calls[1][0]
            const parsedObject = JSON.parse(firstCall)

            expect(parsedObject.namespace).toEqual('test:subTest')
            expect(parsedObject.level).toEqual('warn')
            expect(parsedObject.time).toEqual(now.toISOString())
            expect(parsedObject.contextId).toEqual('ctxId')
            expect(parsedObject.message).toEqual('test')
            expect(parsedObject.data).toEqual({ someData: 'someValue' })
            expect(secondCall).toEqual('\n')

            jest.useRealTimers()
        })
    })

    describe('pretty', () => {
        it('pretty output adapter should write yaml like data and an \\n to stdout if enabled', () => {
            const logInstance: LogInstance = {
                level: 'warn',
                namespace: 'test1',
                time: new Date(1547205226232),
                contextId: 'ctxId',
                meta: { field1: 'value1' },
                message: 'test',
                data: { someData: 'someValue' },
            }

            outputAdapters.pretty(_.cloneDeep(logInstance))

            expect(writeOutputSpy).toHaveBeenCalledTimes(2)
            const firstCall = writeOutputSpy.mock.calls[0][0]
            const secondCall = writeOutputSpy.mock.calls[1][0]

            // let expected = `${outputAdapters.prettyTime(logInstance.time)} (test1) [warn] : \u001b[33mtest\u001b[39m\n`
            // expected += '\u001b[32m  contextId: \u001b[39mctxId\n'
            // expected += '\u001b[32m  meta: \u001b[39m\n'
            // expected += '\u001b[32m    field1: \u001b[39mvalue1\n'
            // expected += '\u001b[32m  data: \u001b[39m\n'
            // expected += '\u001b[32m    someData: \u001b[39msomeValue\n'
            //

            //@TODO: compare string with color is not working with github actions, to fix this
            // expect(firstCall).toMatch(expected)
            expect(typeof firstCall).toBe('string')
            expect(secondCall).toEqual('\n')
        })

        it('pretty output adapter should work if used by logger', () => {
            const now = new Date()
            logger.setNamespaces('test:*')
            logger.setLevel('info')
            logger.setOutput(outputAdapters.pretty)
            fakeTimer(now)

            const log = logger.createLogger('test:subTest')
            log.warn('ctxId', 'test', { someData: 'someValue' })

            expect(writeOutputSpy).toHaveBeenCalledTimes(2)
            const firstCall = writeOutputSpy.mock.calls[0][0]
            const secondCall = writeOutputSpy.mock.calls[1][0]

            // let expected = `${outputAdapters.prettyTime(now)} (test:subTest) [warn] : \u001b[33mtest\u001b[39m\n`
            // expected += '\u001b[32m  contextId: \u001b[39mctxId\n'
            // expected += '\u001b[32m  data: \u001b[39m\n'
            // expected += '\u001b[32m    someData: \u001b[39msomeValue\n'
            //
            // expect(firstCall).toMatch(expected)
            expect(typeof firstCall).toBe('string')
            expect(secondCall).toEqual('\n')

            jest.useRealTimers()
        })
    })
})
