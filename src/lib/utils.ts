type CapitalizeFirstLetter<S extends string> = S extends `${infer FirstLetter}${infer Rest}`
  ? `${Uppercase<FirstLetter>}${Rest}`
  : S

export function capitalizeFirstLetter<T extends string>(string: T): CapitalizeFirstLetter<T> {
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
