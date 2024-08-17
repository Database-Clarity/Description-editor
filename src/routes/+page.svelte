<script lang="ts">
import { pushState } from '$app/navigation'
import { page } from '$app/stores'
import { onMount } from 'svelte'
import { writable, type Writable } from 'svelte/store'

/**
 * Creates store linked with url parameters
 * @param defaultState Default url state array or object
 * @param paramName Name of url parameter
 */
function urlState<T extends Record<any, any>>(defaultState: T, paramName: string): Writable<T> {
  let store = writable(defaultState)
  let allowPushState = false

  const uniqueName = 'c$BgRXQj87' // Symbol(paramName) // If I use Symbol it will trow error
  onMount(() => {
    const params = $page.url.searchParams

    if (params.has(paramName)) {
      try {
        store.set(JSON.parse(params.get(paramName)!))
      } catch {
        console.error('Bad url parameters')
      }
    }

    allowPushState = true
  })

  page.subscribe(({ state }) => {
    const pageState = $state.snapshot(state) as T

    if (Object.keys(pageState).length === 0) return
    if (pageState[paramName]?.[uniqueName] !== paramName) return

    delete pageState[paramName][uniqueName]
    store.set(pageState[paramName])
  })

  store.subscribe((storeState) => {
    const pageState = $state.snapshot($page.state) as T

    if (JSON.stringify({ ...storeState, [uniqueName]: paramName }) === JSON.stringify(pageState[paramName])) return

    if (allowPushState) {
      $page.url.searchParams.set(paramName, JSON.stringify(storeState))
      const newState = { ...pageState, [paramName]: { ...storeState, [uniqueName]: paramName } }

      pushState(decodeURIComponent($page.url.search), newState)
    }
  })

  return store
}

let urlState_1 = urlState({ test: 0 }, '..')
let urlState_2 = urlState({ test: 123 }, 'state_two')

const testFn_1 = () => {
  $urlState_1.test++
}

const testFn_2 = () => {
  $urlState_2.test++
}

// compression // https://gist.github.com/loilo/92220c23567d6ed085a28f2c3e84e311
function replacer(key: any, value: any) {
  if (value instanceof Map) {
    return {
      '.M.': Array.from(value.entries()),
    }
  }
  if (value instanceof Set) {
    return {
      '.S.': Array.from(value),
    }
  }
  if (typeof value === 'bigint') {
    return {
      '.B.': value.toString(),
    }
  }
  if (value === undefined) {
    return {
      '...': 'U',
    }
  }
  if (Number.isNaN(value)) {
    return {
      '...': 'N',
    }
  }
  if (Number.NEGATIVE_INFINITY === value) {
    return {
      '...': '+I',
    }
  }
  if (Number.NEGATIVE_INFINITY === value) {
    return {
      '...': '-I',
    }
  }
  if (typeof value === 'function') {
    console.error(
      `URL state doesn't support function/classes and all function/classes will be discarded\n\nKey: ${key}\n${value}`
    )
    return
  }
  if (typeof value === 'symbol') {
    console.error(`URL state doesn't support symbols and all symbols will be discarded\n\n${key}: ${value.toString()}`)
    return
  }
  if (typeof key === 'symbol') {
    console.error(`URL state doesn't support symbols and all symbols will be discarded\n\n${key.toString()}: ${value}`)
    return
  }
  return value
}

JSON.stringify({ something: NaN, test: 123 }, replacer)
</script>

<h1>Welcome to Clarity description editor</h1>

<button onclick={testFn_1}>test_1</button>
<button onclick={testFn_2}>test_2</button>

<div>one {JSON.stringify($urlState_1)}</div>
<div>two {JSON.stringify($urlState_2)}</div>
