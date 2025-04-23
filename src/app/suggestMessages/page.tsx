'use client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [output, setOutput] = useState('Loading...')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/suggest-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          const error = await res.json()
          console.error('API returned error:', error)
          setOutput('An error occurred while fetching suggestions.')
          return
        }

        const reader = res.body?.getReader()
        const decoder = new TextDecoder('utf-8')
        let result = ''

        while (true) {
          const { done, value } = await reader!.read()
          if (done) break
          result += decoder.decode(value, { stream: true })
        }

        setOutput(result)
      } catch (err) {
        console.error('Unexpected error:', err)
        setOutput('An unexpected error occurred.')
      }
    }

    fetchData()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Suggested Questions</h1>
      <p>{output}</p>
    </main>
  )
}
