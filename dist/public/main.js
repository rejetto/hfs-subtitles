"use strict";{
    const SUPPORTED_EXTS = ['srt', 'vtt']
    HFS.onEvent('fileShow', params => {
        const { entry, Component } = params
        const folder = entry.uri.slice(0, -entry.name.length)
        const noExt = getNoExt(entry)
        const subEntry = HFS.state.list?.find(x =>
            SUPPORTED_EXTS.includes(x.ext) && x.uri.startsWith(folder) && getNoExt(x).startsWith(noExt) )
        if (!subEntry) return
        const title = getNoExt(subEntry).slice(noExt.length).replace(/^[-. ]+/, '') || "unknown"
        const sub = { title, lang: title }
        params.Component = props =>
            HFS.h(Component, props,
                HFS.h('track', {
                    label: sub.title,
                    kind: 'subtitles',
                    srcLang: sub.lang,
                    src: sub.idx !== undefined ? entry.uri + '?get=subtitle&idx=' + sub.idx // embedded
                        : subEntry.uri + (subEntry.ext === 'vtt' ? '' : '?get=vtt'), // external file
                }) )

        function getNoExt(entry) {
            return entry.name.slice(0, -entry.ext.length-1).toLowerCase()
        }
    })
}