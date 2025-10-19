type CapitalizeFirstLetter<S extends string> = S extends `${infer FirstLetter}${infer Rest}`
  ? `${Uppercase<FirstLetter>}${Rest}`
  : S

export function toNormalText<T extends string>(string: T): CapitalizeFirstLetter<T> {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as CapitalizeFirstLetter<T>
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export class TypedObject {
  static entries<T extends object>(obj: T) {
    return Object.entries(obj) as Entries<T>
  }
  static keys<T extends object>(obj: T) {
    return Object.keys(obj) as (keyof T)[]
  }
  static fromEntries<T extends Array<readonly [string, unknown]>>(entries: T) {
    return Object.fromEntries(entries) as Record<T[number][0], T[number][1]>
  }
}

/**
 * Extracts the return type of a function overload
 * @param T - The function to extract the return type from
 * @param ARGS_T - The type of the arguments of the function
 * @example
 * OverloadedReturnType<typeof fn, [arg1, { arg2: true }]>
 * // => return type of function(arg1, { arg2: true })
 */
export type OverloadedReturnType<T extends (...args: any[]) => any, ARGS_T> =
  Extract<
      T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; } ? [A1, R1] | [A2, R2] | [A3, R3] | [A4, R4] :
      T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; } ? [A1, R1] | [A2, R2] | [A3, R3] :
      T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; } ? [A1, R1] | [A2, R2] :
      T extends { (...args: infer A1): infer R1; } ? [A1, R1] :
      never,
      [ARGS_T, any]
  >[1]

/**
 * Trigger a change event when options are added or changed in a select element.
 */
export function triggerChangeEvent(node: HTMLSelectElement): { destroy: () => void } {
  const observer = new MutationObserver(() => {
    node.dispatchEvent(new Event('change', { bubbles: true }))
  })
  observer.observe(node, {
    childList: true,
  })
  return {
    destroy() {
      observer.disconnect()
    },
  }
}

/**
 * Trim empty div elements from the end and beginning of the HTML string.
 */
export function trimEmptyDivElements(html: string) {
  return html
    .replace(/(<div>\s*<\/div>)+$/, '')
    .replace(/^(<div>\s*<\/div>)+/, '')
    .trim()
}

export function cookiesFromString(cookieString: string, cookieNames: string[]) {
  const cookies = cookieString.split(';').map((cookie) => cookie.split('='))

  const cookieMap = new Map<string, string>()

  for (const [key, value] of cookies) {
    if (!key || !value) continue
    cookieMap.set(key.trim(), value.trim())
  }
  // return object with cookies
  return cookieNames.reduce(
    (acc, key) => {
      acc[key] = cookieMap.get(key)!
      return acc
    },
    {} as Record<string, string>
  )
}
