import React, { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'

export default function Header({ view, setView, access, onReset }) {
  const { ready, authenticated, user, logout, login } = usePrivy()
  const { wallets } = useWallets()
  const [showUser, setShowUser] = useState(false)

  const email = user?.email?.address
  const wallet = wallets?.[0]?.address
  const twitter = user?.twitter?.username
  const discord = user?.discord?.username
  const google = user?.google?.email

  const displayName =
    email
    || (wallet ? wallet.slice(0, 6) + '...' + wallet.slice(-4) : null)
    || (twitter ? '@' + twitter : null)
    || (discord ? discord : null)
    || google
    || user?.id?.slice(0, 16) + '...'

  const authType =
    email ? 'email' :
    wallet ? 'wallet' :
    twitter ? 'twitter' :
    discord ? 'discord' :
    google ? 'google' : '?'

  const handleLessonsClick = () => {
    if (!authenticated) { login(); return }
    if (!access.hasAccess) return  // кнопка задизейблена если нет ключа
    setView('lessons')
  }

  // Лейбл кнопки Уроки в зависимости от состояния
  const lessonsLabel = () => {
    if (!authenticated) return <>Уроки <span className="tab-lock">🔒</span></>
    if (access.loading) return <>Уроки <span className="tab-lock">⏳</span></>
    if (!access.hasAccess) return <>Уроки <span className="tab-lock">⛔</span></>
    return 'Уроки'
  }

  return (
    <header className="site-header">
      <div className="logo">autoZ3N<span>//</span>SANDBOX</div>

      <div className="header-tabs">
        <button
          className={`header-tab ${view === 'sandbox' ? 'active' : ''}`}
          onClick={() => setView('sandbox')}
        >
          Полигон
        </button>
        {access?.hasAccess && (
            <button className={`header-tab lessons-tab ${view === 'lessons' ? 'active' : ''}`} onClick={() => setView('lessons')}>
              Уроки
            </button>
        )}
      </div>

      <nav className="nav">
        {view === 'sandbox' && <>
          <a href="#forms">Формы</a>
          <a href="#shadow">Shadow DOM</a>
          <a href="#canvas">Canvas</a>
          <a href="#dynamic">Динамика</a>
          <a href="#tricky">Хитрые</a>
          <a href="#web3">Web3</a>
          <a href="#fingerprint" style={{ color: '#ffcc00' }}>Fingerprint</a>
          <a href="#antibot" style={{ color: '#ff3366' }}>Anti-bot</a>
          <a href="#devtools" style={{ color: '#ff6600' }}>Devtools</a>
        </>}
      </nav>

      {view === 'sandbox' && (
        <button className="btn-reset-state" onClick={onReset} title="Сбросить состояние страницы">
          ↺ Сброс
        </button>
      )}

      {ready && (
        authenticated ? (
          <div className="header-user" onClick={() => setShowUser(v => !v)}>
            <span className={`status-dot ${access.hasAccess ? 'dot-green' : 'dot-yellow'}`} />
            <span className="user-name">{displayName}</span>
            <span className="user-type-badge">{authType}</span>
            <span className="user-arrow">{showUser ? '▲' : '▼'}</span>

            {showUser && (
              <div className="user-dropdown">
                <div className="user-dropdown-id">
                  <div className="user-dropdown-label">User DID</div>
                  <div className="user-dropdown-value">{user?.id}</div>
                </div>
                {wallet && (
                  <div className="user-dropdown-id">
                    <div className="user-dropdown-label">Wallet</div>
                    <div className="user-dropdown-value">{wallet}</div>
                  </div>
                )}
                <div className="user-dropdown-id">
                  <div className="user-dropdown-label">Доступ к курсу</div>
                  <div className="user-dropdown-value" style={{ color: access.hasAccess ? 'var(--accent)' : 'var(--accent2)' }}>
                    {access.loading ? '⏳ проверяем...' :
                     access.hasAccess
                       ? <>
                           ✓ активен · токен #{access.tokenId} · до {new Date(access.expiration * 1000).toLocaleDateString('ru')}
                           <br />
                           <span style={{ color: 'var(--dim)', fontSize: '9px' }}>
                             {access.matchedAddress?.slice(0, 8)}...{access.matchedAddress?.slice(-6)}
                           </span>
                         </>
                       : '✗ нет активной подписки'}
                  </div>
                </div>
                <button
                  className="user-logout-btn"
                  onClick={e => { e.stopPropagation(); logout(); setView('sandbox') }}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-login-header" onClick={login}>
            Войти →
          </button>
        )
      )}
    </header>
  )
}
