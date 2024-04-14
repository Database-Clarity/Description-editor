<script lang="ts">
  import { pushState } from '$app/navigation'
  import { sidebarStore } from '$lib/sideBar/sidebarStore.svelte'
  import { languageCodes, languageNames } from '$lib/types'
  import type { LanguageCode, PerkTypes } from '$lib/types'
  import type { PendingQuery, Perk } from '../../routes/descriptionEditor/[hash]/+page.server'

  let {
    perksPromise,
    lang,
  }: {
    perksPromise: PendingQuery<Perk[]>
    lang: LanguageCode
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

  // $effect(() => {
  //   const url = new URL(window.location.href)
  //   url.searchParams.set('hash', sidebarStore.hash.toString())
  //   pushState('', '')
  // })
  // $effect(() => {
  //   const url = new URL(window.location.href)
  //   url.searchParams.set('type', sidebarStore.type)
  //   history.pushState({}, '', url)
  // })
  // $effect(() => {
  //   const url = new URL(window.location.href)
  //   url.searchParams.set('lang', sidebarStore.language)
  //   history.pushState({}, '', url)
  // })

  // perksPromise.then((perks) => {
  //   const perk = perks.find((perk) => perk.hash === hash)

  //   console.log(perk?.type)

  //   sidebarStore.hash = perk?.hash ?? 0
  //   sidebarStore.type = perk?.type ?? 'none'
  //   sidebarStore.language = lang
  // })
</script>

<select bind:value={sidebarStore.type}>
  <option value="none">Select description type</option>

  {#each Object.entries(descriptionTypes) as [groupName, groupOptions]}
    <optgroup label={groupName}>
      {#each Object.entries(groupOptions) as [optionName, option]}
        <option value={optionName}>{option}</option>
      {/each}
    </optgroup>
  {/each}
</select>

<select bind:value={sidebarStore.hash}>
  {#await perksPromise then perks}
    {#each perks.filter((perk) => perk.type === sidebarStore.type) as perk}
      <option value={perk.hash}>{perk.name}</option>
    {/each}
  {/await}
</select>

<select bind:value={sidebarStore.language}>
  {#each languageCodes as language}
    <option value={language}>{languageNames[language]}</option>
  {/each}
</select>

<style lang="scss">
  select {
    width: 100%;
    margin-bottom: 1rem;
  }
</style>
