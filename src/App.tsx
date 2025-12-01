import { useState, useEffect } from 'react'
import { database } from './firebase'
import { ref, onValue, push, set, remove } from 'firebase/database'

// ============================================
// CUSTOMIZABLE EVENT DETAILS - EDIT THESE
// ============================================
const EVENT_DETAILS = {
  date: '10.12.2025',
  location: "Filip Micevski's Town",
  time: '20:00',
  dressCode: 'Casual',
  rules: [
    'Arrive on time - the Family waits for no one',
    'Keep your identity secret until the game begins',
    'No phones during the game - full immersion required',
    'Respect the Don\'s decisions - they are final'
  ]
}

// Secret speakeasy password - any 6 digit number (their index)
const isValidPassword = (pass: string) => /^\d{6}$/.test(pass)

// ============================================
// TYPES
// ============================================
interface Player {
  id?: string
  nickname: string
  timestamp: number
}

function App() {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState('')
  const [showWantedPoster, setShowWantedPoster] = useState(false)
  const [konamiCode, setKonamiCode] = useState<string[]>([])
  const [godMode, setGodMode] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [hasPassword, setHasPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isBurning, setIsBurning] = useState(false)

  // Load players from Firebase and set up real-time listener
  useEffect(() => {
    // Check localStorage for current player and password (still stored locally)
    const storedNickname = localStorage.getItem('mafia_current_player')
    const storedPassword = localStorage.getItem('mafia_password_entered')

    if (storedNickname) {
      setCurrentPlayer(storedNickname)
      setHasJoined(true)
    }

    if (storedPassword) {
      setHasPassword(true)
    } else {
      // Show password screen on first visit
      setShowPassword(true)
    }

    // Set up real-time listener for players from Firebase
    const playersRef = ref(database, 'players')
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert Firebase object to array and sort by timestamp
        const playersArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          nickname: value.nickname,
          timestamp: value.timestamp
        }))
        playersArray.sort((a, b) => a.timestamp - b.timestamp)
        setPlayers(playersArray)
      } else {
        setPlayers([])
      }
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [])

  // Countdown timer
  useEffect(() => {
    // Parse date from DD.MM.YYYY format to YYYY-MM-DD
    const dateParts = EVENT_DETAILS.date.split('.')
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${EVENT_DETAILS.time}:00`
    const targetDate = new Date(formattedDate)

    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Konami code Easter egg (↑ ↑ ↓ ↓ ← → ← → B A)
  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

    const handleKeyDown = (e: KeyboardEvent) => {
      const newCode = [...konamiCode, e.key].slice(-10)
      setKonamiCode(newCode)

      if (newCode.join(',') === konamiSequence.join(',')) {
        setGodMode(true)
        alert('🔫 GOD MODE ACTIVATED - The Don sees all 🔫')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiCode])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidPassword(password)) {
      localStorage.setItem('mafia_password_entered', 'true')
      setHasPassword(true)
      setShowPassword(false)
    } else {
      alert('Wrong password. Enter your 6-digit index number.')
      setPassword('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Add player to Firebase
    const newPlayer = {
      nickname: trimmedNickname,
      timestamp: Date.now()
    }

    try {
      const playersRef = ref(database, 'players')
      const newPlayerRef = push(playersRef)
      await set(newPlayerRef, newPlayer)

      // Save current player to localStorage (local only)
      localStorage.setItem('mafia_current_player', trimmedNickname)

      setCurrentPlayer(trimmedNickname)
      setHasJoined(true)
      setError('')
    } catch (error) {
      console.error('Error adding player:', error)
      setError('Failed to join. Please try again.')
    }
  }

  const handleReset = () => {
    localStorage.removeItem('mafia_current_player')
    setCurrentPlayer('')
    setHasJoined(false)
    setNickname('')
  }

  const clearAllPlayers = async () => {
    if (window.confirm('Are you sure you want to clear all players? This cannot be undone.')) {
      try {
        const playersRef = ref(database, 'players')
        await remove(playersRef)

        localStorage.removeItem('mafia_current_player')
        setCurrentPlayer('')
        setHasJoined(false)
        setNickname('')
      } catch (error) {
        console.error('Error clearing players:', error)
        alert('Failed to clear players. Please try again.')
      }
    }
  }

  const handleBurnMessage = () => {
    if (window.confirm('Are you sure you want to burn this message? All evidence will be destroyed.')) {
      setIsBurning(true)

      // After burn animation completes, clear everything
      setTimeout(() => {
        localStorage.clear()
        window.location.reload()
      }, 3000) // 3 second burn animation
    }
  }

  // Generate rain drops
  const rainDrops = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${0.5 + Math.random() * 0.5}s`,
    animationDelay: `${Math.random() * 2}s`
  }))

  // Generate film burns
  const filmBurns = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${30 + Math.random() * 50}px`,
    height: `${30 + Math.random() * 50}px`
  }))

  // Generate scratches
  const scratches = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    height: `${100 + Math.random() * 200}px`,
    animationDuration: `${3 + Math.random() * 5}s`,
    animationDelay: `${Math.random() * 5}s`
  }))

  // Password screen
  if (showPassword && !hasPassword) {
    return (
      <div className="app">
        <div className="noise-overlay"></div>
        <div className="lightning"></div>
        <div className="scanlines"></div>

        <div className="container fade-in">
          <h1 className="main-title">
            SPEAK THE PASSWORD
            <span className="subtitle">Entry to the Speakeasy</span>
          </h1>

          <div className="letter">
            <p className="intro-text">
              This establishment is for members only.
              If you know the code, speak it now.
            </p>
            <p className="intro-text emphasis">
              Hint: Your Index
            </p>

            <form onSubmit={handlePasswordSubmit} className="join-form">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nickname-input"
                placeholder="Enter your 6-digit index..."
                autoComplete="off"
                maxLength={6}
              />
              <button type="submit" className="submit-button">
                ENTER
              </button>
            </form>
          </div>
        </div>

        <footer className="footer">
          <button onClick={handleBurnMessage} className="burn-button">
            🔥 Burn this message after reading 🔥
          </button>
        </footer>

        {/* Burn Effect Overlay */}
        {isBurning && (
          <div className="burn-overlay">
            <div className="flames">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="flame" style={{
                  left: `${i * 5}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }} />
              ))}
            </div>
            <div className="burn-message">MESSAGE DESTROYED</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      {/* Background effects */}
      <div className="noise-overlay"></div>
      <div className="lightning"></div>
      <div className="scanlines"></div>

      {/* Rain */}
      <div className="rain">
        {rainDrops.map(drop => (
          <div
            key={drop.id}
            className="rain-drop"
            style={{
              left: drop.left,
              animationDuration: drop.animationDuration,
              animationDelay: drop.animationDelay
            }}
          />
        ))}
      </div>

      {/* Film burns and scratches */}
      <div className="film-burns">
        {filmBurns.map(burn => (
          <div
            key={burn.id}
            className="burn"
            style={{
              left: burn.left,
              top: burn.top,
              width: burn.width,
              height: burn.height
            }}
          />
        ))}
        {scratches.map(scratch => (
          <div
            key={scratch.id}
            className="scratch"
            style={{
              left: scratch.left,
              height: scratch.height,
              animationDuration: scratch.animationDuration,
              animationDelay: scratch.animationDelay
            }}
          />
        ))}
      </div>

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

          {/* Countdown Timer */}
          <div className="countdown">
            <div className="countdown-title">TIME UNTIL THE GATHERING</div>
            <div className="countdown-timer">
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.days}</div>
                <div className="countdown-label">Days</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.hours}</div>
                <div className="countdown-label">Hours</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.minutes}</div>
                <div className="countdown-label">Minutes</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.seconds}</div>
                <div className="countdown-label">Seconds</div>
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
                      <tr key={player.id || player.timestamp}>
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

          {/* Wanted Poster */}
          {!showWantedPoster && (
            <button
              onClick={() => setShowWantedPoster(true)}
              className="submit-button"
              style={{ marginTop: '2rem' }}
            >
              GENERATE YOUR WANTED POSTER
            </button>
          )}

          {showWantedPoster && (
            <div className="wanted-poster">
              <div className="wanted-title">WANTED</div>
              <div className="wanted-alias">{currentPlayer}</div>
              <div className="wanted-details">
                <p>ARMED AND EXTREMELY DANGEROUS</p>
                <p>Last seen: {EVENT_DETAILS.location}</p>
                <p>Wanted for: Conspiracy, Racketeering, Looking Too Sharp</p>
                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>REWARD: $10,000</p>
              </div>
            </div>
          )}

          {/* Countdown Timer */}
          <div className="countdown">
            <div className="countdown-title">TIME UNTIL THE GATHERING</div>
            <div className="countdown-timer">
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.days}</div>
                <div className="countdown-label">Days</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.hours}</div>
                <div className="countdown-label">Hours</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.minutes}</div>
                <div className="countdown-label">Minutes</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-value">{countdown.seconds}</div>
                <div className="countdown-label">Seconds</div>
              </div>
            </div>
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
                      {godMode && <th>SECRET ROLE</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr key={player.id || player.timestamp} className={player.nickname === currentPlayer ? 'current-player' : ''}>
                        <td>{index + 1}</td>
                        <td className="nickname-cell">{player.nickname}</td>
                        <td>{new Date(player.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                        {godMode && (
                          <td style={{ color: index % 3 === 0 ? '#dc143c' : '#d4af37' }}>
                            {index % 3 === 0 ? '🔫 MAFIA' : '👤 CITIZEN'}
                          </td>
                        )}
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
        <button onClick={handleBurnMessage} className="burn-button">
          🔥 Burn this message after reading 🔥
        </button>
        {godMode && <p style={{ color: '#d4af37', marginTop: '0.5rem' }}>🔫 GOD MODE ACTIVE 🔫</p>}
      </footer>

      {/* Burn Effect Overlay */}
      {isBurning && (
        <div className="burn-overlay">
          <div className="flames">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="flame" style={{
                left: `${i * 5}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }} />
            ))}
          </div>
          <div className="burn-message">MESSAGE DESTROYED</div>
        </div>
      )}
    </div>
  )
}

export default App
