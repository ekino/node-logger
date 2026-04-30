import crypto from 'node:crypto'
import type {
    Log,
    Logger,
    LoggerConfig,
    LogLevel,
    LogMethod,
    NameSpaceConfig,
    OutputAdapter,
} from './definitions.js'
import * as outputs from './output_adapters.js'
import * as outputUtils from './output_utils.js'
import { isObject } from './output_utils.js'

/************* LOCAL STATE *************/
const sharedConfig: LoggerConfig = {
    loggers: {},
    levels: ['trace', 'debug', 'info', 'warn', 'error', 'none'],
    outputs: [outputs.json],
    level: 3,
    namespaces: [],
    globalContext: {},
}

/**
 * True if both namespace and level are enabled.
 */
const isLevelEnabled = (namespace: string, level: number): boolean => {
    let nsLevel = sharedConfig.level || 0
    let nsMatch = false

    sharedConfig.namespaces
        .slice()
        .reverse()
        .forEach((ns) => {
            if (ns.regex?.test(namespace)) {
                nsMatch = true
                if (ns.level) {
                    nsLevel = ns.level
                    return
                }
            }
        })

    return nsMatch && level >= nsLevel
}

/************* EXPORTS *************/

/**
 * @param namespace - Logger namespace (e.g., "module", "module:sub")
 * @param canForceWrite - Force logging regardless of level
 * @returns Logger instance
 */
export const createLogger = (namespace?: string, canForceWrite?: boolean): Logger => {
    namespace = namespace || ''

    let logger = sharedConfig.loggers?.[namespace]
    if (logger) return logger

    logger = syncLogger({} as Logger, namespace, canForceWrite)
    if (sharedConfig.loggers) sharedConfig.loggers[namespace] = logger

    return logger
}

/**
 * @param namespace - Comma-separated namespaces (e.g., "app:*,api:*=debug")
 */
export const setNamespaces = (namespace: string): void => {
    sharedConfig.namespaces = []

    if (!namespace) {
        syncLoggers()
        return
    }

    const splitNamespaces = namespace.replace(/\s/g, '').split(',')

    splitNamespaces.forEach((name) => {
        const parsedNamespace = parseNamespace(name)
        if (!parsedNamespace) return

        sharedConfig.namespaces.push(parsedNamespace)
    })

    syncLoggers()
}

/**
 * @param level - Log level: trace, debug, info, warn, error
 */
export const setLevel = (level: LogLevel): void => {
    if (!sharedConfig.levels?.includes(level)) {
        throw new Error(`Invalid level: '${level}'`)
    }

    sharedConfig.level = sharedConfig.levels?.indexOf(level)

    syncLoggers()
}

/**
 * @param outputAdapters - Single adapter or array of output adapters
 */
export const setOutput = (outputAdapters?: OutputAdapter[] | OutputAdapter): void => {
    if (!outputAdapters) outputAdapters = []
    if (!Array.isArray(outputAdapters)) outputAdapters = [outputAdapters]

    outputAdapters.forEach((output) => {
        if (typeof output !== 'function') throw new Error(`Invalid output: '${output}'`)
    })

    sharedConfig.outputs = outputAdapters
}

/**
 * @param context - Global context object to add to all logs
 */
export const setGlobalContext = (context: Record<string, unknown>): void => {
    sharedConfig.globalContext = context
}

/** @returns UUID string for contextId */
export const id = (): string => {
    return crypto.randomUUID()
}

/**
 * @param namespace - String like "module", "module:sub", "module=info"
 * @returns Parsed namespace config or null
 */
export const parseNamespace = (namespace: string): NameSpaceConfig | null => {
    const matches = /([^=]*)(=(.*))?/.exec(namespace)
    if (!matches) return null

    let level: number | undefined
    if (matches[3]) {
        const idx = sharedConfig.levels?.indexOf(matches[3] as LogLevel)

        if (idx === undefined || idx < 0)
            throw new Error(`Level ${matches[3]} is not a valid log level : ${sharedConfig.levels}`)
        level = idx
    }

    let pattern = matches[1]
    if (!pattern) return null

    pattern = pattern.replace(/\*/g, '.*?')
    const regex = new RegExp(`^${pattern}$`)

    const namespaceConfig: NameSpaceConfig = { regex }
    if (level) namespaceConfig.level = level

    return namespaceConfig
}

/**
 * @param namespace - Logger namespace
 * @param level - Log level
 * @param contextId - Optional context ID for grouping logs
 * @param message - Log message or data object
 * @param data - Additional data
 * @param forceLogging - Force log regardless of level
 */
export const log = (
    namespace: string,
    level: LogLevel,
    contextId?: string | null,
    message?: string | Record<string, unknown> | null,
    data?: Record<string, unknown>,
    forceLogging?: boolean | Record<string, unknown>
): void => {
    if (isObject(message)) {
        forceLogging = data
        data = message
        message = contextId
        contextId = null
    }

    contextId = contextId || id()
    const time = new Date()
    const logInstance: Log = {
        level,
        time,
        namespace,
        contextId,
        meta: {},
        message: message || contextId,
        data,
    }
    if (sharedConfig.globalContext) logInstance.meta = Object.assign({}, sharedConfig.globalContext)

    if (forceLogging || sharedConfig.loggers[namespace]?.isLevelEnabled(level)) write(logInstance)
}

/** @param logInstance - Log object to write */
export const write = (logInstance: Log): void => {
    sharedConfig.outputs?.forEach((outputFn) => {
        outputFn(logInstance)
    })
}

/**
 * Update a logger's level methods based on current config
 * @param logger - Logger to sync
 * @param namespace - Namespace for the logger
 * @param canForceWrite - Whether logger can force write
 */
export const syncLogger = (logger: Logger, namespace: string, canForceWrite?: boolean): Logger => {
    for (const key in logger) {
        delete logger[key as keyof Logger]
    }

    const enabledLevels: Record<string, boolean> = {}
    if (sharedConfig.levels) {
        sharedConfig.levels.forEach((level, idx) => {
            if (level === 'none') return
            const levelIsEnabled = isLevelEnabled(namespace, idx) ?? false
            if (levelIsEnabled || canForceWrite) {
                enabledLevels[level] = levelIsEnabled

                logger[level] = ((
                    contextId: string,
                    message: string,
                    data?: Record<string, unknown>,
                    forceLogging?: boolean
                ) => {
                    log(namespace, level as LogLevel, contextId, message, data, forceLogging)
                }) as LogMethod
            } else {
                enabledLevels[level] = false
                logger[level] = () => {}
            }
        })

        logger.isLevelEnabled = (lvl) => enabledLevels[lvl]
    }
    logger.canForceWrite = canForceWrite
    return logger
}

/** ReSync all cached loggers when config changes */
export const syncLoggers = () => {
    for (const [namespace, logger] of Object.entries(sharedConfig.loggers)) {
        syncLogger(logger, namespace, logger.canForceWrite)
    }
}

/************* INIT *************/
const namespaces = process.env.LOGS || '*'
const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'warn'

setNamespaces(namespaces)
setLevel(logLevel)

/************* EXPORT *************/
export * from './definitions.js'
export { outputs, outputUtils }
export default {
    createLogger,
    setLevel,
    setNamespaces,
    setOutput,
    setGlobalContext,
    id,
    outputUtils,
    outputs,
}
