import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.jsx'
import './styles.css'

// Замени на свой App ID с dashboard.privy.io → Settings → App ID
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'YOUR_PRIVY_APP_ID'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'],
        appearance: {
          theme: 'dark',
          accentColor: '#00ff88',
          logo: '',
          showWalletLoginFirst: false,
          walletChainType: 'ethereum-only',
        },
        embeddedWallets: {
          // Автоматически создаём embedded wallet для email/social юзеров
          // чтобы у каждого студента был web3-адрес
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        // Разрешённые OAuth редиректы — добавь свой домен в Privy dashboard
        // Settings → Allowed redirect URIs
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
)
