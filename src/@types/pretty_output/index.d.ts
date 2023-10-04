declare module 'prettyoutput' {
    const prettyoutput: (input: Record<string, unknown>, opts: Record<string, unknown>, indent: number) => string
    export = prettyoutput
}
