import { useState, useEffect } from 'react'

// ============================================
// CUSTOMIZABLE EVENT DETAILS - EDIT THESE
// ============================================
const EVENT_DETAILS = {
  date: '10.12.2025',
  location: "Filip Micevski's Town",
  time: '20:00', // Add your preferred time here
  dressCode: 'Sharp suits, dark colors, fedoras optional',
  rules: [
    'Arrive on time - the Family waits for no one',
    'Keep your identity secret until the game begins',
    'No phones during the game - full immersion required',
    'Respect the Don\'s decisions - they are final'
  ]
}

// ============================================
// TYPES
// ============================================
interface Player {
  nickname: string
  timestamp: number
}

function App() {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState('')

  // Load players from localStorage on mount
  useEffect(() => {
    const storedPlayers = localStorage.getItem('mafia_players')
    const storedNickname = localStorage.getItem('mafia_current_player')

    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers))
    }

    if (storedNickname) {
      setCurrentPlayer(storedNickname)
      setHasJoined(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      setError('Nobody walks into this city without a name, capisce?')
      return
    }

    if (trimmedNickname.length < 2) {
      setError('Your alias is too short. The Family needs something memorable.')
      return
    }

    // Check if nickname already exists
    if (players.some(p => p.nickname.toLowerCase() === trimmedNickname.toLowerCase())) {
      setError('This name is already taken by another member of the Family.')
      return
    }

    // Add player to the list
    const newPlayer: Player = {
      nickname: trimmedNickname,
      timestamp: Date.now()
    }

    const updatedPlayers = [...players, newPlayer]

    // Save to localStorage
    localStorage.setItem('mafia_players', JSON.stringify(updatedPlayers))
    localStorage.setItem('mafia_current_player', trimmedNickname)

    setPlayers(updatedPlayers)
    setCurrentPlayer(trimmedNickname)
    setHasJoined(true)
    setError('')
  }

  const handleReset = () => {
    localStorage.removeItem('mafia_current_player')
    setCurrentPlayer('')
    setHasJoined(false)
    setNickname('')
  }

  const clearAllPlayers = () => {
    if (window.confirm('Are you sure you want to clear all players? This cannot be undone.')) {
      localStorage.removeItem('mafia_players')
      localStorage.removeItem('mafia_current_player')
      setPlayers([])
      setCurrentPlayer('')
      setHasJoined(false)
      setNickname('')
    }
  }

  return (
    <div className="app">
      <div className="noise-overlay"></div>

      {!hasJoined ? (
        <div className="container fade-in">
          <div className="stamp">CONFIDENTIAL</div>

          <h1 className="main-title">
            THE FAMILY
            <span className="subtitle">SUMMONS YOU</span>
          </h1>

          <div className="letter">
            <p className="intro-text">
              There are Mafias in the city, and shadows grow long in {EVENT_DETAILS.location}.
              The streets whisper of betrayal, and trust is a currency few can afford.
            </p>
            <p className="intro-text">
              You have been chosen. Not by chance, but by design.
              The Family needs sharp minds and cold nerves for what comes next.
            </p>
            <p className="intro-text emphasis">
              This is not a game. This is survival.
            </p>

            <div className="event-preview">
              <div className="detail-line">
                <span className="label">DATE:</span>
                <span className="value">{EVENT_DETAILS.date}</span>
              </div>
              <div className="detail-line">
                <span className="label">LOCATION:</span>
                <span className="value">{EVENT_DETAILS.location}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="join-form">
            <label htmlFor="nickname" className="form-label">
              ENTER YOUR ALIAS
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError('')
              }}
              className={`nickname-input ${error ? 'error' : ''}`}
              placeholder="Your street name..."
              maxLength={30}
              autoComplete="off"
            />
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button">
              JOIN THE FAMILY
            </button>
          </form>

          {players.length > 0 && (
            <div className="players-section">
              <h2 className="section-title">THE FAMILY ROSTER</h2>
              <div className="table-container">
                <table className="players-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ALIAS</th>
                      <th>RECRUITED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr key={player.timestamp}>
                        <td>{index + 1}</td>
                        <td className="nickname-cell">{player.nickname}</td>
                        <td>{new Date(player.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={clearAllPlayers} className="clear-button">
                Clear All Players
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="container fade-in">
          <div className="stamp accepted">ACCEPTED</div>

          <h1 className="main-title">
            WELCOME TO THE FAMILY
            <span className="subtitle-small">{currentPlayer}</span>
          </h1>

          <div className="letter welcome-letter">
            <p className="intro-text">
              The oath is sworn. The die is cast. You are now one of us.
            </p>
            <p className="intro-text">
              When the clock strikes the appointed hour, you will take your place at the table.
              Come prepared. Come alone. Come ready to prove your worth.
            </p>
          </div>

          <div className="event-details">
            <h2 className="section-title">OPERATIONAL DETAILS</h2>

            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-label">DATE & TIME</div>
                <div className="detail-value">{EVENT_DETAILS.date}</div>
                <div className="detail-value">{EVENT_DETAILS.time}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">LOCATION</div>
                <div className="detail-value">{EVENT_DETAILS.location}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">DRESS CODE</div>
                <div className="detail-value">{EVENT_DETAILS.dressCode}</div>
              </div>
            </div>

            <div className="rules-section">
              <h3 className="rules-title">THE CODE</h3>
              <ul className="rules-list">
                {EVENT_DETAILS.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          {players.length > 0 && (
            <div className="players-section">
              <h2 className="section-title">KNOWN ASSOCIATES ({players.length})</h2>
              <div className="table-container">
                <table className="players-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ALIAS</th>
                      <th>RECRUITED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr key={player.timestamp} className={player.nickname === currentPlayer ? 'current-player' : ''}>
                        <td>{index + 1}</td>
                        <td className="nickname-cell">{player.nickname}</td>
                        <td>{new Date(player.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button onClick={handleReset} className="back-button">
            Change Alias
          </button>
        </div>
      )}

      <footer className="footer">
        <p>Burn this message after reading</p>
      </footer>
    </div>
  )
}

export default App
