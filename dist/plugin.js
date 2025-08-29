exports.version = 0.5
exports.description = "load srt/vtt subtitles showing videos"
exports.apiRequired = 12.9
exports.repo = "rejetto/hfs-subtitles"
exports.frontend_js = "main.js"
exports.init = api => {
    return {
        middleware: ctx => async () => {
            if (ctx.query.get !== 'vtt') return
            const s = await api.misc.stream2string(ctx.body)
            ctx.type = 'vtt'
            ctx.body = srtToVtt(s)
            ctx.stop()
        }
    }
}

const srtToVtt = s =>
    `WEBVTT\n\n${s.replace(/\r+/g, '').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')}`
