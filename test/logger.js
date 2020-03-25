'use strict'
/* eslint-disable no-shadow */

const test = require('ava')
const sinon = require('sinon')

const logger = require('../index')

test.beforeEach((t) => {
    logger.setOutput([])
})

test('A logger instance should have levels function and isLevelEnabled function', (t) => {
    const log = logger.createLogger()
    t.is(typeof log.trace, 'function')
    t.is(typeof log.debug, 'function')
    t.is(typeof log.info, 'function')
    t.is(typeof log.warn, 'function')
    t.is(typeof log.error, 'function')
    t.is(typeof log.isLevelEnabled, 'function')
    t.is(typeof log.none, 'undefined')
})

test('A logger instance should only accept functions', (t) => {
    const error = t.throws(
        () => {
            logger.setOutput('invalid')
        },
        { instanceOf: Error }
    )

    t.is(error.message, `Invalid output: 'invalid'`)
})

test('A logger instance should only accept allowed levels', (t) => {
    const error = t.throws(
        () => {
            logger.setLevel('invalid')
        },
        { instanceOf: Error }
    )

    t.is(error.message, `Invalid level: 'invalid'`)
})

test('A logger instance should log if level and namespace are enabled', (t) => {
    logger.setNamespaces('*')
    logger.setLevel('info')

    const log = logger.createLogger()
    const spy = sinon.spy(logger.internals, 'write')

    log.info(null)
    t.true(spy.calledOnce)

    logger.internals.write.restore()
})

test("A logger instance shouldn't log if level is lower than enabled level", (t) => {
    logger.setNamespaces('*')
    logger.setLevel('info')

    const log = logger.createLogger()
    const spy = sinon.spy(logger.internals, 'write')

    log.debug(null, 'test')

    t.is(spy.callCount, 0)

    logger.internals.write.restore()
})

test("A logger instance shouldn't log if namespace is not enabled", (t) => {
    logger.setNamespaces('test:*')

    logger.setLevel('info')

    const log = logger.createLogger('default')
    const spy = sinon.spy(logger.internals, 'write')

    log.info(null, 'test')

    t.is(spy.callCount, 0)

    logger.internals.write.restore()
})

test("A logger instance shouldn't log if log level is lower than namespace pattern level", (t) => {
    logger.setNamespaces('test:*=error')

    logger.setLevel('info')

    const log = logger.createLogger('test:subtest')
    const spy = sinon.spy(logger.internals, 'write')

    log.info(null, 'test')

    t.is(spy.callCount, 0)

    logger.internals.write.restore()
})

test('A logger instance should log if log level is higher or equal than namespace pattern level', (t) => {
    logger.setNamespaces('test:*=debug')

    logger.setLevel('info')

    const log = logger.createLogger('test:subtest')
    const spy = sinon.spy(logger.internals, 'write')

    log.debug(null)
    t.true(spy.calledOnce)

    logger.internals.write.restore()
})

test('A logger instance should log according to state defined in the latest matching namespace in the list', (t) => {
    logger.setNamespaces('test:*=warn,test2:*,test:*=error,test2:*=none')

    logger.setLevel('info')

    const log = logger.createLogger('test:subtest')
    const log2 = logger.createLogger('test2:subtest')
    const spy = sinon.spy(logger.internals, 'write')

    log.warn(null)
    log2.info('test')
    t.is(spy.callCount, 0)

    logger.internals.write.restore()
})

test('A logger should call an output adapter with log data, metadata, message and data', (t) => {
    logger.setNamespaces('test:*')
    logger.setLevel('info')

    const outputAdapter = sinon.spy()
    logger.setOutput(outputAdapter)

    const now = new Date()

    const log = logger.createLogger('test:subTest')
    const timersStub = sinon.useFakeTimers(now.getTime())

    log.warn('ctxId', 'test', { someData: 'someValue' })

    t.true(outputAdapter.calledOnce)

    const outputArg = outputAdapter.firstCall.args[0]

    t.is(outputArg.namespace, 'test:subTest')
    t.is(outputArg.level, 'warn')
    t.is(outputArg.time.getTime(), now.getTime())
    t.is(outputArg.contextId, 'ctxId')
    t.is(outputArg.message, 'test')
    t.deepEqual(outputArg.data, { someData: 'someValue' })

    timersStub.restore()
})

test('A logger should call all output output adapters added', (t) => {
    logger.setNamespaces('test:*')
    logger.setLevel('info')

    const outputAdapter1 = sinon.spy()
    const outputAdapter2 = sinon.spy()
    logger.setOutput([outputAdapter1, outputAdapter2])

    const now = new Date()

    const log = logger.createLogger('test:subTest')
    const timersStub = sinon.useFakeTimers(now.getTime())

    log.warn('ctxId', 'test', { someData: 'someValue' })

    t.true(outputAdapter1.calledOnce)
    t.true(outputAdapter2.calledOnce)

    const outputArg1 = outputAdapter1.firstCall.args[0]
    const outputArg2 = outputAdapter2.firstCall.args[0]

    t.is(outputArg1.namespace, 'test:subTest')
    t.is(outputArg1.level, 'warn')
    t.is(outputArg1.time.getTime(), now.getTime())
    t.is(outputArg1.contextId, 'ctxId')
    t.is(outputArg1.message, 'test')
    t.deepEqual(outputArg1.data, { someData: 'someValue' })

    t.is(outputArg2.namespace, 'test:subTest')
    t.is(outputArg2.level, 'warn')
    t.is(outputArg2.time.getTime(), now.getTime())
    t.is(outputArg2.contextId, 'ctxId')
    t.is(outputArg2.message, 'test')
    t.deepEqual(outputArg2.data, { someData: 'someValue' })

    timersStub.restore()
})

