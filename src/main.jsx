import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="app-error" aria-live="assertive">
        <span>Un petit imprévu</span>
        <h1>La cuisine a besoin d’un instant.</h1>
        <p>Vos sélections enregistrées sont conservées. Rechargez la page pour reprendre là où vous vous êtes arrêté.</p>
        <div>
          <button onClick={() => window.location.reload()}>Recharger la page</button>
          <a href="/">Retour à l’accueil</a>
        </div>
      </main>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      registration.update()
    } catch {
      // The storefront remains fully usable when service workers are unavailable.
    }
  })
}
