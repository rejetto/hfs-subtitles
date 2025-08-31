"use strict";{
    const SUPPORTED_EXTS = ['srt', 'vtt', 'dfxp', 'scc', 'ttml', 'ssa', 'ass']
    const search = SUPPORTED_EXTS.map(x => `*.${x}`).join('|')
    const {h, React, _} = HFS
    HFS.onEvent('fileShow', params => {
        const { entry, Component } = params
        if (Component !== HFS.fileShowComponents.Video && !Component?.hfs_show_video) return
        let folderUri = entry.uri
        const i = folderUri.lastIndexOf('/')
        if (i > 0)
            folderUri = folderUri.slice(0, i)
        const noExt = getNoExt(entry)
        const subEntries = HFS.state.list?.filter(x =>
            SUPPORTED_EXTS.includes(x.ext) && x.uri.startsWith(folderUri) && getNoExt(x).startsWith(noExt) )
        // search for more subs, both useful for subfolders and in case the show was started from a partial list
        const req = HFS.apiCall('get_file_list', { uri: folderUri, search }).then(res =>
            res.list.map(x => mapEntry(new HFS.DirEntry(x.n, x))))

        function mapEntry(e) {
            let label = getNoExt(e)
            if (label.startsWith(noExt))
                label = label.slice(noExt.length)
            label = label.replace(/^[-. ]+/, '')
            label ||= "unknown"
            return { label, src: e.uri + (e.ext === 'vtt' ? '' : '?get=vtt') }
        }

        const customLabel = HFS.t("Enter link to subtitles")
        const btnStyle = { fontSize: 'small' }
        let customIdx = 0
        params.Component = React.forwardRef((props, ref) => {
            const [subs, setSubs] = React.useState(() => subEntries?.map(mapEntry) || [])
            React.useEffect(() => { // copy new subs to the state, only if not already present
                req.then(res => setSubs(was => [...was, ...res.filter(x => !_.some(was, { src: x.src }))]))
            }, [])
            const ref2 = React.useRef()
            return h(React.Fragment, {},
                h(Component, {
                    ...props,
                    ref(el) {
                        if (ref) ref.current = el // update it
                        ref2.current = el
                        if (!el || el._change_installed) return
                        el.textTracks.addEventListener('change', forceRender)
                        el._change_installed = true
                    }
                },
                    subs.map((x, i) =>
                        h('track', { key: i, kind: 'subtitles', srcLang: x.label, ...x }) )
                ),
                h('div', {
                    style: {
                        display: 'flex', gap: '.3em .5em', flexWrap: 'wrap', justifyContent: 'center',
                        padding: '.5em 1em', backgroundColor: 'var(--bg)',
                    }
                },
                    subs.map((e, i) =>
                        h(HFS.Btn, {
                            key: i,
                            style: btnStyle,
                            label: HFS.t("Sub {label}", e),
                            toggled: ref2.current?.textTracks[i]?.mode === 'showing',
                            onClick: () => enable(i)
                        })),
                    h(HFS.Btn, {
                        style: btnStyle,
                        label: customLabel,
                        async onClick() {
                            const s = await HFS.dialogLib.promptDialog(customLabel)
                            if (!s) return
                            setSubs(was => [ ...was, {
                                default: true,
                                label: "custom " + ++customIdx,
                                src: s + (!s.endsWith('srt') ? '' : '?get=vtt')
                            }])
                        }
                    })
                ),
            )
            params.Component.hfs_show_video = true // tell others that we are still a video

            function enable(idx) {
                const t = ref2.current.textTracks[idx]
                t.mode = t.mode === 'showing' ? 'hidden' : 'showing'
                forceRender()
            }

            function forceRender() {
                setSubs(was => [...was])
            }
        })

        function getNoExt(entry) {
            return entry.name.slice(0, -entry.ext.length-1).toLowerCase()
        }
    })
}