test("A logger shoudn't throw an error if not outputs defined", (t) => {
    logger.setNamespaces('test:*')
    logger.setLevel('info')

    logger.setOutput()

    const log = logger.createLogger('test:subTest')

    log.warn('ctxId', 'test', { someData: 'someValue' })
    t.true(true)
})

test('A logger should support defining a global context', (t) => {
    logger.setNamespaces('test:*')
    logger.setLevel('info')
    logger.setGlobalContext({ service: 'logger', mode: 'testing' })

    const outputAdapter = sinon.spy()
    logger.setOutput(outputAdapter)

    const now = new Date()

    const log = logger.createLogger('test:global:context')
    const timersStub = sinon.useFakeTimers(now.getTime())

    log.warn('ctxId', 'test')

    t.true(outputAdapter.calledOnce)

    const outputArg = outputAdapter.firstCall.args[0]

    t.is(outputArg.namespace, 'test:global:context')
    t.is(outputArg.level, 'warn')
    t.is(outputArg.time.getTime(), now.getTime())
    t.is(outputArg.contextId, 'ctxId')
    t.is(outputArg.meta.service, 'logger')
    t.is(outputArg.meta.mode, 'testing')
    t.is(outputArg.message, 'test')

    timersStub.restore()
})

test('A logger contextId arg should be an an optional argument', (t) => {
    logger.setNamespaces('ns1:*')
    logger.setLevel('info')

    const outputAdapter = sinon.spy()
    logger.setOutput(outputAdapter)

    const now = new Date()

    const log = logger.createLogger('ns1:subns1')
    const timersStub = sinon.useFakeTimers(now.getTime())

    log.warn('msg1', { key1: 'value1' })

    t.true(outputAdapter.calledOnce)

    const outputArg = outputAdapter.firstCall.args[0]

    t.is(outputArg.level, 'warn')
    t.is(outputArg.time.getTime(), now.getTime())
    t.is(typeof outputArg.contextId, 'string')
    t.is(outputArg.message, 'msg1')
    t.deepEqual(outputArg.data, { key1: 'value1' })

    timersStub.restore()
})

test("A logger should not log if it's namespace is disabled after call to setNamespaces", (t) => {
    logger.setNamespaces('*')
    logger.setLevel('info')

    const log = logger.createLogger('ns1')
    const spy = sinon.spy(logger.internals, 'write')

    log.info(null, 'msg1')
    logger.setNamespaces('ns2:*,ns3:*')
    log.info(null, 'msg2')

    t.true(spy.calledOnce)
    t.is(spy.args[0][0].message, 'msg1')

    logger.internals.write.restore()
})

test('A logger should not log if log level is not upper after call to setLevel', (t) => {
    logger.setNamespaces('*')
    logger.setLevel('info')

    const log = logger.createLogger('ns1')
    const spy = sinon.spy(logger.internals, 'write')

    log.info(null, 'msg1')
    logger.setLevel('warn')
    log.info(null, 'msg2')

    t.true(spy.calledOnce)
    t.is(spy.args[0][0].message, 'msg1')

    logger.internals.write.restore()
})

test('A logger should not log if upper namespace was enabled, but sub namespace level was set to none', (t) => {
    logger.setNamespaces('ns1:*,ns1:subns1=none')
    logger.setLevel('info')

    const log = logger.createLogger('ns1:subns1')
    const spy = sinon.spy(logger.internals, 'write')

    log.info(null, 'msg1')

    t.is(spy.callCount, 0)

    logger.internals.write.restore()
})

test('A logger should return true for a call to isLevelEnabled if level and namespace is enabled', (t) => {
    logger.setNamespaces('ns1:*,ns1:subns1=none')
    logger.setLevel('info')

    const log = logger.createLogger('ns1:subns2')
    t.true(log.isLevelEnabled('warn'))
})

test('A logger should return false for a call to isLevelEnabled if namespace level was set to none', (t) => {
    logger.setNamespaces('ns1:*,ns1:subns1=none')
    logger.setLevel('info')

    const log = logger.createLogger('ns1:subns1')
    t.false(log.isLevelEnabled('warn'))
})

test('A logger should return true for a call to isLevelEnabled if top namespace is enabled but another subnamespace is set to none', (t) => {
    logger.setNamespaces('ns1:*,ns1:subns1=none')
    logger.setLevel('error')

    const log = logger.createLogger('ns1:subns2')
    t.false(log.isLevelEnabled('warn'))
})

test('loggers should be equal if they are for the same namespace', (t) => {
    logger.setNamespaces('ns1:*,ns1:subns1=none')
    logger.setLevel('error')

    const log1 = logger.createLogger('ns1:subns2')
    const log2 = logger.createLogger('ns1:subns2')
    t.is(log1, log2)
})

test('parseNamespace should return a namespace if there is no level', (t) => {
    const result = logger.internals.parseNamespace('test:*')
    t.deepEqual(result, { regex: /^test:.*?$/ })
})

test('parseNamespace should return a namespace and a level', (t) => {
    const result = logger.internals.parseNamespace('test:*=info')
    t.deepEqual(result, { regex: /^test:.*?$/, level: 2 })
})

test('parseNamespace should return null if namespace is missing', (t) => {
    const result = logger.internals.parseNamespace('=info')
    t.deepEqual(result, null)
})

test('parseNamespace should return null if namespace is empty', (t) => {
    const result = logger.internals.parseNamespace('')
    t.deepEqual(result, null)
})
