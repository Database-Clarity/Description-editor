<script lang="ts">
import { goto } from '$app/navigation'
import { descriptionTypes, type PerkTypes } from '$lib/types'
import type { PendingQuery, RowList } from 'postgres'
import Selection from './Selection.svelte'
import type { Perk } from '$lib/server/queries'
import type { ChangeEventHandler } from 'svelte/elements'

let {
  perksPromise,
}: {
  perksPromise: PendingQuery<Perk[]>
} = $props()

let modal = $state<HTMLDialogElement>()
let modalContent = $state<HTMLDivElement>()
let search = $state<string>('')

const clickOutside = (e: MouseEvent) => {
  if (modalContent && !modalContent.contains(e.target as Node)) modal?.close()
}

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

let showGroupsOptions = $state<Record<string, boolean>>({
  'Exotics': false,
  'Weapon': false,
  'Abilities / Subclass stuff': false,
  'Mods': false,
})
</script>

<div class="modalContent">
  <input type="search" placeholder="Search" bind:value={search} />

  <ul>
    {#each Object.entries(descriptionTypes) as [groupName, groupOptions]}
      <li>
        <button onclick={() => (showGroupsOptions[groupName] = !showGroupsOptions[groupName])}>
          {groupName}
        </button>
        {#if showGroupsOptions[groupName]}
          <ul class="groupOptions">
            {#each Object.entries(groupOptions) as [optionName, option]}
              <li>
                <button onclick={() => ((descriptionType as any) = optionName)}>{option}</button>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>

  <ul class="perkList">
    {#await perksPromise}
      <li>Loading...</li>
    {:then perks}
      {#each perks.filter((perk) => (perk.type === descriptionType || search.length > 0) && perk.name
            .toLowerCase()
            .includes(search.toLowerCase())) as perk}
        <li>
          <button onclick={() => goto(`/descriptionEditor/${perk.hash}/`)}>{perk.name}</button>
        </li>
      {/each}
    {/await}
  </ul>
</div>

<style>
.modalContent {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 91vh;
  margin: 0.3rem;
}
.groupOptions {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
}

.perkList {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}
</style>
