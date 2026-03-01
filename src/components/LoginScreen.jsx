import React from 'react'
import { usePrivy } from '@privy-io/react-auth'

export default function LoginScreen() {
  const { login } = usePrivy()

  return (
    <div className="login-screen">
      <div className="login-card">

        <div className="login-logo">
          autoZ3N<span>//</span>SANDBOX
        </div>

        <div className="login-subtitle">
          // Полигон для обучения web-автоматизации
        </div>

        <div className="login-divider" />

        <div className="login-description">
          <p>Доступ для участников курса.</p>
          <p>Войди через email или подключи кошелёк — сессия сохранится.</p>
        </div>

        <button className="login-btn" onClick={login}>
          <span className="login-btn-icon">→</span>
          Войти в sandbox
        </button>

        <div className="login-methods">
          <span>email OTP</span>
          <span>·</span>
          <span>MetaMask</span>
          <span>·</span>
          <span>Google</span>
          <span>·</span>
          <span>Twitter</span>
          <span>·</span>
          <span>Discord</span>
        </div>

      </div>
    </div>
  )
}
