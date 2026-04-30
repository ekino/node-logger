import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Logger, LogLevel } from '../src/index.js'
import * as loggerModule from '../src/index.js'

describe('Logger Module', () => {
    let logger: Logger
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

    beforeAll(() => {
        // Reset state before each test
        loggerModule.setNamespaces('*')
        loggerModule.setLevel('debug')
        loggerModule.setOutput(loggerModule.outputs.json)
        loggerModule.setGlobalContext({})
    })

    afterAll(() => {
        vi.restoreAllMocks()
    })

    describe('createLogger', () => {
        it('should create a logger instance', () => {
            const newLogger = loggerModule.createLogger('newLogger')
            expect(newLogger).toBeDefined()
            expect(newLogger).not.toBe(logger)
        })

        it('should return the same logger for the same namespace', () => {
            logger = loggerModule.createLogger('test:logger')
            const newLogger = loggerModule.createLogger('test:logger')
            expect(newLogger).toBe(logger)
        })
    })

    describe('setNamespaces', () => {
        it('should set namespaces correctly', () => {
            loggerModule.setNamespaces('routeA')
            const l = loggerModule.createLogger('routeA')
            expect(typeof l.info).toBe('function')
        })

        it('should handle invalid namespace input', () => {
            expect(() => loggerModule.setNamespaces('invalid*namespace')).not.toThrow()
        })
    })

    describe('setLevel', () => {
        it('should set the log level correctly', () => {
            loggerModule.setNamespaces('test:setLevel')
            loggerModule.setLevel('info')
            const l = loggerModule.createLogger('test:setLevel')
            expect(l.isLevelEnabled('info')).toBe(true)
        })

        it('should throw an error for invalid log level', () => {
            expect(() => loggerModule.setLevel('invalidLevel' as unknown as LogLevel)).toThrow(
                "Invalid level: 'invalidLevel'"
            )
        })
    })

    describe('setOutput', () => {
        it('should set the output adapter', () => {
            const outputAdapter = vi.fn()
            loggerModule.setOutput(outputAdapter)
            loggerModule.setNamespaces('*')
            loggerModule.setLevel('debug')
            const l = loggerModule.createLogger('test:setOutput')
            l.info('test')
            expect(outputAdapter).toHaveBeenCalled()
        })

        it('should set the output adapters array', () => {
            const outputAdapter1 = vi.fn()
            const outputAdapter2 = vi.fn()
            loggerModule.setOutput([outputAdapter1, outputAdapter2])
            loggerModule.setNamespaces('*')
            loggerModule.setLevel('debug')
            const l = loggerModule.createLogger('test:setOutput2')
            l.info('test')
            expect(outputAdapter1).toHaveBeenCalled()
            expect(outputAdapter2).toHaveBeenCalled()
        })
    })

    describe('setGlobalContext', () => {
        it('should set global context correctly', () => {
            const outputAdapter = vi.fn()
            loggerModule.setOutput(outputAdapter)
            loggerModule.setNamespaces('*')
            loggerModule.setLevel('debug')
            loggerModule.setGlobalContext({ user: 'testUser' })
            const l = loggerModule.createLogger('test:globalCtx')
            l.info('test')
            expect(outputAdapter).toHaveBeenCalled()
            const callArg = outputAdapter.mock.calls[0]?.[0]
            expect(callArg?.meta?.user).toBe('testUser')
        })
    })

    describe('logging methods', () => {
        const outputMock = vi.fn()
        const now = new Date('2021-01-01T00:00:00Z')

        beforeAll(() => {
            vi.useFakeTimers().setSystemTime(now)
        })

        afterAll(() => {
            vi.useRealTimers()
        })

        beforeEach(() => {
            outputMock.mockClear()
            loggerModule.setOutput(outputMock)
            loggerModule.setNamespaces('test1:*')
            loggerModule.setLevel('info')
        })

        it('should call output adapter with log data, metadata, message, and data', () => {
            const log = loggerModule.createLogger('test1:subTest1')

            log.warn('ctxId', 'test', { someData: 'someValue' })

            expect(outputMock).toHaveBeenCalledOnce()

            const outputArg = outputMock.mock.calls[0]?.[0]
            expect(outputArg?.namespace).toBe('test1:subTest1')
            expect(outputArg?.level).toBe('warn')
            expect(outputArg?.time?.getTime()).toBe(now.getTime())
            expect(outputArg?.contextId).toBe('ctxId')
            expect(outputArg?.message).toBe('test')
            expect(outputArg?.data).toEqual({ someData: 'someValue' })
        })

        it('should log and create auto contextId when not given context id', () => {
            loggerModule.setNamespaces('test2:*')
            loggerModule.setLevel('warn')
            const log = loggerModule.createLogger('test2:subTest2')

            log.error('test', { someData: 'someValue' })

            expect(outputMock).toHaveBeenCalledOnce()

            const outputArg = outputMock.mock.calls[0]?.[0]
            expect(outputArg?.namespace).toBe('test2:subTest2')
            expect(outputArg?.level).toBe('error')
            expect(outputArg?.time?.getTime()).toBe(now.getTime())
            expect(outputArg?.contextId).toMatch(uuidRegex)
            expect(outputArg?.message).toBe('test')
            expect(outputArg?.data).toEqual({ someData: 'someValue' })
        })

        it('should not log if level is below the configured log level', () => {
            loggerModule.setNamespaces('test3:*')
            loggerModule.setLevel('warn')
            const log = loggerModule.createLogger('test3:subTest3')

            log.debug('ctxId', 'test', { someData: 'someValue' })

            expect(outputMock).not.toHaveBeenCalled()
        })

        it('should log if forceLogging is enabled regardless of level', () => {
            loggerModule.setNamespaces('test4:*')
            loggerModule.setLevel('warn')
            const log = loggerModule.createLogger('test4:subTest4', true)

            log.debug('ctxId', 'test', { someData: 'someValue' }, true)

            expect(outputMock).toHaveBeenCalledOnce()

            const outputArg = outputMock.mock.calls[0]?.[0]
            expect(outputArg?.namespace).toBe('test4:subTest4')
            expect(outputArg?.level).toBe('debug')
            expect(outputArg?.time?.getTime()).toBe(now.getTime())
            expect(outputArg?.contextId).toBe('ctxId')
            expect(outputArg?.message).toBe('test')
            expect(outputArg?.data).toEqual({ someData: 'someValue' })
        })

        it('should respect namespace-specific log levels', () => {
            loggerModule.setNamespaces('test5:*=debug')
            loggerModule.setLevel('warn')
            const log = loggerModule.createLogger('test5:subTest5')

            log.debug('ctxId', 'debug message', { someData: 'someValue' })

            expect(outputMock).toHaveBeenCalledOnce()

            const outputArg = outputMock.mock.calls[0]?.[0]
            expect(outputArg?.namespace).toBe('test5:subTest5')
            expect(outputArg?.level).toBe('debug')
            expect(outputArg?.message).toBe('debug message')
        })
    })

    describe('id function', () => {
        it('should generate a unique id', () => {
            const uniqueId = loggerModule.id()
            expect(uniqueId).toMatch(uuidRegex)
        })
    })
})
