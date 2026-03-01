import React, { useEffect, useRef, useState } from 'react'

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY || '1x00000000000000000000AA'

function loadTurnstile(onReady) {
    if (window.turnstile?.render) { onReady(); return }
    if (document.getElementById('cf-turnstile-script')) {
        const wait = setInterval(() => {
            if (window.turnstile?.render) { clearInterval(wait); onReady() }
        }, 100)
        return
    }
    window.__turnstileReady = onReady
    const s = document.createElement('script')
    s.id = 'cf-turnstile-script'
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileReady&render=explicit'
    s.async = true; s.defer = true
    document.head.appendChild(s)
}

function TurnstileInvisible({ addDiag }) {
    const [status, setStatus] = useState('idle')
    const [token, setToken] = useState(null)
    const containerRef = useRef(null)
    const widgetId = useRef(null)

    const run = () => {
        setStatus('checking')
        addDiag('invisible: run() called')
        addDiag(`invisible: window.turnstile = ${typeof window.turnstile}`)
        addDiag(`invisible: window.turnstile.render = ${typeof window.turnstile?.render}`)

        loadTurnstile(() => {
            addDiag('invisible: turnstile ready callback fired')
            addDiag(`invisible: containerRef.current = ${containerRef.current?.tagName}`)

            if (widgetId.current !== null) {
                addDiag(`invisible: resetting widget #${widgetId.current}`)
                window.turnstile.reset(widgetId.current)
                return
            }

            try {
                widgetId.current = window.turnstile.render(containerRef.current, {
                    sitekey: SITEKEY,
                    size: 'invisible',
                    callback: (t) => { addDiag(`invisible: ✓ token received (${t.slice(0,20)}...)`); setToken(t); setStatus('success') },
                    'error-callback': (e) => { addDiag(`invisible: ✗ error: ${JSON.stringify(e)}`); setStatus('fail') },
                    'expired-callback': () => { addDiag('invisible: token expired'); setStatus('idle'); setToken(null) },
                })
                addDiag(`invisible: widget rendered, id = ${widgetId.current}`)
            } catch(e) {
                addDiag(`invisible: render threw: ${e.message}`)
                setStatus('fail')
            }
        })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', lineHeight: 1.8 }}>
                // Invisible — автоматическая проверка без UI.<br />
                // Используется для скрытой защиты форм.
            </div>
            <div ref={containerRef} style={{ display: 'none' }} data-testid="turnstile-invisible-widget" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ background: '#f6821f', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                        data-testid="btn-turnstile-invisible" onClick={run} disabled={status === 'checking'}>
                    {status === 'checking' ? '⏳ Проверяем...' : 'Запустить invisible'}
                </button>
                <TurnstileStatus status={status} />
            </div>
            {token && (
                <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '10px' }}>
                    <div style={{ color: 'var(--dim)', marginBottom: '4px' }}>TOKEN</div>
                    <div style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>{token}</div>
                </div>
            )}
        </div>
    )
}

