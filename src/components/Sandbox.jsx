import React, { useEffect, useRef, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import Header from './Header.jsx'
import Zone16 from './Zone16.jsx'

// ─── Event log (shared across zones) ──────────────────────────────────────────
let globalLog = null
function addLog(msg) {
  if (!globalLog) return
  const ts = new Date().toTimeString().slice(0, 8)
  const line = document.createElement('div')
  line.style.color = '#c8c8d8'
  line.textContent = `[${ts}] ${msg}`
  globalLog.appendChild(line)
  globalLog.scrollTop = globalLog.scrollHeight
}

// ─── Zone wrapper ──────────────────────────────────────────────────────────────
function Zone({ id, label, labelColor, title, children, locked }) {
  const labelStyle = labelColor
    ? { color: labelColor, borderColor: labelColor.replace(')', ',.3)').replace('rgb', 'rgba'), background: labelColor.replace(')', ',.08)').replace('rgb', 'rgba') }
    : {}

  if (locked) {
    return (
      <section className="zone" id={id} style={{ opacity: 0.4, pointerEvents: 'none' }}>
        <div className="zone-header">
          <span className="zone-label" style={labelStyle}>{label}</span>
          <span className="zone-title">{title} 🔒</span>
        </div>
        <div className="zone-body" style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--mono)', color: 'var(--dim)', fontSize: '13px' }}>
          // Зона заблокирована
        </div>
      </section>
    )
  }

  return (
    <section className="zone" id={id}>
      <div className="zone-header">
        <span className="zone-label" style={labelStyle}>{label}</span>
        <span className="zone-title">{title}</span>
      </div>
      <div className="zone-body">{children}</div>
    </section>
  )
}

// ─── ZONE 01: Text inputs ──────────────────────────────────────────────────────
function Zone01() {
  return (
    <Zone id="forms" label="Zone 01" title="// Текстовые поля — все типы input">
      <div className="grid-2">
        <div>
          <div className="field-group"><label htmlFor="input-text">type="text"</label><input type="text" id="input-text" name="username" placeholder="Обычный текст" data-testid="input-username" autoComplete="username" /></div>
          <div className="field-group"><label htmlFor="input-email">type="email"</label><input type="email" id="input-email" name="email" placeholder="user@example.com" data-testid="input-email" /></div>
          <div className="field-group"><label htmlFor="input-password">type="password"</label><input type="password" id="input-password" name="password" placeholder="Пароль" data-testid="input-password" autoComplete="current-password" /></div>
          <div className="field-group"><label htmlFor="input-number">type="number"</label><input type="number" id="input-number" name="quantity" placeholder="0" min="0" max="999" step="1" data-testid="input-number" /></div>
          <div className="field-group"><label htmlFor="input-tel">type="tel"</label><input type="tel" id="input-tel" name="phone" placeholder="+7 (___) ___-__-__" data-testid="input-phone" /></div>
          <div className="field-group"><label htmlFor="input-url">type="url"</label><input type="url" id="input-url" name="website" placeholder="https://" data-testid="input-url" /></div>
        </div>
        <div>
          <div className="field-group"><label htmlFor="input-search">type="search"</label><input type="search" id="input-search" name="q" placeholder="Поиск..." data-testid="input-search" /></div>
          <div className="field-group"><label htmlFor="input-date">type="date"</label><input type="date" id="input-date" name="birthday" data-testid="input-date" /></div>
          <div className="field-group"><label htmlFor="input-time">type="time"</label><input type="time" id="input-time" name="meeting-time" data-testid="input-time" /></div>
          <div className="field-group"><label htmlFor="input-datetime">type="datetime-local"</label><input type="datetime-local" id="input-datetime" name="event-dt" data-testid="input-datetime" /></div>
          <div className="field-group"><label htmlFor="input-readonly">readonly</label><input type="text" id="input-readonly" value="Нельзя редактировать" readOnly data-testid="input-readonly" /></div>
          <div className="field-group"><label htmlFor="input-disabled">disabled</label><input type="text" id="input-disabled" value="Задизейблен" disabled data-testid="input-disabled" /></div>
        </div>
      </div>
      <div className="grid-3">
        <div className="field-group">
          <label htmlFor="input-range">type="range"</label>
          <input type="range" id="input-range" name="volume" min="0" max="100" defaultValue="42" data-testid="input-range"
            onChange={e => { const o = document.getElementById('range-output'); if (o) o.textContent = e.target.value }} />
          <output id="range-output">42</output>
        </div>
        <div className="field-group"><label htmlFor="input-color">type="color"</label><input type="color" id="input-color" name="fav-color" defaultValue="#00ff88" data-testid="input-color" /></div>
        <div className="field-group"><label htmlFor="input-file">type="file"</label><input type="file" id="input-file" name="upload" data-testid="input-file" /></div>
      </div>
      <input type="hidden" id="hidden-token" name="csrf_token" value="abc123xyz" data-testid="hidden-token" />
      <div className="field-group"><label htmlFor="textarea-main">textarea</label><textarea id="textarea-main" name="message" rows="4" placeholder="Многострочный текст..." maxLength="500" data-testid="textarea-message" /></div>
      <div className="field-group">
        <label htmlFor="input-autocomplete">Поле с автодополнением</label>
        <div className="autocomplete-wrapper">
          <input type="text" id="input-autocomplete" name="city" placeholder="Введите город..." autoComplete="off" data-testid="input-city"
            onInput={e => {
              const list = document.getElementById('autocomplete-list')
              const val = e.target.value.toLowerCase()
              if (!list) return
              list.style.display = val.length > 0 ? 'block' : 'none'
              list.querySelectorAll('div').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(val) ? 'block' : 'none'
              })
            }}
          />
          <div id="autocomplete-list">
            {['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск'].map((city, i) => (
              <div key={i} onClick={() => {
                const inp = document.getElementById('input-autocomplete')
                const list = document.getElementById('autocomplete-list')
                if (inp) inp.value = city
                if (list) list.style.display = 'none'
                addLog('autocomplete: ' + city)
              }}>{city}</div>
            ))}
          </div>
        </div>
      </div>
    </Zone>
  )
}

