'use strict'
/* eslint-disable no-shadow */

import test from 'ava'
import sinon, { stub, useFakeTimers } from 'sinon'
import { createLogger, parseNamespace, setGlobalContext, setLevel, setNamespaces, setOutput, loggerMock } from '../src/index.js'

test.beforeEach(() => {
    setOutput([])
})

test('A logger instance should have levels function and isLevelEnabled function', (t) => {
    const log = createLogger()
    t.is(typeof log.trace, 'function')
    t.is(typeof log.debug, 'function')
    t.is(typeof log.info, 'function')
    t.is(typeof log.warn, 'function')
    t.is(typeof log.error, 'function')
    t.is(typeof log.isLevelEnabled, 'function')
})

test('A logger instance should only accept functions', (t) => {
    const error = t.throws(
        () => {
            setOutput('invalid')
        },
        { instanceOf: Error },
    )

    t.is(error.message, `Invalid output: 'invalid'`)
})

test('A logger instance should only accept allowed levels', (t) => {
    const error = t.throws(
        () => {
            setLevel('invalid')
        },
        { instanceOf: Error },
    )

    t.is(error.message, `Invalid level: 'invalid'`)
})

test('A logger instance should log if level and namespace are enabled', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('*')
    setLevel('info')

    const log = createLogger()

    log.info('')
    t.is(writeStub.callCount, 1)

    writeStub.restore()
})

test("A logger instance shouldn't log if level is lower than enabled level", (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('*')
    setLevel('info')

    const log = createLogger()

    log.debug('', 'test')

    t.is(writeStub.callCount, 0)
    writeStub.restore()
})

test('A logger instance should log if instance can forceWrite and forceLogging is truthy', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('*')
    setLevel('info')

    const log = createLogger('test', true)

    log.debug('', {}, true)

    t.is(writeStub.callCount, 1)
    writeStub.restore()
})

test('setLevel and setNamespace should not reset canForceWrite', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    const log = createLogger('test', true)
    setNamespaces('*')
    setLevel('info')

    log.debug('', {}, true)

    t.is(writeStub.callCount, 1)
    writeStub.restore()
})

test("A logger instance shouldn't log if namespace is not enabled", (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('test:*')

    setLevel('info')

    const log = createLogger('default')

    log.info('', 'test')

    t.is(writeStub.callCount, 0)
    writeStub.restore()
})

test("A logger instance shouldn't log if log level is lower than namespace pattern level", (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('test:*=error')

    setLevel('info')

    const log = createLogger('test:subtest')

    log.info('', 'test')

    t.is(writeStub.callCount, 0)
    writeStub.restore()
})

test('A logger instance should log if log level is higher or equal than namespace pattern level', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('test:*=debug')

    setLevel('info')

    const log = createLogger('test:subtest')

    log.debug('')
    t.true(writeStub.calledOnce)
    writeStub.restore()
})

test('A logger instance should log according to state defined in the latest matching namespace in the list', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('test:*=warn,test2:*,test:*=error,test2:*=none')

    setLevel('info')

    const log = createLogger('test:subtest')
    const log2 = createLogger('test2:subtest')

    log.warn('')
    log2.info('test')
    t.is(writeStub.callCount, 1)

    writeStub.restore()
})

test('A logger should call an output adapter with log data, metadata, message and data', (t) => {
    const now = new Date()
    const timersStub = useFakeTimers(now.getTime())

    setNamespaces('test:*')
    setLevel('info')

    const outputAdapter = stub()
    setOutput(outputAdapter)

    const log = createLogger('test:subTest')

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
    const now = new Date()
    const timersStub = useFakeTimers(now.getTime())

    setNamespaces('test:*')
    setLevel('info')

    const outputAdapter1 = stub()
    const outputAdapter2 = stub()
    setOutput([outputAdapter1, outputAdapter2])

    const log = createLogger('test:subTest')

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
    setNamespaces('test:*')
    setLevel('info')

    setOutput()

    const log = createLogger('test:subTest')

    log.warn('ctxId', 'test', { someData: 'someValue' })
    t.true(true)
})

test('A logger should support defining a global context', (t) => {
    const now = new Date()
    const timersStub = useFakeTimers(now.getTime())

    setNamespaces('test:*')
    setLevel('info')
    setGlobalContext({ service: 'logger', mode: 'testing' })

    const outputAdapter = stub()
    setOutput(outputAdapter)

    const log = createLogger('test:global:context')

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
    const now = new Date()
    const timersStub = useFakeTimers(now.getTime())

    setNamespaces('ns1:*')
    setLevel('info')

    const outputAdapter = stub()
    setOutput(outputAdapter)

    const log = createLogger('ns1:subns1')

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
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('*')
    setLevel('info')

    const log = createLogger('ns1')

    log.info('', 'msg1')
    setNamespaces('ns2:*,ns3:*')
    log.info('', 'msg2')

    t.true(writeStub.calledOnce)
    t.is(writeStub.args[0][0].message, 'msg1')

    writeStub.restore()
})

test('A logger should not log if log level is not upper after call to setLevel', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('*')
    setLevel('info')

    const log = createLogger('ns1')

    log.info('', 'msg1')
    setLevel('warn')
    log.info('', 'msg2')

    t.true(writeStub.calledOnce)
    t.is(writeStub.args[0][0].message, 'msg1')
    writeStub.restore()
})

test('A logger should not log if upper namespace was enabled, but sub namespace level was set to none', (t) => {
    const writeStub = sinon.stub(loggerMock, 'write')

    setNamespaces('ns1:*,ns1:subns1=none')
    setLevel('info')

    const log = createLogger('ns1:subns1')

    log.info('', 'msg1')

    t.is(writeStub.callCount, 0)
    writeStub.restore()
})

test('A logger should return true for a call to isLevelEnabled if level and namespace is enabled', (t) => {
    setNamespaces('ns1:*,ns1:subns1=none')
    setLevel('info')

    const log = createLogger('ns1:subns2')
    t.true(log.isLevelEnabled('warn'))
})

test('A logger should return false for a call to isLevelEnabled if namespace level was set to none', (t) => {
    setNamespaces('ns1:*,ns1:subns1=none')
    setLevel('info')

    const log = createLogger('ns1:subns1')
    t.false(log.isLevelEnabled('warn'))
})

test('A logger should return true for a call to isLevelEnabled if top namespace is enabled but another subnamespace is set to none', (t) => {
    setNamespaces('ns1:*,ns1:subns1=none')
    setLevel('error')

    const log = createLogger('ns1:subns2')
    t.false(log.isLevelEnabled('warn'))
})

test('loggers should be equal if they are for the same namespace', (t) => {
    setNamespaces('ns1:*,ns1:subns1=none')
    setLevel('error')

    const log1 = createLogger('ns1:subns2')
    const log2 = createLogger('ns1:subns2')
    t.is(log1, log2)
})

test('parseNamespace should return a namespace if there is no level', (t) => {
    const result = parseNamespace('test:*')
    t.deepEqual(result, { regex: /^test:.*?$/ })
})

test('parseNamespace should return a namespace and a level', (t) => {
    const result = parseNamespace('test:*=info')
    t.deepEqual(result, { regex: /^test:.*?$/, level: 2 })
})

test('parseNamespace should return null if namespace is missing', (t) => {
    const result = parseNamespace('=info')
    t.deepEqual(result, null)
})

test('parseNamespace should return null if namespace is empty', (t) => {
    const result = parseNamespace('')
    t.deepEqual(result, null)
})
