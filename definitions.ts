export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none'

export type LogInstance = {
    level?: LogLevel
    time?: Date
    namespace?: string
    contextId?: string
    message?: string
    meta?: Record<string, unknown>
    data?: unknown
}
export type Output = Pick<LogInstance, 'contextId' | 'meta' | 'data'>

export type NameSpaceConfig = {
    regex?: RegExp
    level?: number
}

export interface Logger {
    trace: LogMethod
    debug: LogMethod
    info: LogMethod
    warn: LogMethod
    error: LogMethod
    isLevelEnabled(level: string): boolean | undefined
}

export interface OutputAdapter {
    (log: LogInstance): void
}

export interface LogMethod {
    (contextId: string, message: string, data?: unknown): void
    (message: string, data?: unknown): void
}

export interface Internal {
    loggers?: Record<string, Logger | undefined>
    namespaces?: NameSpaceConfig[]
    levels?: LogLevel[]
    level?: number
    outputs?: OutputAdapter[]
    globalContext?: Record<string, unknown>
    isEnabled?(namespace: string, index: number): boolean
}

export type LogColor = 'red' | 'yellow' | 'blue' | 'white' | 'grey'