// ─── ZONE 02: Select & Checks ──────────────────────────────────────────────────
function Zone02() {
  return (
    <Zone label="Zone 02" title="// Select, Checkbox, Radio, Toggle">
      <div className="grid-2">
        <div>
          <div className="field-group">
            <label htmlFor="select-single">select (одиночный)</label>
            <select id="select-single" name="country" data-testid="select-country">
              <option value="">— выберите —</option>
              <option value="ru">Россия</option><option value="us">США</option>
              <option value="de">Германия</option><option value="cn">Китай</option><option value="jp">Япония</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="select-grouped">select с optgroup</label>
            <select id="select-grouped" name="browser" data-testid="select-browser">
              <optgroup label="Chromium"><option value="chrome">Chrome</option><option value="edge">Edge</option><option value="brave">Brave</option></optgroup>
              <optgroup label="Gecko"><option value="firefox">Firefox</option></optgroup>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="select-multi">select multiple</label>
            <select id="select-multi" name="lang[]" multiple size="5" data-testid="select-lang">
              <option value="1">Python</option><option value="2">C#</option>
              <option value="3">JavaScript</option><option value="4">Rust</option><option value="5">Go</option>
            </select>
          </div>
        </div>
        <div>
          <fieldset>
            <legend>Чекбоксы</legend>
            <div className="checks-row" style={{ flexDirection: 'column', gap: '10px' }}>
              <label className="check-item"><input type="checkbox" id="cb-1" name="options" value="opt1" data-testid="cb-option1" /><span>Опция 1</span></label>
              <label className="check-item"><input type="checkbox" id="cb-2" name="options" value="opt2" defaultChecked data-testid="cb-option2" /><span>Опция 2 (checked)</span></label>
              <label className="check-item"><input type="checkbox" id="cb-3" name="options" value="opt3" disabled data-testid="cb-option3" /><span>Опция 3 (disabled)</span></label>
              <label className="check-item">
                <input type="checkbox" id="cb-indeterminate" ref={el => { if (el) el.indeterminate = true }} data-testid="cb-selectall" />
                <span>Полувыбранный (indeterminate)</span>
              </label>
            </div>
          </fieldset>
          <fieldset style={{ marginTop: '14px' }}>
            <legend>Radio-группа</legend>
            <div className="checks-row" style={{ flexDirection: 'column', gap: '10px' }}>
              <label className="check-item"><input type="radio" name="tier" value="free" data-testid="radio-free" /><span>Free</span></label>
              <label className="check-item"><input type="radio" name="tier" value="pro" defaultChecked data-testid="radio-pro" /><span>Pro</span></label>
              <label className="check-item"><input type="radio" name="tier" value="enterprise" data-testid="radio-enterprise" /><span>Enterprise</span></label>
            </div>
          </fieldset>
          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '10px', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Toggle switches</div>
            <label className="toggle" style={{ marginBottom: '12px', display: 'flex' }}>
              <input type="checkbox" id="toggle-1" data-testid="toggle-notifications" />
              <div className="toggle-track" /><div className="toggle-thumb" />
              <span style={{ marginLeft: '8px', fontSize: '13px' }}>Уведомления</span>
            </label>
            <label className="toggle" style={{ display: 'flex' }}>
              <input type="checkbox" id="toggle-2" defaultChecked data-testid="toggle-darkmode" />
              <div className="toggle-track" /><div className="toggle-thumb" />
              <span style={{ marginLeft: '8px', fontSize: '13px' }}>Тёмная тема</span>
            </label>
          </div>
        </div>
      </div>
    </Zone>
  )
}

// ─── ZONE 03: Buttons & Counter ────────────────────────────────────────────────
function Zone03() {
  const [count, setCount] = useState(0)
  const dialogRef = useRef(null)

  return (
    <Zone id="buttons" label="Zone 03" title="// Кнопки всех мастей">
      <div className="btn-row" style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" id="btn-primary" type="button" data-testid="btn-submit">Отправить</button>
        <button className="btn btn-danger" id="btn-danger" type="button" data-testid="btn-delete">Удалить</button>
        <button className="btn btn-blue" id="btn-blue" type="button" data-testid="btn-save">Сохранить</button>
        <button className="btn btn-ghost" id="btn-ghost" type="button" data-testid="btn-cancel">Отмена</button>
        <button className="btn btn-disabled" id="btn-disabled" type="button" disabled data-testid="btn-disabled">Недоступно</button>
      </div>
      <div className="btn-row" style={{ marginBottom: '16px' }}>
        <button className="btn btn-primary" type="button" data-testid="btn-open-dialog" onClick={() => dialogRef.current?.showModal()}>Открыть диалог</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', padding: '16px', border: '1px solid var(--border)', borderRadius: '6px' }}>
        <button className="btn btn-ghost" data-testid="btn-decrement" onClick={() => { setCount(c => c - 1); addLog('counter: ' + (count - 1)) }}>−</button>
        <span id="counter-value" style={{ fontFamily: 'var(--mono)', fontSize: '28px', color: 'var(--accent)', minWidth: '60px', textAlign: 'center', display: 'inline-block' }}>{count}</span>
        <button className="btn btn-ghost" data-testid="btn-increment" onClick={() => { setCount(c => c + 1); addLog('counter: ' + (count + 1)) }}>+</button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--dim)' }}>← Счётчик</span>
      </div>

      <dialog ref={dialogRef} id="main-dialog" data-testid="main-dialog">
        <div className="dialog-title">// dialog элемент</div>
        <p style={{ fontSize: '13px', color: 'var(--dim)' }}>Нативный HTML &lt;dialog&gt;.</p>
        <input type="text" id="dialog-input" name="dialog-field" placeholder="Поле внутри диалога" data-testid="dialog-input"
          style={{ marginTop: '12px', background: '#0a0a10', border: '1px solid #1e1e2e', color: '#c8c8d8', padding: '8px 12px', borderRadius: '5px', width: '100%', fontFamily: 'monospace' }} />
        <div className="dialog-btns">
          <button className="btn btn-ghost" data-testid="btn-dialog-close" onClick={() => dialogRef.current?.close()}>Закрыть</button>
          <button className="btn btn-primary" data-testid="btn-dialog-confirm" onClick={() => {
            addLog('dialog confirmed: ' + document.getElementById('dialog-input')?.value)
            dialogRef.current?.close()
          }}>Подтвердить</button>
        </div>
      </dialog>
    </Zone>
  )
}