function TurnstileManaged({ addDiag }) {
    const [status, setStatus] = useState('idle')
    const [token, setToken] = useState(null)
    const containerRef = useRef(null)
    const widgetId = useRef(null)

    useEffect(() => {
        addDiag('managed: useEffect fired')
        addDiag(`managed: SITEKEY = ${SITEKEY}`)
        loadTurnstile(() => {
            addDiag('managed: turnstile ready callback fired')
            addDiag(`managed: containerRef.current = ${containerRef.current?.tagName}, id="${containerRef.current?.id}"`)
            if (widgetId.current !== null) { addDiag('managed: already rendered, skip'); return }
            try {
                widgetId.current = window.turnstile.render(containerRef.current, {
                    sitekey: SITEKEY,
                    theme: 'dark',
                    callback: (t) => { addDiag(`managed: ✓ token (${t.slice(0,20)}...)`); setToken(t); setStatus('success') },
                    'error-callback': (e) => { addDiag(`managed: ✗ error: ${JSON.stringify(e)}`); setStatus('fail') },
                    'expired-callback': () => { addDiag('managed: expired'); setStatus('idle'); setToken(null) },
                })
                addDiag(`managed: widget rendered, id = ${widgetId.current}`)
            } catch(e) {
                addDiag(`managed: render threw: ${e.message}`)
            }
        })
    }, [])

    const reset = () => {
        addDiag(`managed: reset(), widgetId = ${widgetId.current}`)
        if (widgetId.current === null) { addDiag('managed: no widget to reset'); return }
        window.turnstile.reset(widgetId.current)
        setStatus('idle'); setToken(null)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', lineHeight: 1.8 }}>
                // Managed — виджет с чекбоксом.<br />
                // Пользователь кликает "I'm not a robot".
            </div>
            <div ref={containerRef} id="turnstile-managed-widget" data-testid="turnstile-managed-widget" style={{ minHeight: '65px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TurnstileStatus status={status} />
                <button className="btn btn-ghost" style={{ fontSize: '11px' }} onClick={reset}>Сбросить</button>
            </div>
            {token && (
                <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '10px' }}>
                    <div style={{ color: 'var(--dim)', marginBottom: '4px' }}>TOKEN</div>
                    <div style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>{token}</div>
                </div>
            )}
        </div>
    )
}

function TurnstileStatus({ status }) {
    if (status === 'idle') return null
    const cfg = { checking: ['#ffcc00','⏳ Проверка...'], success: ['#00ff88','✓ Пройдено'], fail: ['#ff3366','✗ Не пройдено'] }[status]
    return <div style={{ padding: '7px 14px', borderRadius: '5px', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: cfg[0], border: `1px solid ${cfg[0]}44`, background: `${cfg[0]}11` }}>{cfg[1]}</div>
}

export default function Zone16() {
    const [diag, setDiag] = useState([
        `sitekey: ${SITEKEY}`,
        `window.turnstile on load: ${typeof window?.turnstile}`,
    ])

    const addDiag = (msg) => {
        const ts = new Date().toTimeString().slice(3, 8)
        setDiag(d => [...d, `[${ts}] ${msg}`])
    }

    // Диагностика состояния при монтировании
    useEffect(() => {
        addDiag(`script tag exists: ${!!document.getElementById('cf-turnstile-script')}`)
        addDiag(`window.turnstile: ${typeof window.turnstile}`)
        addDiag(`window.turnstile.render: ${typeof window.turnstile?.render}`)
    }, [])

    return (
        <section className="zone" id="zone-turnstile">
            <div className="zone-header">
                <span className="zone-label" style={{ color: '#f6821f', borderColor: 'rgba(246,130,31,.3)', background: 'rgba(246,130,31,.08)' }}>Zone 16</span>
                <span className="zone-title">// Cloudflare Turnstile — Bot Challenge</span>
            </div>
            <div className="zone-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#f6821f', textTransform: 'uppercase', marginBottom: '14px' }}>Invisible mode</div>
                        <TurnstileInvisible addDiag={addDiag} />
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#f6821f', textTransform: 'uppercase', marginBottom: '14px' }}>Managed mode</div>
                        <TurnstileManaged addDiag={addDiag} />
                    </div>
                </div>

                {/* Диагностическая панель */}
                <div style={{ marginTop: '20px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#f6821f', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Диагностика</span>
                        <button style={{ background: 'none', border: 'none', color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: '10px', cursor: 'pointer' }} onClick={() => setDiag([`sitekey: ${SITEKEY}`])}>очистить</button>
                    </div>
                    <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '11px', lineHeight: 1.9, maxHeight: '180px', overflowY: 'auto' }}>
                        {diag.map((line, i) => (
                            <div key={i} style={{ color: line.includes('✓') ? '#00ff88' : line.includes('✗') || line.includes('threw') ? '#ff3366' : line.includes('sitekey') ? '#f6821f' : 'var(--dim)' }}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '12px', padding: '12px 14px', background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', lineHeight: 1.9 }}>
                    // После получения токена → cf-turnstile-response<br />
                    // POST https://challenges.cloudflare.com/turnstile/v0/siteverify<br />
                    // {'{ secret: SECRET_KEY, response: token }'}
                </div>
            </div>
        </section>
    )
}