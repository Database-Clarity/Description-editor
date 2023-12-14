<script lang="ts">
  import { sidebarStore } from '$lib/sideBar/sidebarStore'
  import { languageCodes, languageNames } from '$lib/types'
  import type { LanguageCode, Perk, PerkTypes } from '$lib/types'
  import { derived } from 'svelte/store'

  export let perks: {
    [k: string]: Perk
  }

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

  const perksArray = Object.values(perks)

  // derived stores allow to listen to changes of individual properties instead of the whole* store // btw derived stores are read-only
  const derivedType = derived(sidebarStore, ($sidebarStore) => $sidebarStore.type)
  const derivedItemHash = derived(sidebarStore, ($sidebarStore) => $sidebarStore.itemHash)
  const derivedLanguage = derived(sidebarStore, ($sidebarStore) => $sidebarStore.language)

  const getPerkSelection = (type: PerkTypes | 'none', language: LanguageCode) => {
    const perks = perksArray
      .filter((perk) => perk.type === type)
      .sort((a, b) => a.name[language].localeCompare(b.name[language]))

    if (type === 'none') return perks
    if (perks.findIndex((perk) => perk.hash === $sidebarStore.hash) !== -1) return perks

    if (type === 'Weapon Frame Exotic') {
      $sidebarStore.itemHash = perks[0].itemHash
    } else {
      $sidebarStore.hash = perks[0].hash
      $sidebarStore.itemHash = null
    }

    return perks
  }
  $: perkSelection = getPerkSelection($derivedType, $derivedLanguage)

  const getExoticPerkSelection = (type: PerkTypes | 'none', language: LanguageCode, itemHash: number | null) => {
    if (type !== 'Weapon Frame Exotic') return null
    const perks = perksArray
      .filter((perk) => perk.itemHash === itemHash)
      .sort((a, b) => a.itemName[language].localeCompare(b.itemName[language]))

    if (perks.findIndex((perk) => perk.hash === $sidebarStore.hash) !== -1) return perks

    $sidebarStore.hash = perks[0].hash

    return perks
  }
  $: exoticPerkSelection = getExoticPerkSelection($derivedType, $derivedLanguage, $derivedItemHash)
</script>

<div class="sidebar">
  <select bind:value={$sidebarStore.type}>
    <option value="none">Select description type</option>

    {#each Object.entries(descriptionTypes) as [groupName, groupOptions]}
      <optgroup label={groupName}>
        {#each Object.entries(groupOptions) as [optionName, option]}
          <option value={optionName}>{option}</option>
        {/each}
      </optgroup>
    {/each}
  </select>

  {#if exoticPerkSelection !== null}
    <select bind:value={$sidebarStore.itemHash}>
      {#each perkSelection as perk}
        <option value={perk.itemHash}>{perk.itemName[$sidebarStore.language]}</option>
      {/each}
    </select>

    <select bind:value={$sidebarStore.hash}>
      {#each exoticPerkSelection as perk}
        <option value={perk.hash}>{perk.name[$sidebarStore.language]}</option>
      {/each}
    </select>
  {:else}
    <select bind:value={$sidebarStore.hash}>
      {#each perkSelection as perk}
        <option value={perk.hash}>{perk.name[$sidebarStore.language]}</option>
      {/each}
    </select>
  {/if}

  <select bind:value={$sidebarStore.language}>
    {#each languageCodes as language}
      <option value={language}>{languageNames[language]}</option>
    {/each}
  </select>
</div>