// ─── ZONE 04: Shadow DOM ───────────────────────────────────────────────────────
function Zone04() {
  const openRef = useRef(null)
  const closedRef = useRef(null)

  useEffect(() => {
    if (openRef.current && !openRef.current._shadow) {
      const root = openRef.current.attachShadow({ mode: 'open' })
      openRef.current._shadow = root
      root.innerHTML = `<style>*{box-sizing:border-box}.si{padding:16px;background:#0a0a10;border-radius:6px}label{display:block;font-family:monospace;font-size:11px;color:#3366ff;text-transform:uppercase;margin-bottom:6px}input{background:#050508;border:1px solid #1e1e2e;color:#c8c8d8;font-family:monospace;font-size:13px;padding:7px 10px;border-radius:5px;width:100%;outline:none;margin-bottom:10px}input:focus{border-color:#3366ff}button{background:#3366ff;color:#fff;border:none;padding:8px 18px;border-radius:5px;font-family:monospace;font-size:12px;cursor:pointer}p{font-family:monospace;font-size:11px;color:#4a4a6a;margin-bottom:12px}</style><div class="si"><p>// Внутри shadow root (open). element.shadowRoot доступен.</p><label>shadow-input (open)</label><input type="text" id="shadow-open-input" placeholder="Поле в shadow DOM" data-testid="shadow-open-input"/><button id="shadow-open-btn" data-testid="shadow-open-btn">Кнопка в shadow (open)</button></div>`
      root.querySelector('#shadow-open-btn').addEventListener('click', function () { this.textContent = '✓ Нажато!' })
    }
    if (closedRef.current && !closedRef.current._shadow) {
      const root = closedRef.current.attachShadow({ mode: 'closed' })
      closedRef.current._shadow = root
      window.__closedShadowRoot = root
      root.innerHTML = `<style>*{box-sizing:border-box}.si{padding:16px;background:#0a0a10;border-radius:6px}label{display:block;font-family:monospace;font-size:11px;color:#ff3366;text-transform:uppercase;margin-bottom:6px}input{background:#050508;border:1px solid #1e1e2e;color:#c8c8d8;font-family:monospace;font-size:13px;padding:7px 10px;border-radius:5px;width:100%;outline:none;margin-bottom:10px}button{background:#ff3366;color:#fff;border:none;padding:8px 18px;border-radius:5px;font-family:monospace;font-size:12px;cursor:pointer}.w{color:#ff3366;font-size:11px;font-family:monospace;margin-top:6px}</style><div class="si"><p>// host.shadowRoot === null</p><label>shadow-input (closed)</label><input type="text" id="shadow-closed-input" placeholder="Поле в closed shadow DOM" data-testid="shadow-closed-input"/><input type="password" id="shadow-closed-pass" placeholder="Пароль в closed shadow DOM"/><button id="shadow-closed-btn" data-testid="shadow-closed-btn">Кнопка в shadow (closed)</button><div class="w">⚠ element.shadowRoot === null</div></div>`
      root.querySelector('#shadow-closed-btn').addEventListener('click', function () { this.textContent = '✓ Нажато!' })
    }
  }, [])

  return (
    <>
      <Zone id="shadow" label="Zone 04" labelColor="rgb(51,102,255)" title="// Shadow DOM — open mode">
        <p style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '16px', fontFamily: 'var(--mono)' }}>// Shadow root в режиме open — доступен через element.shadowRoot</p>
        <div className="shadow-wrapper">
          <span className="shadow-label">shadow-root (open)</span>
          <div ref={openRef} id="shadow-host-open" data-testid="shadow-host-open" />
        </div>
      </Zone>

      <Zone label="Zone 05" labelColor="rgb(255,51,102)" title="// Shadow DOM — closed mode">
        <p style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '16px', fontFamily: 'var(--mono)' }}>// Shadow root в режиме closed — element.shadowRoot === null</p>
        <div className="shadow-wrapper" style={{ borderColor: 'rgba(255,51,102,.4)' }}>
          <span className="shadow-label" style={{ color: 'var(--accent2)' }}>shadow-root (closed)</span>
          <div ref={closedRef} id="shadow-host-closed" data-testid="shadow-host-closed" />
        </div>
      </Zone>
    </>
  )
}

// ─── ZONE 06: Canvas ──────────────────────────────────────────────────────────
function Zone06() {
  const canvasRef = useRef(null)
  const btnPos = useRef({ x: 0, y: 0, w: 140, h: 44 })

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(30,30,46,0.8)'; ctx.lineWidth = 1
    for (let gx = 0; gx < canvas.width; gx += 20) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke() }
    for (let gy = 0; gy < canvas.height; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke() }
    const { w, h } = btnPos.current
    const x = Math.floor(Math.random() * (canvas.width - w - 40)) + 20
    const y = Math.floor(Math.random() * (canvas.height - h - 40)) + 20
    btnPos.current = { x, y, w, h }
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16
    ctx.fillStyle = '#00ff88'; ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h)
    ctx.fill()
    ctx.shadowBlur = 0; ctx.fillStyle = '#000'; ctx.font = 'bold 13px "JetBrains Mono",monospace'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('НАЖМИ МЕНЯ', x + w / 2, y + h / 2)
    const statusEl = document.getElementById('canvas-status')
    if (statusEl) statusEl.textContent = `// Кнопка · Центр: x=${x + w / 2 | 0}, y=${y + h / 2 | 0} · [${x},${y}] - [${x + w},${y + h}]`
  }

  useEffect(() => { draw() }, [])

  const handleClick = (e) => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX, cy = (e.clientY - rect.top) * scaleY
    const { x, y, w, h } = btnPos.current
    const hit = cx >= x && cx <= x + w && cy >= y && cy <= y + h
    if (hit) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(0,255,136,0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#00ff88'; ctx.font = 'bold 20px "JetBrains Mono",monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`✓ ПОПАЛ! x=${cx | 0}, y=${cy | 0}`, canvas.width / 2, canvas.height / 2)
      addLog(`canvas HIT! x=${cx | 0} y=${cy | 0}`)
    } else {
      ctx.fillStyle = 'rgba(255,51,102,0.15)'
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill()
      addLog(`canvas MISS x=${cx | 0} y=${cy | 0}`)
    }
  }

  return (
    <Zone id="canvas" label="Zone 06" labelColor="rgb(255,200,0)" title="// Canvas — попади в кнопку">
      <p style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '14px', fontFamily: 'var(--mono)' }}>// Нарисованная на canvas кнопка. Каждый раз в случайном месте.</p>
      <canvas ref={canvasRef} id="main-canvas" width="700" height="200" data-testid="main-canvas" onClick={handleClick} />
      <div id="canvas-status" style={{ fontFamily: 'var(--mono)', fontSize: '12px', padding: '8px', marginTop: '8px', color: 'var(--dim)' }}>// Кликните по кнопке на canvas</div>
      <div className="btn-row" style={{ marginTop: '10px' }}>
        <button className="btn btn-ghost" id="btn-redraw-canvas" data-testid="btn-redraw-canvas" onClick={() => { draw(); addLog('canvas перерисован') }}>Перерисовать</button>
      </div>
    </Zone>
  )
}

