// Type definitions for @ekino/logger
// Project: https://github.com/ekino/node-logger

export function createLogger(namespace?: string): Logger
export function setNamespaces(namespace: string): void
export function setLevel(level: LogLevel): void
export function setOutput(adapter: OutputAdapter): void
export function setOutputs(adapter: [OutputAdapter]): void
export function setGlobalContext(meta: object): void

export function id(): string

export let namespaces: string
export let level: string

export namespace outputs {
    export const pretty: OutputAdapter
    export const json: OutputAdapter
}

export namespace outputUtils {
    export function stringify(log: object): string
}

export interface Logger {
    trace: LogMethod
    debug: LogMethod
    info: LogMethod
    warn: LogMethod
    error: LogMethod
    isLoggerEnabled(): boolean
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

export interface LogMethod {
    (contextId: string, message: string, data?: any): void
    (message: string, data?: object): void
}

export interface Log {
    level: LogLevel
    time: Date
    namespace: string
    contextId: string
    meta: object
    message: string
    data?: object
}

export interface OutputAdapter {
    (log: Log): void
}
