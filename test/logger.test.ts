import * as logger from '../src/index'
import * as outputAdapters from '../src/output_adapters'

describe('logger', () => {
    let writeSpy: jest.SpyInstance, stdoutStub: jest.SpyInstance

    beforeAll(() => {
        writeSpy = jest.spyOn(logger, 'write')
        stdoutStub = jest.spyOn(process.stdout, 'write')
    })

    beforeEach(() => {
        stdoutStub.mockImplementation(() => {})
        logger.setOutput([])
    })
    afterEach(() => writeSpy.mockClear())
    afterAll(() => writeSpy.mockRestore())

    describe('createLogger', () => {
        it('A logger instance should have levels function and isLevelEnabled function', () => {
            logger.setNamespaces('*')
            logger.setLevel('trace')

            const log = logger.createLogger()
            expect(typeof log.trace).toEqual('function')
            expect(typeof log.debug).toEqual('function')
            expect(typeof log.info).toEqual('function')
            expect(typeof log.warn).toEqual('function')
            expect(typeof log.error).toEqual('function')
            expect(typeof log.isLevelEnabled).toEqual('function')
        })
    })

    describe('debug', () => {
        it("A logger instance shouldn't log if level is lower than enabled level", () => {
            logger.setNamespaces('*')
            logger.setLevel('info')

            const log = logger.createLogger()
            log.debug('message', { data: 'some data' })

            expect(writeSpy).toHaveBeenCalledTimes(0)
        })

        it('A logger instance should log if log level is higher or equal than namespace pattern level', () => {
            logger.setNamespaces('test:*=debug')

            logger.setLevel('info')

            const log = logger.createLogger('test:subtest')

            log.debug('message', { data: 'some data' })
            expect(writeSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('warn', () => {
        let jsonSpy: jest.SpyInstance, prettySpy: jest.SpyInstance

        beforeAll(() => {
            jsonSpy = jest.spyOn(outputAdapters, 'json')
            prettySpy = jest.spyOn(outputAdapters, 'pretty')
        })
        afterEach(() => {
            jsonSpy.mockClear()
            prettySpy.mockClear()
        })
        afterAll(() => {
            jsonSpy.mockRestore()
            prettySpy.mockRestore()
        })

        it('A logger instance should log according to state defined in the latest matching namespace in the list', () => {
            logger.setNamespaces('test:*=warn,test2:*,test:*=error,test2:*=none')

            logger.setLevel('info')

            const log = logger.createLogger('test:subtest')
            const log2 = logger.createLogger('test2:subtest')
            log.warn('message', { data: 'some data' })
            log2.info('test')
            expect(writeSpy).toHaveBeenCalledTimes(0)
        })

        it('A logger should call an output adapter with log data, metadata, message and data', () => {
            logger.setNamespaces('test:*')
            logger.setLevel('info')

            logger.setOutput(outputAdapters.json)

            const now = new Date()

            const log = logger.createLogger('test:subTest')
            jest.useFakeTimers('modern')
            jest.setSystemTime(now)

            log.warn('ctxId', 'test', { someData: 'someValue' })

            expect(jsonSpy).toHaveBeenCalledTimes(1)

            const outputArg = jsonSpy.mock.calls[0][0]

            expect(outputArg.namespace).toEqual('test:subTest')
            expect(outputArg.level).toEqual('warn')
            expect(outputArg.time.getTime()).toEqual(now.getTime())
            expect(outputArg.contextId).toEqual('ctxId')
            expect(outputArg.message).toEqual('test')
            expect(outputArg.data).toEqual({ someData: 'someValue' })

            jest.useRealTimers()
        })

        it('A logger should call all output output adapters added', () => {
            logger.setNamespaces('test:*')
            logger.setLevel('info')
            logger.setOutput([outputAdapters.json, outputAdapters.pretty])

            const now = new Date()

            const log = logger.createLogger('test:subTest')
            jest.useFakeTimers('modern')
            jest.setSystemTime(now)

            log.warn('ctxId', 'test', { someData: 'someValue' })

            expect(jsonSpy).toHaveBeenCalledTimes(1)
            expect(prettySpy).toHaveBeenCalledTimes(1)

            const outputArg1 = jsonSpy.mock.calls[0][0]
            const outputArg2 = prettySpy.mock.calls[0][0]

            expect(outputArg1.namespace).toEqual('test:subTest')
            expect(outputArg1.level).toEqual('warn')
            expect(outputArg1.time.getTime()).toEqual(now.getTime())
            expect(outputArg1.contextId).toEqual('ctxId')
            expect(outputArg1.message).toEqual('test')
            expect(outputArg1.data).toEqual({ someData: 'someValue' })

            expect(outputArg2.namespace).toEqual('test:subTest')
            expect(outputArg2.level).toEqual('warn')
            expect(outputArg2.time.getTime()).toEqual(now.getTime())
            expect(outputArg2.contextId).toEqual('ctxId')
            expect(outputArg2.message).toEqual('test')
            expect(outputArg2.data).toEqual({ someData: 'someValue' })

            jest.useRealTimers()
        })

        it("A logger shouldn't throw an error if not outputs defined", () => {
            logger.setNamespaces('test:*')
            logger.setLevel('info')

            logger.setOutput()

            const log = logger.createLogger('test:subTest')

            log.warn('ctxId', 'test', { someData: 'someValue' })
        })

        it('A logger should support defining a global context', () => {
            logger.setNamespaces('test:*')
            logger.setLevel('info')
            logger.setGlobalContext({ service: 'logger', mode: 'testing' })

            logger.setOutput(outputAdapters.json)

            const now = new Date()

            const log = logger.createLogger('test:global:context')
            jest.useFakeTimers('modern')
            jest.setSystemTime(now)

            log.warn('ctxId', 'test')

            expect(jsonSpy).toHaveBeenCalledTimes(1)

            const outputArg = jsonSpy.mock.calls[0][0]

            expect(outputArg.namespace).toEqual('test:global:context')
            expect(outputArg.level).toEqual('warn')
            expect(outputArg.time.getTime()).toEqual(now.getTime())
            expect(outputArg.contextId).toEqual('ctxId')
            expect(outputArg.meta.service).toEqual('logger')
            expect(outputArg.meta.mode).toEqual('testing')
            expect(outputArg.message).toEqual('test')

            jest.useRealTimers()
        })

        it('A logger contextId arg should be an an optional argument', () => {
            logger.setNamespaces('ns1:*')
            logger.setLevel('info')

            logger.setOutput(outputAdapters.pretty)

            const now = new Date()

            const log = logger.createLogger('ns1:subns1')
            jest.useFakeTimers('modern')
            jest.setSystemTime(now)

            log.warn('msg1', { key1: 'value1' })

            expect(prettySpy).toHaveBeenCalledTimes(1)

            const outputArg = prettySpy.mock.calls[0][0]

            expect(outputArg.level).toEqual('warn')
            expect(outputArg.time.getTime()).toEqual(now.getTime())
            expect(typeof outputArg.contextId).toEqual('string')
            expect(outputArg.message).toEqual('msg1')
            expect(outputArg.data).toEqual({ key1: 'value1' })

            jest.useRealTimers()
        })
    })

    describe('info', () => {
        it('A logger instance should log if level and namespace are enabled', () => {
            logger.setNamespaces('*')
            logger.setLevel('info')

            const log = logger.createLogger()

            log.info('message', { data: 'some data' })
            expect(writeSpy).toHaveBeenCalledTimes(1)
        })

        it("A logger instance shouldn't log if namespace is not enabled", () => {
            logger.setNamespaces('test:*')

            logger.setLevel('info')

            const log = logger.createLogger('default')

            log.info('message', { data: 'some data' })

            expect(writeSpy).toHaveBeenCalledTimes(0)
        })

        it("A logger instance shouldn't log if log level is lower than namespace pattern level", () => {
            logger.setNamespaces('test:*=error')
            logger.setLevel('info')

            const log = logger.createLogger('test:subtest')

            log.info('message', { data: 'some data' })

            expect(writeSpy).toHaveBeenCalledTimes(0)
        })

        it("A logger should not log if it's namespace is disabled after call to setNamespaces", () => {
            logger.setNamespaces('*')
            logger.setLevel('info')

            const log = logger.createLogger('ns1')

            log.info('msg1', { data: 'some data' })
            logger.setNamespaces('ns2:*,ns3:*')
            log.info('msg2', { data: 'some data' })

            expect(writeSpy).toHaveBeenCalledTimes(1)
            expect(writeSpy.mock.calls[0][0].message).toEqual('msg1')
        })

        it('A logger should not log if log level is not upper after call to setLevel', () => {
            logger.setNamespaces('*')
            logger.setLevel('info')

            const log = logger.createLogger('ns1')

            log.info('msg1')
            logger.setLevel('warn')
            log.info('msg2')

            expect(writeSpy).toHaveBeenCalledTimes(1)
            expect(writeSpy.mock.calls[0][0].message).toEqual('msg1')
        })

        it('A logger should not log if upper namespace was enabled, but sub namespace level was set to none', () => {
            logger.setNamespaces('ns1:*,ns1:subns1=none')
            logger.setLevel('info')

            const log = logger.createLogger('ns1:subns1')

            log.info('msg1')

            expect(writeSpy).toHaveBeenCalledTimes(0)
        })
    })

    describe('namespace', () => {
        it('A logger should return true for a call to isLevelEnabled if level and namespace is enabled', () => {
            logger.setNamespaces('ns1:*,ns1:subns1=none')
            logger.setLevel('info')

            const log = logger.createLogger('ns1:subns2')

            expect(log.isLevelEnabled('warn')).toBeTruthy()
        })

        it('A logger should return false for a call to isLevelEnabled if namespace level was set to none', () => {
            logger.setNamespaces('ns1:*,ns1:subns1=none')
            logger.setLevel('info')

            const log = logger.createLogger('ns1:subns1')

            expect(log.isLevelEnabled('warn')).toBeFalsy()
        })

        it('A logger should return true for a call to isLevelEnabled if top namespace is enabled but another subnamespace is set to none', () => {
            logger.setNamespaces('ns1:*,ns1:subns1=none')
            logger.setLevel('error')

            const log = logger.createLogger('ns1:subns2')

            expect(log.isLevelEnabled('warn')).toBeFalsy()
        })

        it('loggers should be equal if they are for the same namespace', () => {
            logger.setNamespaces('ns1:*,ns1:subns1=none')
            logger.setLevel('error')

            const log1 = logger.createLogger('ns1:subns2')
            const log2 = logger.createLogger('ns1:subns2')

            expect(log1).toEqual(log2)
        })
    })

    describe('parseNamespace', () => {
        it('parseNamespace should return a namespace if there is no level', () => {
            const result = logger.parseNamespace('test:*')
            expect(result).toEqual({ regex: /^test:.*?$/ })
        })

        it('parseNamespace should return a namespace and a level', () => {
            const result = logger.parseNamespace('test:*=info')
            expect(result).toEqual({ regex: /^test:.*?$/, level: 2 })
        })

        it('parseNamespace should return null if namespace is missing', () => {
            const result = logger.parseNamespace('=info')
            expect(result).toBe(null)
        })

        it('parseNamespace should return null if namespace is empty', () => {
            const result = logger.parseNamespace('')
            expect(result).toBe(null)
        })
    })
})