// ─── ZONE 07: iframe ───────────────────────────────────────────────────────────
function Zone07() {
  const iframeSrc = `<!DOCTYPE html><html><head><style>body{margin:0;background:#050508;color:#c8c8d8;font-family:monospace;padding:16px}.f{background:#0a0a10;border:1px solid #1e1e2e;color:#c8c8d8;padding:7px 10px;width:200px;border-radius:4px;margin:6px 0;display:block}.b{background:#00ff88;color:#000;border:none;padding:7px 14px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:12px;font-weight:700}p{font-size:11px;color:#4a4a6a;margin-bottom:12px}</style></head><body><p>// Элементы внутри iframe</p><input type="text" class="f" id="iframe-input" placeholder="Логин внутри iframe" data-testid="iframe-input"/><input type="password" class="f" id="iframe-pass" placeholder="Пароль внутри iframe" data-testid="iframe-pass"/><button class="b" id="iframe-btn" data-testid="iframe-btn" onclick='this.textContent="Нажато!"'>Кнопка в iframe</button></body></html>`
  return (
    <Zone label="Zone 07" title="// iframe — вложенный документ">
      <p style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '12px', fontFamily: 'var(--mono)' }}>// В iframe живёт отдельный document. В ZP: GetDocumentByAddress("1") — первый iframe.</p>
      <iframe id="main-iframe" name="main-iframe" height="200" data-testid="iframe-main" srcDoc={iframeSrc} style={{ border: '1px solid var(--border)', borderRadius: '5px', background: '#fff', width: '100%' }} />
    </Zone>
  )
}

// ─── ZONE 08: Dynamic DOM ─────────────────────────────────────────────────────
function Zone08() {
  const [items, setItems] = useState([1, 2, 3, 4, 5])
  const [activeTab, setActiveTab] = useState('tab-a')
  const [delayed, setDelayed] = useState(false)
  const [dynElements, setDynElements] = useState([])

  const loadMore = (e) => {
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 5) {
      setItems(prev => { const next = [...prev]; for (let i = 0; i < 3; i++) next.push(next.length + 1); return next })
    }
  }

  return (
    <Zone id="dynamic" label="Zone 08" title="// Динамический DOM">
      <div id="dynamic-target" style={{ minHeight: '40px', border: '1px dashed var(--border)', borderRadius: '5px', padding: '10px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--dim)' }}>
        {dynElements.length === 0 ? '// Здесь появятся динамические элементы' : dynElements.map(n => (
          <div key={n} id={`dynamic-el-${n}`} data-testid={`dynamic-el-${n}`} style={{ margin: '4px 0', padding: '6px 10px', background: 'rgba(0,255,136,.06)', border: '1px solid rgba(0,255,136,.2)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: '#00ff88' }}>
            → Добавлен элемент #{n}
          </div>
        ))}
      </div>
      <div className="btn-row" style={{ marginTop: '8px' }}>
        <button className="btn btn-ghost" data-testid="btn-add-element" onClick={() => { const n = dynElements.length + 1; setDynElements(p => [...p, n]); addLog(`Добавлен #dynamic-el-${n}`) }}>+ Добавить элемент</button>
        <button className="btn btn-ghost" data-testid="btn-remove-element" onClick={() => { if (dynElements.length === 0) return; const n = dynElements[dynElements.length - 1]; setDynElements(p => p.slice(0, -1)); addLog(`Удалён #dynamic-el-${n}`) }}>− Удалить элемент</button>
        <button className="btn btn-ghost" data-testid="btn-delayed" onClick={() => { setDelayed(false); setTimeout(() => { setDelayed(true); addLog('delayed-element появился!') }, 2000); addLog('delayed-element скрыт, появится через 2 сек...') }}>Показать через 2 сек</button>
      </div>
      {delayed && <div id="delayed-element" data-testid="delayed-element" style={{ display: 'block', background: 'rgba(0,255,136,.08)', border: '1px solid var(--accent)', borderRadius: '5px', padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--accent)', marginTop: '10px' }}>✓ Элемент появился через 2 секунды</div>}

      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>Бесконечный список (scroll)</div>
        <div id="infinite-list" data-testid="infinite-list" onScroll={loadMore} style={{ height: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '5px', padding: '8px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
          {items.map(n => <div key={n} className="list-item" data-id={n} data-testid={`list-item-${n}`}>Элемент #{n}{n > 5 ? ' (подгружен)' : ''}</div>)}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>Табы</div>
        <div className="tab-bar">
          {['tab-a', 'tab-b', 'tab-c'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} data-testid={tab} onClick={() => setActiveTab(tab)}>
              {tab === 'tab-a' ? 'Alpha' : tab === 'tab-b' ? 'Beta' : 'Gamma'}
            </button>
          ))}
        </div>
        <div>
          {activeTab === 'tab-a' && <div id="tab-a" data-testid="panel-a" style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--dim)' }}>Контент вкладки Alpha.</div>}
          {activeTab === 'tab-b' && <div id="tab-b" data-testid="panel-b"><input type="text" id="tab-b-input" placeholder="Поле внутри вкладки Beta" data-testid="tab-b-input" /></div>}
          {activeTab === 'tab-c' && <div id="tab-c" data-testid="panel-c" style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--accent)' }}>✓ Вы добрались до вкладки Gamma!</div>}
        </div>
      </div>
    </Zone>
  )
}

// ─── ZONE 09: Tricky ─────────────────────────────────────────────────────────
function Zone09() {
  const [dropText, setDropText] = useState('Перетащи сюда')
  const [dragOver, setDragOver] = useState(false)
  const [activePage, setActivePage] = useState(1)

  return (
    <Zone id="tricky" label="Zone 09" labelColor="rgb(255,51,102)" title="// Хитрые элементы — ловушки">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>Скрытые в DOM элементы</div>
        <div style={{ display: 'none' }} id="hidden-display-none" data-testid="hidden-display-none"><input type="text" defaultValue="display:none" name="hidden-field" /></div>
        <div style={{ visibility: 'hidden' }} id="invisible-element" data-testid="invisible-element"><input type="text" id="invisible-input" defaultValue="visibility:hidden" data-testid="invisible-input" /></div>
        <input type="text" style={{ opacity: 0, height: '1px', overflow: 'hidden' }} id="opacity-zero-input" defaultValue="opacity:0" data-testid="opacity-zero-input" />
        <div style={{ fontSize: '12px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>↑ Три поля выше скрыты по-разному.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>Drag &amp; Drop</div>
        <div style={{ marginBottom: '10px' }}>
          {['Item A', 'Item B', 'Item C'].map((item, i) => (
            <span key={i} className="drag-item" draggable id={`drag-${i + 1}`} data-testid={`drag-item-${i + 1}`}
              onDragStart={e => e.dataTransfer.setData('text/plain', item)}>{item}</span>
          ))}
        </div>
        <div className={`drop-zone${dragOver ? ' over' : ''}`} id="drop-zone" data-testid="drop-zone"
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData('text/plain'); setDropText('✓ Дропнут: ' + id); addLog('dropped: ' + id) }}>
          {dropText}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>contenteditable</div>
        <div contentEditable id="editable-div" role="textbox" data-testid="editable-div" suppressContentEditableWarning>Этот текст можно редактировать напрямую в div</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>Перекрытые элементы</div>
        <div style={{ position: 'relative', height: '60px' }}>
          <button className="btn btn-ghost" id="btn-behind" data-testid="btn-behind" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>Кнопка сзади</button>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '60px', background: 'rgba(255,51,102,.15)', border: '1px solid var(--accent2)', borderRadius: '5px', zIndex: 2, display: 'flex', alignItems: 'center', paddingLeft: '14px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent2)' }}>Перекрывающий слой</div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>Пагинация</div>
        <div className="pagination" id="pagination" data-testid="pagination">
          <button className="page-btn" onClick={() => setActivePage(p => Math.max(1, p - 1))} data-testid="page-prev">‹</button>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} className={`page-btn ${activePage === n ? 'active' : ''}`} data-testid={`page-${n}`} onClick={() => { setActivePage(n); addLog('pagination: page ' + n) }}>{n}</button>
          ))}
          <button className="page-btn" onClick={() => setActivePage(p => Math.min(5, p + 1))} data-testid="page-next">›</button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '8px', textTransform: 'uppercase' }}>details/summary</div>
        <details id="details-1" data-testid="details-1"><summary>Скрытый раздел 1</summary><div style={{ padding: '14px', fontSize: '13px' }}><input type="text" id="details-input" placeholder="Поле внутри details" data-testid="details-input" /></div></details>
        <details open id="details-2" data-testid="details-2"><summary>Раздел 2 — открыт по умолчанию</summary><div style={{ padding: '14px', fontSize: '13px' }}>Контент видимый сразу.</div></details>
      </div>
    </Zone>
  )
}

