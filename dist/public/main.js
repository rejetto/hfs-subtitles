"use strict";{
    const SUPPORTED_EXTS = ['srt', 'vtt', 'dfxp', 'scc', 'ttml', 'ssa', 'ass']
    const {h, React} = HFS
    HFS.onEvent('fileShow', params => {
        const { entry, Component } = params
        if (Component !== HFS.fileShowComponents.Video && !Component?.hfs_show_video) return
        const folder = entry.uri.slice(0, -entry.name.length)
        const noExt = getNoExt(entry)
        const subEntries = HFS.state.list?.filter(x =>
            SUPPORTED_EXTS.includes(x.ext) && x.uri.startsWith(folder) && getNoExt(x).startsWith(noExt) )
        const customLabel = HFS.t("Enter link to subtitles")
        params.Component = props => {
            const [custom, setCustom]  = React.useState()
            const n = (subEntries?.length || 0) + (custom ? 1 : 0)
            return h(React.Fragment, {},
                h(Component, props,
                    custom && h('track', {
                        kind: 'subtitles', label: "custom", srcLang: "custom", default: true,
                        src: custom + (!custom.endsWith('srt') ? '' : '?get=vtt'),
                    }),
                    subEntries?.map(e => {
                        const title = getNoExt(e).slice(noExt.length).replace(/^[-. ]+/, '') || "unknown"
                        return h('track', { key: title,
                            kind: 'subtitles', srcLang: title, label: title,
                            src: e.uri + (e.ext === 'vtt' ? '' : '?get=vtt'),
                        })
                    }) ),
                n > 0 && HFS.t("Subtitles found: {n}", { n }),
                h('button', {
                    style: { fontSize: 'small' },
                    onClick() {
                        HFS.dialogLib.promptDialog(customLabel, { value: custom }).then(x =>
                            x !== undefined && setCustom(x))
                    }
                }, customLabel)
            )
        }
        params.Component.hfs_show_video = true // tell others that we are still a video

        function getNoExt(entry) {
            return entry.name.slice(0, -entry.ext.length-1).toLowerCase()
        }
    })
}