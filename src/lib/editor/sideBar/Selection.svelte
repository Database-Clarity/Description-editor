<script lang="ts">
import { goto } from '$app/navigation'
import { languageCodes, languageNames } from '$lib/types'
import type { LanguageCode, PendingQuery, Perk, PerkTypes } from '$lib/types'
import type { Editor } from '@tiptap/core'
import type { RowList } from 'postgres'
import type { ChangeEventHandler } from 'svelte/elements'
import type { Writable } from 'svelte/store'

let {
  perksPromise,
  lang,
  editor,
  hash,
}: {
  perksPromise: PendingQuery<Perk[]>
  lang: LanguageCode
  editor: Writable<Editor | undefined>
  hash: number
} = $props()

const descriptionTypes: { [key: string]: { [key in PerkTypes]?: string } } = {
  Exotics: {
    'Armor Trait Exotic': 'Armor',
    'Weapon Frame Exotic': 'Weapon',
  },
  Weapon: {
    'Weapon Trait': 'Trait',
    // 'Weapon Trait Enhanced': 'Enhanced Trait', // removed from database
    'Weapon Perk': 'Perk',
    'Weapon Trait Origin': 'Origin Trait',
    'Weapon Frame': 'Frame',
    'Weapon Frame Enhanced': 'Enhanced Frame', // probably will remove this too
  },
  'Abilities / Subclass stuff': {
    'Subclass Fragment': 'Fragment',
    'Subclass Aspect': 'Aspect',
    'Subclass Super': 'Super',
    'Subclass Grenade': 'Grenade',
    'Subclass Melee': 'Melee',
    'Subclass Class': 'Class',
    'Subclass Movement': 'Movement',
  },
  Mods: {
    'Armor Mod General': 'Armor General',
    'Armor Mod Activity': 'Armor Activity',
    'Armor Mod Seasonal': 'Armor Seasonal',
    'Weapon Mod': 'Weapon',
    'Ghost Mod': 'Ghost',
  },
}

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
      {#each perks.filter((perk) => perk.type === descriptionType) as perk}
        <option value={perk.hash}>{perk.name}</option>
      {/each}
    {/await}
  </select>

  <!-- <select bind:value={sidebarStore.language}>
  {#each languageCodes as language}
    <option value={language}>{languageNames[language]}</option>
  {/each}
</select> -->
</div>

<style lang="scss">
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