// ─── ZONE 10: Misc HTML ───────────────────────────────────────────────────────
function Zone10() {
  return (
    <Zone label="Zone 10" title="// Прочие HTML-элементы">
      <div className="grid-2">
        <div>
          <div className="alert alert-info" data-testid="alert-info">Информация — alert-info</div>
          <div className="alert alert-success" data-testid="alert-success">Успех — alert-success</div>
          <div className="alert alert-warning" data-testid="alert-warning">Предупреждение</div>
          <div className="alert alert-error" data-testid="alert-error">Ошибка — alert-error</div>
          <div style={{ marginTop: '14px', marginBottom: '4px', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>progress &amp; meter</div>
          <progress value="65" max="100" data-testid="progress-main" style={{ width: '100%', height: '8px', marginBottom: '8px' }} />
          <meter value="0.7" min="0" max="1" low="0.25" high="0.75" optimum="0.9" data-testid="meter-main" style={{ width: '100%', height: '10px', marginBottom: '8px' }} />
          <div style={{ marginTop: '14px', marginBottom: '8px', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Статус-индикаторы</div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span><span className="status-dot dot-green" />Online</span>
            <span><span className="status-dot dot-red" />Offline</span>
            <span><span className="status-dot dot-yellow" />Pending</span>
          </div>
          <div style={{ marginTop: '14px' }}>
            <span className="chip" data-testid="chip-1">automation</span>
            <span className="chip" data-testid="chip-2">zenno</span>
            <span className="chip chip-red" data-testid="chip-error">error</span>
            <span className="chip chip-blue" data-testid="chip-info">info</span>
            <span className="badge badge-green" data-testid="badge-count">42</span>
            <span className="badge badge-red" data-testid="badge-error">!</span>
          </div>
        </div>
        <div>
          <table id="data-table" data-testid="data-table">
            <thead><tr><th>#</th><th>Имя</th><th>Статус</th><th>Действие</th></tr></thead>
            <tbody>
              <tr data-row="1" data-testid="table-row-1"><td>1</td><td id="table-name-1">Алиса</td><td><span className="chip" data-testid="status-1">active</span></td><td><a href="#" className="link-danger" data-testid="table-delete-1">удалить</a></td></tr>
              <tr data-row="2" data-testid="table-row-2"><td>2</td><td id="table-name-2">Боб</td><td><span className="chip chip-red" data-testid="status-2">banned</span></td><td><a href="#" className="link-danger" data-testid="table-delete-2">удалить</a></td></tr>
              <tr data-row="3" data-testid="table-row-3"><td>3</td><td id="table-name-3">Виктор</td><td><span className="chip chip-blue" data-testid="status-3">pending</span></td><td><a href="#" className="link-danger" data-testid="table-delete-3">удалить</a></td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a href="https://example.com" target="_blank" rel="noreferrer" data-testid="link-external">Внешняя ссылка (target=_blank)</a>
            <a href="#forms" data-testid="link-anchor">Якорная ссылка (#forms)</a>
            <a href="#" data-testid="link-js" onClick={e => e.preventDefault()}>Ссылка с onclick</a>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '16px', fontSize: '13px', lineHeight: 2 }}>
        <p>Обычный <strong>жирный</strong> <em>курсив</em> <u>подчёркнутый</u> <s>зачёркнутый</s> <code>inline code</code></p>
        <blockquote id="quote-main" data-testid="quote-main">Это blockquote — цитата.</blockquote>
        <pre id="pre-main" data-testid="pre-main"><code>var doc = instance.ActiveTab.MainDocument;{'\n'}var el = doc.FindElementById("input-text");</code></pre>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div
          role="button" tabIndex={0} aria-label="Кастомная кнопка" data-testid="aria-button"
          style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '5px', fontFamily: 'var(--mono)', fontSize: '12px', cursor: 'pointer', color: 'var(--text)' }}
          onClick={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = 'Кликнуто!' }}
        >div[role=button] — не кнопка, но кликабелен</div>
      </div>
    </Zone>
  )
}

