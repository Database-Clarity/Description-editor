class HF {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param array array of values
   * @param searchElement — The element to search for.
   * @param fromIndex — The position in this array at which to begin searching for searchElement.
   * @returns boolean
   */
  includes<T>(array: readonly T[], searchElement: T, fromIndex: number | undefined = undefined): boolean {
    return array.includes(searchElement, fromIndex)
  }
}
export const Hf = new HF()