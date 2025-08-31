exports.version = 1
exports.description = "load subtitles showing videos. The subtitles file is automatically loaded if it has the same name of the video file."
exports.apiRequired = 12.9
exports.repo = "rejetto/hfs-subtitles"
exports.frontend_js = "main.js"
exports.frontend_css = "style.css"
exports.afterPlugin = 'unsupported-videos' // or we'll skip those extensions not supported directly by hfs
exports.changelog = [
    { "version": 1.0, "message": "Support non-utf8 subtitles" },
    { "version": 0.9, "message": "Search subtitles in subfolders" }
]

exports.init = api => {
    const { convert } = api.require(__dirname +'/subtitle-converter.bundle.js')
    const { detect } = api.require(__dirname +'/jschardet.min.js')
    const { decode } = api.require('iconv-lite')
    const consumers = api.require('stream/consumers')
    return {
        middleware: ctx => async () => {
            if (!ctx.body) return // in case of 304
            if (ctx.query.get !== 'vtt') return
            const buffer = await consumers.buffer(ctx.body)
            const {encoding} = detect(buffer)
            const s = decode(buffer, encoding)
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