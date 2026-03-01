import { useState, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://autoz3n-access.YOUR_SUBDOMAIN.workers.dev'

export function useUnlockAccess() {
  const { authenticated, getAccessToken, user } = usePrivy()
  const { wallets } = useWallets()

  const [state, setState] = useState({
    loading: false,
    hasAccess: false,
    tokenId: null,
    expiration: 0,
    matchedAddress: null,
    error: null,
  })

  const check = async () => {
    if (!authenticated || !user) {
      setState({ loading: false, hasAccess: false, tokenId: null, expiration: 0, matchedAddress: null, error: null })
      return
    }

    // Собираем ВСЕ wallet адреса из linkedAccounts
    // Приоритет: injected (MetaMask) > embedded (Privy)
    const linkedWallets = (user.linkedAccounts || [])
      .filter(a => a.type === 'wallet')
      .map(a => a.address?.toLowerCase())
      .filter(Boolean)

    // Embedded wallet — последний приоритет
    const embeddedWallets = (wallets || [])
      .filter(w => w.walletClientType === 'privy')
      .map(w => w.address?.toLowerCase())
      .filter(Boolean)

    // Внешние кошельки — первый приоритет
    const externalWallets = (wallets || [])
      .filter(w => w.walletClientType !== 'privy')
      .map(w => w.address?.toLowerCase())
      .filter(Boolean)

    // Итоговый список: external → linked → embedded, без дублей
    const allAddresses = [
      ...new Set([...externalWallets, ...linkedWallets, ...embeddedWallets])
    ]

    if (allAddresses.length === 0) {
      setState(s => ({ ...s, loading: false, hasAccess: false, error: 'no wallet linked' }))
      return
    }

    setState(s => ({ ...s, loading: true, error: null }))

    try {
      const token = await getAccessToken()

      // Проверяем адреса по очереди — останавливаемся на первом валидном
      for (const address of allAddresses) {
        const res = await fetch(
          `${WORKER_URL}/api/check?address=${address}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()

        if (data.valid) {
          setState({
            loading: false,
            hasAccess: true,
            tokenId: data.tokenId,
            expiration: data.expiration,
            matchedAddress: address,
            error: null,
          })
          return
        }
      }

      // Ни один адрес не прошёл
      setState({
        loading: false,
        hasAccess: false,
        tokenId: null,
        expiration: 0,
        matchedAddress: null,
        error: null,
      })
    } catch (e) {
      setState({
        loading: false,
        hasAccess: false,
        tokenId: null,
        expiration: 0,
        matchedAddress: null,
        error: e.message,
      })
    }
  }

  useEffect(() => {
    check()
  }, [authenticated, user?.linkedAccounts?.length, wallets?.length])

  return { ...state, recheck: check }
}
