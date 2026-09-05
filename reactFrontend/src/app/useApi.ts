import { useEffect, useState } from 'react'
import { drugApi } from '../api/services'
import { DRUGS, type Drug } from './data'

export type Source = 'live' | 'sample' | 'loading'

/** Loads drugs from the Spring API, falling back to bundled sample data when it's unreachable. */
export function useDrugs(): { drugs: Drug[]; source: Source } {
  const [drugs, setDrugs] = useState<Drug[]>(DRUGS)
  const [source, setSource] = useState<Source>('loading')

  useEffect(() => {
    let alive = true
    drugApi.list()
      .then((rows) => {
        if (!alive) return
        setDrugs(rows.map((d) => ({
          id: d.id,
          name: d.brandName || d.genericName,
          generic: d.genericName,
          drugClass: d.categoryName || d.dosageForm || '—',
        })))
        setSource('live')
      })
      .catch(() => { if (alive) setSource('sample') })
    return () => { alive = false }
  }, [])

  return { drugs, source }
}
