"use strict";{
    const SUPPORTED_EXTS = ['srt', 'vtt']
    HFS.onEvent('fileShow', params => {
        const { entry, Component } = params
        const folder = entry.uri.slice(0, -entry.name.length)
        const noExt = getNoExt(entry)
        const subEntries = HFS.state.list?.filter(x =>
            SUPPORTED_EXTS.includes(x.ext) && x.uri.startsWith(folder) && getNoExt(x).startsWith(noExt) )
        if (!subEntries?.length) return
        params.Component = props =>
            HFS.h(Component, props,
                subEntries.map(e => {
                    const title = getNoExt(e).slice(noExt.length).replace(/^[-. ]+/, '') || "unknown"
                    return HFS.h('track', {
                        label: title,
                        kind: 'subtitles',
                        srcLang: title,
                        src: e.uri + (e.ext === 'vtt' ? '' : '?get=vtt'), // external file
                    })
                }) )

        function getNoExt(entry) {
            return entry.name.slice(0, -entry.ext.length-1).toLowerCase()
        }
    })
}