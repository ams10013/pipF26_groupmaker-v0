import { useEffect, useState } from 'react'
import Survey from './Survey.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [roster, setRoster] = useState(null)
  const [groups, setGroups] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [groupSize, setGroupSize] = useState(4)

  useEffect(() => {
    fetch('/api/roster')
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded ${res.status}`)
        return res.json()
      })
      .then(setRoster)
      .catch((err) => setError(err.message))
  }, [])

  async function randomize() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/groups/randomize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_size: groupSize }),
      })
      if (!res.ok) throw new Error(`Backend responded ${res.status}`)
      const data = await res.json()
      setGroups(data.groups)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <h1>GroupMaker</h1>
      <nav className="nav">
        <button type="button" className={page === 'home' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('home')}>
          Home
        </button>
        <button type="button" className={page === 'survey' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('survey')}>
          Survey
        </button>
      </nav>

      {page === 'survey' ? (
        <Survey />
      ) : (
        <Home
          roster={roster}
          groups={groups}
          error={error}
          loading={loading}
          groupSize={groupSize}
          setGroupSize={setGroupSize}
          randomize={randomize}
        />
      )}
    </main>
  )
}

function Home({ roster, groups, error, loading, groupSize, setGroupSize, randomize }) {
  if (error) {
    return (
      <p className="error">
        Could not reach the backend: {error}. Is <code>python app.py</code> running?
      </p>
    )
  }

  if (!roster) {
    return <p>Loading roster…</p>
  }

  return (
    <>
      <p className="subtitle">{roster.course}</p>

      <div className="controls">
        <label htmlFor="group-size">
          Group size
          <select
            id="group-size"
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value))}
            disabled={loading}
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <button className="randomize" onClick={randomize} disabled={loading}>
          {loading ? 'Randomizing…' : 'Randomize Groups'}
        </button>
      </div>

      {groups ? (
        <section className="groups">
          {groups.map((g) => (
            <div className="card" key={g.number}>
              <h2>Group {g.number}</h2>
              <ul>
                {g.members.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <section>
          <h2>Roster ({roster.students.length})</h2>
          <ul className="roster">
            {roster.students.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
