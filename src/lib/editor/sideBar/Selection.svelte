<script lang="ts">
import { goto } from '$app/navigation'
import type { Perk } from '$lib/server/queries'
import { descriptionTypes, languageCodes, languageNames } from '$lib/types'
import type { LanguageCode, PendingQuery, PerkTypes } from '$lib/types'
import type { RowList } from 'postgres'
import type { ChangeEventHandler } from 'svelte/elements'
// import type { Writable } from 'svelte/store'

let {
  perksPromise,
  lang,
  // editor,
  hash,
}: {
  perksPromise: PendingQuery<Perk[]>
  /**
   * Language code
   */
  lang: LanguageCode
  // editor: Writable<Editor | undefined>
  hash: number
} = $props()

// I have no clue how perk selection works but as long as it works, I don't care
let descriptionType = $state<PerkTypes | 'none'>('none')
let perks = $state<RowList<Perk[]>>()

const perkChange: ChangeEventHandler<HTMLSelectElement> = ({ currentTarget }) => {
  goto(`/descriptionEditor/${currentTarget.value}/`)
}

const typeChange: ChangeEventHandler<HTMLSelectElement> = () => {
  if (descriptionType === 'none') return
  const perk = perks?.filter((perk) => perk.type === descriptionType)[0]
  if (perk === undefined) return
  goto(`/descriptionEditor/${perk.hash}/`)
}

perksPromise.then((perksList) => {
  perks = perksList
  const perk = perksList?.filter((perk) => perk.hash === hash)[0]
  descriptionType = perk?.type || 'none'
})
</script>

{#snippet perkNames(perks: RowList<Perk[]>)}
  {#each perks.filter((perk) => perk.type === descriptionType) as perk}
    {#if perk.type === 'Armor Trait Exotic'}
      {#if perk.itemName === 'Aeon Soul'}
        <option value={perk.hash}>{perk.itemName + '-' + perk.name}</option>
      {:else}
        <option value={perk.hash}>{perk.itemName}</option>
      {/if}
    {:else}
      <option value={perk.hash}>{perk.name}</option>
    {/if}
  {/each}
{/snippet}

<div class="selection">
  <select bind:value={descriptionType} onchange={typeChange}>
    <option value="none">Select description type</option>

    {#each Object.entries(descriptionTypes) as [groupName, groupOptions]}
      <optgroup label={groupName}>
        {#each Object.entries(groupOptions) as [optionName, option]}
          <option value={optionName}>{option}</option>
        {/each}
      </optgroup>
    {/each}
  </select>

  <select value={hash} onchange={perkChange}>
    {#await perksPromise}
      <option>Loading...</option>
    {:then perks}
      {@render perkNames(perks)}
    {/await}
  </select>
</div>

<style>
.selection {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;

  select {
    width: 100%;
    margin-right: 1rem;
  }
}
</style>
