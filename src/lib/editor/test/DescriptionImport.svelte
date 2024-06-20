<script lang="ts">
import { descriptionTypes, type PerkTypes } from '$lib/types'
import type { ChangeEventHandler } from 'svelte/elements'
import { descriptionImportStore } from './descriptionImport'
import type { Props } from '$lib/tiptap/node.svelte'
import STT_Component from '$lib/tiptap/STT_Component.svelte'
import dragHandleSVG from '$lib/assets/dragHandle.svg'
import loadingSpinner from '$lib/assets/loadingSpinner.svg'
import { triggerChangeEvent } from '$lib/utils'

let { attrs, selected }: Props = $props()

let descriptionType = $state<PerkTypes | 'none'>('none')
let loadingDescription = $state(false)

let description = $state('')

const perkChange: ChangeEventHandler<HTMLSelectElement> = async ({ currentTarget }) => {
  const spinnerDelay = setTimeout(() => {
    loadingDescription = true
  }, 500)
  const hash = currentTarget.value || '0'

  $attrs!.hash = parseInt(hash)

  description = await fetch(`/api/description?hash=${hash}`).then((res) => res.text())
  clearTimeout(spinnerDelay)
  loadingDescription = false
}
</script>

<STT_Component>
  <div class="top-bar" class:selected contenteditable="false">
    <div draggable="true" data-drag-handle>
      <img src={dragHandleSVG} alt="drag handle" class="drag-handle" />
    </div>
    <select bind:value={descriptionType} class="type-select">
      <option value="none">Select description type</option>

      {#each Object.entries(descriptionTypes) as [groupName, groupOptions]}
        <optgroup label={groupName}>
          {#each Object.entries(groupOptions) as [optionName, option]}
            <option value={optionName}>{option}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
    <select onchange={perkChange} use:triggerChangeEvent class="perk-select">
      {#await $descriptionImportStore}
        <option>Loading...</option>
      {:then perks}
        {#each perks.filter((perk) => perk.type === descriptionType) as perk}
          <option value={perk.hash}>{perk.name}</option>
        {/each}
      {/await}
    </select>
    {#if loadingDescription}
      <img src={loadingSpinner} alt="loading spinner" />
    {/if}
  </div>
  <div class="description" contenteditable="false">
    {@html description}
  </div>
</STT_Component>

<style lang="scss">
img {
  width: 1rem;
  height: 1rem;
}

.top-bar {
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  .type-select {
    min-width: 10rem;
  }
  .perk-select {
    min-width: 16rem;
  }
}

.drag-handle {
  cursor: grab;
}
.description {
  background-color: hsla(0, 0%, 100%, 0.1);
  padding: 0.2rem;
}

.selected {
  border: 1px solid hsl(0, 100%, 47%);
}
</style>
