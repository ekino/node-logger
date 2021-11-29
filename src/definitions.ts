export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none'

export type Log = {
    level: LogLevel
    time: Date
    namespace: string
    contextId: string
    meta: Record<string, unknown>
    message: string
    data?: Record<string, unknown>
}
export type Output = Pick<Log, 'contextId' | 'meta' | 'data'>

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
    (log: Log): void
}

export interface LogMethod {
    (contextId: string, message: string, data?: unknown): void
    (message: string, data?: unknown): void
}

export interface Internal {
    loggers: Record<string, Logger>
    namespaces: NameSpaceConfig[]
    levels: LogLevel[]
    level?: number
    outputs: OutputAdapter[]
    globalContext: Record<string, unknown>
    isEnabled?(namespace: string, index: number): boolean
}

export type LogColor = 'red' | 'yellow' | 'blue' | 'white' | 'grey'