// ─── ZONE 11: Event Log ───────────────────────────────────────────────────────
function Zone11() {
  const logRef = useRef(null)

  useEffect(() => {
    globalLog = logRef.current
    return () => { globalLog = null }
  }, [])

  return (
    <Zone label="Zone 11" title="// Лог событий">
      <div ref={logRef} id="event-log" data-testid="event-log"
        style={{ height: '140px', overflowY: 'auto', background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)' }}>
        <div>// Лог пуст — взаимодействуй с элементами</div>
      </div>
      <button className="btn btn-ghost" style={{ marginTop: '8px', fontSize: '11px' }} onClick={() => { if (logRef.current) logRef.current.innerHTML = '<div>// Лог очищен</div>' }}>Очистить лог</button>
    </Zone>
  )
}

// ─── ZONE 12: Web3 native MetaMask ───────────────────────────────────────────
function Zone12() {
  const [status, setStatus] = useState('не подключён')
  const [addr, setAddr] = useState('—')
  const [sig, setSig] = useState('—')
  const [statusColor, setStatusColor] = useState('var(--dim)')
  const addrRef = useRef(null)

  const check = () => {
    if (typeof window.ethereum !== 'undefined') {
      setStatus('window.ethereum найден · ' + (window.ethereum.isMetaMask ? 'MetaMask' : 'Unknown'))
      setStatusColor('#00ff88')
      addLog('web3: ethereum найден')
    } else {
      setStatus('window.ethereum не найден')
      setStatusColor('#ff3366')
      addLog('web3: ethereum отсутствует')
    }
  }

  const connect = async () => {
    if (!window.ethereum) { check(); return }
    try {
      setStatus('Ожидание...'); setStatusColor('#ffcc00')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      addrRef.current = accounts[0]
      setAddr(accounts[0]); setStatus('подключён'); setStatusColor('#00ff88')
      addLog('web3: подключён · ' + accounts[0])
    } catch { setStatus('отклонено'); setStatusColor('#ff3366') }
  }

  const sign = async () => {
    if (!addrRef.current) return
    const msg = document.getElementById('web3-message-input')?.value || 'ZP Sandbox auth'
    try {
      const signature = await window.ethereum.request({ method: 'personal_sign', params: [msg, addrRef.current] })
      setSig(signature); setStatus('подписано'); setStatusColor('#00ff88')
      addLog('web3: подписано · ' + signature.slice(0, 20) + '...')
    } catch { setStatus('отклонено'); setStatusColor('#ff3366') }
  }

  return (
    <Zone id="web3" label="Zone 12" labelColor="rgb(168,85,247)" title="// Web3 — Injected Wallet (MetaMask)">
      <div className="grid-2">
        <div>
          <div style={{ marginBottom: '12px', padding: '12px 14px', background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
            <div style={{ color: 'var(--dim)', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Статус</div>
            <div style={{ color: statusColor }}>{status}</div>
          </div>
          <div style={{ marginBottom: '12px', padding: '12px 14px', background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
            <div style={{ color: 'var(--dim)', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Адрес кошелька</div>
            <div style={{ color: 'var(--accent)', wordBreak: 'break-all' }} data-testid="web3-address">{addr}</div>
          </div>
          <div style={{ padding: '12px 14px', background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
            <div style={{ color: 'var(--dim)', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Подпись</div>
            <div style={{ color: '#a855f7', wordBreak: 'break-all', maxHeight: '60px', overflow: 'hidden' }} data-testid="web3-signature">{sig}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn" style={{ background: 'rgba(168,85,247,.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,.3)', fontSize: '12px' }} onClick={check}>Проверить window.ethereum</button>
          <button className="btn" style={{ background: '#a855f7', color: '#fff', fontSize: '12px' }} onClick={connect}>Connect Wallet</button>
          <div className="field-group"><label htmlFor="web3-message-input" style={{ color: '#a855f7' }}>Сообщение для подписи</label><input type="text" id="web3-message-input" defaultValue="ZP Sandbox auth" data-testid="web3-message-input" /></div>
          <button className="btn" style={{ background: 'rgba(168,85,247,.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,.3)', fontSize: '12px' }} onClick={sign} disabled={addr === '—'}>Sign Message</button>
        </div>
      </div>
    </Zone>
  )
}

// ─── ZONE 13: Canvas Fingerprint ─────────────────────────────────────────────
function Zone13() {
  const [hash, setHash] = useState('— нажмите Generate')
  const [dataUrl, setDataUrl] = useState('—')
  const [pixel, setPixel] = useState('—')
  const [fullFp, setFullFp] = useState('// Нажмите Generate')
  const [webglInfo, setWebglInfo] = useState('// WebGL инфо появится после Generate')
  const lastHash = useRef(null)

  function hashStr(s) {
    let h = 5381
    for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h & h }
    return (h >>> 0).toString(16).padStart(8, '0')
  }

  const generate = () => {
    const canvas = document.getElementById('fp-canvas-hidden')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    grad.addColorStop(0, 'rgba(255,0,0,0.1)'); grad.addColorStop(0.5, 'rgba(0,255,0,0.1)'); grad.addColorStop(1, 'rgba(0,0,255,0.1)')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ff6600'; ctx.font = '11px Arial'; ctx.fillText('Cwm fjordbank glyphs vext quiz 😀', 4, 16)
    ctx.fillStyle = '#00aaff'; ctx.font = 'bold 11px "Times New Roman"'; ctx.fillText('éàüñ中文рус ∞∈∑', 4, 34)
    ctx.strokeStyle = 'rgba(0,255,136,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(240, 30, 20, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(255,51,102,0.6)'; ctx.beginPath(); ctx.arc(250, 30, 12, 0, Math.PI * 2); ctx.fill()
    const du = canvas.toDataURL('image/png')
    const h = hashStr(du) + hashStr(du.split('').reverse().join(''))
    const px = ctx.getImageData(0, 0, 1, 1).data
    setHash(h); setDataUrl(du.substring(0, 80) + '...'); setPixel(`r=${px[0]} g=${px[1]} b=${px[2]} a=${px[3]}`)
    lastHash.current = h

    // WebGL
    const wgl = document.getElementById('fp-webgl-canvas')
    if (wgl) {
      const gl = wgl.getContext('webgl')
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info')
        const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
        const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
        setWebglInfo(`Vendor: ${vendor}\nRenderer: ${renderer}\nVersion: ${gl.getParameter(gl.VERSION)}\nExtensions: ${gl.getSupportedExtensions().length} шт`)
      }
    }

    const nav = navigator; const sc = window.screen
    setFullFp([
      `// Canvas Hash\nhash: ${h}`,
      `\n// Navigator\nuserAgent: ${nav.userAgent.slice(0, 60)}...`,
      `language: ${nav.language}`,
      `platform: ${nav.platform}`,
      `hardwareConcurrency: ${nav.hardwareConcurrency}`,
      `deviceMemory: ${nav.deviceMemory || '?'} GB`,
      `webdriver: ${nav.webdriver}`,
      `\n// Screen\nresolution: ${sc.width}x${sc.height}`,
      `colorDepth: ${sc.colorDepth} bit`,
      `pixelRatio: ${window.devicePixelRatio}`,
      `\n// Timezone\ntimezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      `offset: UTC${-new Date().getTimezoneOffset() / 60}`,
      `\n// Touch\nmaxTouchPoints: ${nav.maxTouchPoints}`,
    ].join('\n'))
    addLog('fingerprint generated: ' + h)
  }

  return (
    <Zone id="fingerprint" label="Zone 13" labelColor="rgb(255,200,0)" title="// Canvas Fingerprinting">
      <div className="grid-2">
        <div>
          <canvas id="fp-canvas-hidden" width="280" height="60" style={{ display: 'block', border: '1px dashed rgba(255,200,0,.3)', borderRadius: '5px', background: '#050508', marginBottom: '12px' }} data-testid="fp-canvas-hidden" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[['Canvas Hash', hash, '#ffcc00'], ['DataURL', dataUrl, 'var(--text)'], ['Pixel [0,0]', pixel, 'var(--accent)']].map(([label, val, color]) => (
              <div key={label} style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '11px' }}>
                <div style={{ color: 'var(--dim)', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ color, wordBreak: 'break-all', fontSize: '12px' }}>{val}</div>
              </div>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: '12px' }}>
            <button className="btn" style={{ background: '#ffcc00', color: '#000', fontWeight: 700, fontSize: '12px' }} onClick={generate}>Generate Fingerprint</button>
            <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => {
              if (!lastHash.current) return
              const canvas = document.getElementById('fp-canvas-hidden'); if (!canvas) return
              const ctx = canvas.getContext('2d'); const du = canvas.toDataURL('image/png')
              const h = hashStr(du) + hashStr(du.split('').reverse().join(''))
              const match = h === lastHash.current
              setHash(h); document.getElementById('fp-hash-el').style.color = match ? '#00ff88' : '#ff3366'
              addLog('fp compare: ' + (match ? 'MATCH ✓' : 'CHANGED ✗'))
            }}>Сравнить</button>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: '12px', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Полный Browser Fingerprint</div>
          <pre style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '12px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', lineHeight: '1.9', minHeight: '200px', whiteSpace: 'pre-wrap' }}>{fullFp}</pre>
          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)' }}>WebGL:</div>
          <canvas id="fp-webgl-canvas" width="280" height="60" style={{ border: '1px dashed rgba(255,200,0,.3)', borderRadius: '5px', background: '#050508', marginTop: '6px' }} />
          <pre style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{webglInfo}</pre>
        </div>
      </div>
    </Zone>
  )
}

// ─── ZONE 14: Bot Detection ──────────────────────────────────────────────────
function Zone14() {
  const [checks, setChecks] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [mouseStats, setMouseStats] = useState('events: 0 | unique: 0')
  const [typingStats, setTypingStats] = useState('avg interval: — ms | variance: —')
  const [scrollStats, setScrollStats] = useState('scroll events: 0')
  const mousePoints = useRef([])
  const typingTs = useRef([])
  const scrollCount = useRef(0)

  const runChecks = () => {
    const nav = navigator
    const list = [
      { name: 'navigator.webdriver', val: String(nav.webdriver), bot: nav.webdriver === true, desc: 'Selenium/Playwright ставят true' },
      { name: 'navigator.plugins.length', val: String(nav.plugins.length), bot: nav.plugins.length === 0, desc: 'У headless обычно 0' },
      { name: 'navigator.languages', val: JSON.stringify(nav.languages), bot: !nav.languages?.length, desc: 'У ботов часто пустой' },
      { name: 'navigator.hardwareConcurrency', val: String(nav.hardwareConcurrency), bot: !nav.hardwareConcurrency, desc: 'У реальных > 0' },
      { name: 'window.chrome', val: typeof window.chrome, bot: typeof window.chrome === 'undefined' && nav.userAgent.includes('Chrome'), desc: 'В реальном Chrome всегда есть' },
      { name: 'screen.colorDepth', val: String(window.screen.colorDepth), bot: window.screen.colorDepth < 24, desc: 'У реальных 24+' },
      { name: 'window.outerWidth', val: String(window.outerWidth), bot: window.outerWidth === 0, desc: 'В headless может быть 0' },
    ]
    setChecks(list)
    const score = list.filter(c => c.bot).length
    setVerdict({ score, total: list.length })
    addLog(`bot-detection: score=${score}/${list.length}`)
  }

  useEffect(() => {
    const onScroll = () => { scrollCount.current++; setScrollStats(`scroll events: ${scrollCount.current} | Y=${window.scrollY}`) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Zone id="antibot" label="Zone 14" labelColor="rgb(255,51,102)" title="// Bot Detection">
      <div className="grid-2">
        <div>
          <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--mono)', marginBottom: '10px', textTransform: 'uppercase' }}>Navigator / Window checks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {checks.length === 0
              ? <div style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: '12px' }}>// Нажми "Запустить проверки"</div>
              : checks.map(c => (
                <div key={c.name} style={{ background: '#050508', border: `1px solid ${c.bot ? 'rgba(255,51,102,.3)' : 'rgba(0,255,136,.15)'}`, borderRadius: '4px', padding: '7px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--dim)', fontSize: '10px' }}>{c.name}</span>
                    <span style={{ color: c.bot ? 'var(--accent2)' : 'var(--accent)', fontSize: '10px' }}>{c.bot ? '⚠ BOT?' : '✓ OK'}</span>
                  </div>
                  <div style={{ color: 'var(--text)', fontSize: '11px', marginTop: '2px' }}>{c.val}</div>
                  <div style={{ color: 'var(--dim)', fontSize: '10px' }}>{c.desc}</div>
                </div>
              ))
            }
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px' }}>
            <div style={{ color: 'var(--dim)', fontSize: '11px', marginBottom: '6px' }}>Mouse entropy</div>
            <div style={{ height: '50px', border: '1px dashed var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', fontSize: '11px', cursor: 'crosshair' }}
              onMouseMove={e => {
                const r = e.currentTarget.getBoundingClientRect()
                mousePoints.current.push({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) })
                const unique = new Set(mousePoints.current.map(p => `${p.x},${p.y}`)).size
                setMouseStats(`events: ${mousePoints.current.length} | unique: ${unique} | entropy: ${(unique / mousePoints.current.length).toFixed(2)}`)
              }}>Двигай мышь здесь</div>
            <div style={{ color: 'var(--accent)', marginTop: '6px', fontSize: '11px' }}>{mouseStats}</div>
          </div>
          <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px' }}>
            <div style={{ color: 'var(--dim)', fontSize: '11px', marginBottom: '6px' }}>Keyboard timing</div>
            <input type="text" placeholder="Печатай сюда..." style={{ marginBottom: '6px' }} onKeyDown={() => {
              typingTs.current.push(performance.now())
              if (typingTs.current.length > 1) {
                const intervals = typingTs.current.slice(1).map((t, i) => t - typingTs.current[i])
                const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
                const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length
                setTypingStats(`avg: ${avg.toFixed(0)}ms | variance: ${variance.toFixed(0)}`)
              }
            }} />
            <div style={{ color: 'var(--accent)', fontSize: '11px' }}>{typingStats}</div>
          </div>
          <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 12px' }}>
            <div style={{ color: 'var(--dim)', fontSize: '11px', marginBottom: '4px' }}>Scroll behavior</div>
            <div style={{ color: 'var(--accent)', fontSize: '11px' }}>{scrollStats}</div>
          </div>
        </div>
      </div>
      <div className="btn-row" style={{ marginTop: '16px' }}>
        <button className="btn" style={{ background: 'var(--accent2)', color: '#fff', fontSize: '12px' }} onClick={runChecks}>Запустить проверки</button>
        <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => { setChecks([]); setVerdict(null); mousePoints.current = []; typingTs.current = []; setMouseStats('events: 0 | unique: 0'); setTypingStats('avg: — ms'); addLog('bot-detection: reset') }}>Сбросить</button>
      </div>
      {verdict && (
        <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '13px', ...(verdict.score === 0 ? { background: 'rgba(0,255,136,.08)', border: '1px solid rgba(0,255,136,.3)', color: '#00ff88' } : verdict.score <= 2 ? { background: 'rgba(255,200,0,.08)', border: '1px solid rgba(255,200,0,.3)', color: '#ffcc00' } : { background: 'rgba(255,51,102,.08)', border: '1px solid rgba(255,51,102,.3)', color: '#ff3366' }) }}>
          {verdict.score === 0 ? '✓' : verdict.score <= 2 ? '⚠' : '✗'} Bot score: {verdict.score}/{verdict.total} — {verdict.score === 0 ? 'Выглядишь как человек' : verdict.score <= 2 ? 'Подозрительно' : 'Высокая вероятность бота'}
        </div>
      )}
    </Zone>
  )
}

