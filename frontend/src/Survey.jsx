import { useEffect, useState } from 'react'

const SCHOOL_YEARS = ['First-year', 'Sophomore', 'Junior', 'Senior', 'Other']

export default function Survey() {
  const [roster, setRoster] = useState(null)
  const [name, setName] = useState('')
  const [schoolYear, setSchoolYear] = useState('')
  const [interests, setInterests] = useState('')
  const [missing, setMissing] = useState([])
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/roster')
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded ${res.status}`)
        return res.json()
      })
      .then(setRoster)
      .catch((err) => setError(err.message))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const missingFields = []
    if (!name) missingFields.push('Name')
    if (!schoolYear) missingFields.push('What year are you?')
    if (missingFields.length) {
      setMissing(missingFields)
      setError(null)
      return
    }

    setMissing([])
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          school_year: schoolYear,
          interests,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Backend responded ${res.status}`)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="confirm">
        <p>Thanks — your survey was saved.</p>
        <button type="button" className="randomize" onClick={() => setSubmitted(false)}>
          Submit another response
        </button>
      </div>
    )
  }

  if (!roster && !error) {
    return <p>Loading survey…</p>
  }

  return (
    <form className="survey-form" onSubmit={handleSubmit}>
      <p className="subtitle">All fields are required except interests.</p>

      {missing.length > 0 && (
        <p className="error">
          Please fill in: {missing.join(', ')}
        </p>
      )}

      {error && (
        <p className="error">Could not save the survey: {error}</p>
      )}

      <label htmlFor="survey-name">
        Name
        <select
          id="survey-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading || !roster}
        >
          <option value="">Select your name</option>
          {roster?.students.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="survey-year">
        What year are you?
        <select
          id="survey-year"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a year</option>
          {SCHOOL_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="survey-interests">
        What are your interests (optional)
        <textarea
          id="survey-interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </label>

      <button className="randomize" type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
