import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseQuery(table, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { filters = {}, select = '*', order = null, single = false, enabled = true } = options

  const fetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return }
    setLoading(true)
    let query = supabase.from(table).select(select)
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null) query = query.eq(key, val)
    })
    if (order) query = query.order(order.column, { ascending: order.ascending ?? true })
    if (single) query = query.single()

    const { data: result, error: err } = await query
    if (!err) setData(result || [])
    else setError(err)
    setLoading(false)
  }, [table, select, JSON.stringify(filters), JSON.stringify(order), single, enabled])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false)

  async function insert(payload) {
    setLoading(true)
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    setLoading(false)
    return { data, error }
  }

  async function update(id, payload) {
    setLoading(true)
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()
    setLoading(false)
    return { data, error }
  }

  async function remove(id) {
    setLoading(true)
    const { error } = await supabase.from(table).delete().eq('id', id)
    setLoading(false)
    return { error }
  }

  return { insert, update, remove, loading }
}