// ─── ZONE 15: Anti-DevTools ───────────────────────────────────────────────────
function Zone15() {
  const [dtOpen, setDtOpen] = useState(false)
  const [sizes, setSizes] = useState({ outer: '—', inner: '—', diff: '—' })
  const [consoleResult, setConsoleResult] = useState('— не запущено')
  const [debuggerResult, setDebuggerResult] = useState('— не запущено')
  const [nativeResult, setNativeResult] = useState('— нажми Проверить')
  const [contentHidden, setContentHidden] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const wDiff = window.outerWidth - window.innerWidth
      const hDiff = window.outerHeight - window.innerHeight
      const open = wDiff > 100 || hDiff > 200
      setDtOpen(open)
      setSizes({ outer: `${window.outerWidth}x${window.outerHeight}`, inner: `${window.innerWidth}x${window.innerHeight}`, diff: `W:${wDiff} H:${hDiff}` })
      if (hiding && open) setContentHidden(true)
      else if (!open) setContentHidden(false)
    }, 500)
    return () => clearInterval(interval)
  }, [hiding])

  return (
    <Zone id="devtools" label="Zone 15" labelColor="rgb(255,100,0)" title="// Anti-DevTools">
      <div style={{ padding: '12px 16px', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '13px', marginBottom: '20px', ...(dtOpen ? { background: 'rgba(255,51,102,.08)', border: '1px solid rgba(255,51,102,.3)', color: '#ff3366' } : { background: 'rgba(0,255,136,.08)', border: '1px solid rgba(0,255,136,.2)', color: 'var(--accent)' }) }}>
        <span className={`status-dot ${dtOpen ? 'dot-red' : 'dot-green'}`} />
        {dtOpen ? '⚠ DevTools: ОБНАРУЖЕНЫ' : '✓ DevTools: не обнаружены'}
      </div>
      <div className="grid-2">
        <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#ff6600', textTransform: 'uppercase', marginBottom: '8px' }}>Техника 1 — Window Size</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--dim)' }}>outer: {sizes.outer} | inner: {sizes.inner}<br />diff: <span style={{ color: dtOpen ? '#ff3366' : '#00ff88' }}>{sizes.diff} {dtOpen ? '→ OPEN' : '→ closed'}</span></div>
        </div>
        <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#ff6600', textTransform: 'uppercase', marginBottom: '8px' }}>Техника 2 — console.log Timing</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--dim)' }}>{consoleResult}</div>
          <button className="btn btn-ghost" style={{ fontSize: '11px', marginTop: '8px' }} onClick={() => {
            setConsoleResult('Замеряем...')
            setTimeout(() => {
              const t0 = performance.now(); const d = {}
              for (let i = 0; i < 100; i++) { console.groupCollapsed('dt'); console.log(d); console.groupEnd() }
              const e = performance.now() - t0; const open = e > 50
              setConsoleResult(`${e.toFixed(1)}ms → ${open ? '⚠ ОТКРЫТЫ' : '✓ закрыты'}`)
            }, 50)
          }}>Замерить</button>
        </div>
        <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#ff6600', textTransform: 'uppercase', marginBottom: '8px' }}>Техника 6 — Native Function Check</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{nativeResult}</div>
          <button className="btn btn-ghost" style={{ fontSize: '11px', marginTop: '8px' }} onClick={() => {
            const fns = [['console.log', console.log], ['document.querySelector', document.querySelector], ['window.fetch', window.fetch], ['JSON.stringify', JSON.stringify]]
            setNativeResult(fns.map(([name, fn]) => {
              let str = ''; try { str = Function.prototype.toString.call(fn) } catch {}
              const ok = str.includes('[native code]')
              return `${ok ? '✓' : '⚠ PATCHED'} ${name}`
            }).join('\n'))
          }}>Проверить</button>
        </div>
        <div style={{ background: '#050508', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#ff6600', textTransform: 'uppercase', marginBottom: '8px' }}>Реакция на DevTools</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" style={{ fontSize: '11px' }} onClick={() => alert('⚠ Обнаружены DevTools!\nВаша сессия будет прервана.')}>Предупреждение</button>
            <button className="btn btn-ghost" style={{ fontSize: '11px' }} onClick={() => setHiding(true)}>Скрыть контент</button>
            <button className="btn btn-ghost" style={{ fontSize: '11px' }} onClick={() => { setHiding(false); setContentHidden(false) }}>Сбросить</button>
          </div>
          {!contentHidden
            ? <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,255,136,.06)', border: '1px solid rgba(0,255,136,.2)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)' }}>🔓 Защищённый контент<br /><span style={{ color: 'var(--dim)', fontSize: '11px' }}>SECRET_DATA: {'{"user":"admin","token":"eyJhbGc..."}'}</span></div>
            : <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,51,102,.06)', border: '1px solid rgba(255,51,102,.2)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent2)' }}>🔒 Контент скрыт — закрой DevTools</div>
          }
        </div>
      </div>
    </Zone>
  )
}

// ─── MAIN SANDBOX ─────────────────────────────────────────────────────────────
export default function Sandbox({ view, setView, lessonsContent, access }) {
  return (
    <div>
      <Header view={view} setView={setView} access={access} />
      {view === 'lessons' ? (
        lessonsContent
      ) : (
        <div className="container">
          <Zone11 />
          <Zone01 />
          <Zone02 />
          <Zone03 />
          <Zone04 />
          <Zone06 />
          <Zone07 />
          <Zone08 />
          <Zone09 />
          <Zone10 />
          <Zone12 />
          <Zone13 />
          <Zone14 />
          <Zone15 />
          <Zone16 />
        </div>
      )}
      <footer>autoZ3N SANDBOX v2.0 · {view === 'sandbox' ? 'Полигон открыт для всех' : 'Уроки — приватный доступ'}</footer>
    </div>
  )
}
