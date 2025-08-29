exports.version = 0.72
exports.description = "load subtitles showing videos. The subtitles file is automatically loaded if it has the same name of the video file."
exports.apiRequired = 12.9
exports.repo = "rejetto/hfs-subtitles"
exports.frontend_js = "main.js"
exports.afterPlugin = 'unsupported-videos'
exports.init = api => {
    const { convert } = api.require(__dirname +'/subtitle-converter.bundle.js')
    return {
        middleware: ctx => async () => {
            if (ctx.query.get !== 'vtt') return
            const s = await api.misc.stream2string(ctx.body)
            ctx.type = 'vtt'
            const {subtitle} = convert(s, '.vtt')
            // convert formatting
            ctx.body = subtitle.replace(/\\N/g, "\n").replace(/\{\\([^}]*)\}/g, (_m, inner) =>
                inner.split(/\\+/).map(x => {
                    const m = /^(i|b|u)([01])?$/.exec(x)
                    return !m ? '' : m[2] === '0' ? `</${m[1]}>` : `<${m[1]}>`
                }).join('') )
            ctx.stop()
        }
    }
}