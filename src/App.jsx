import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import Sandbox from './components/Sandbox.jsx'
import Lessons from './components/Lessons.jsx'
import { useUnlockAccess } from './hooks/useUnlockAccess.js'

export default function App() {
  const { ready } = usePrivy()
  const [view, setView] = useState('sandbox')
  const access = useUnlockAccess()

  return (
    <Sandbox
      ready={ready}
      view={view}
      setView={setView}
      access={access}
      lessonsContent={<Lessons access={access} />}
    />
  )
}
