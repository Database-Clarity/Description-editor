<script lang="ts">
import { descriptionTypes, type PerkTypes } from '$lib/types'
import type { ChangeEventHandler } from 'svelte/elements'
import { get, type Writable } from 'svelte/store'
import { descriptionImportStore } from './descriptionImport'
import type { Editor } from '@tiptap/core'
import type { Props } from '$lib/tiptap/node.svelte'
import STT_Component from '$lib/tiptap/STT_Component.svelte'
import STT_Editable from '$lib/tiptap/STT_Editable.svelte'

let { editor, attrs, node, getPos }: Props = $props()

let descriptionType = $state<PerkTypes | 'none'>('none')

const perkChange: ChangeEventHandler<HTMLSelectElement> = async ({ currentTarget }) => {
  $attrs!.hash = parseInt(currentTarget.value)

  const description = await fetch(`/api/description?hash=${currentTarget.value}`).then((res) => res.text())
  const pos = { from: getPos() + 1, to: node.content.size + getPos() + 1 }

  editor.chain().deleteRange(pos).insertContentAt(pos, description).focus().run()
}
</script>

<STT_Component data-drag-handle="">
  <div class="topBar">
    <div class="drag-handle" contenteditable="false" draggable="true" data-drag-handle></div>
    <select bind:value={descriptionType}>
      <option value="none">Select description type</option>

      {#each Object.entries(descriptionTypes) as [groupName, groupOptions]}
        <optgroup label={groupName}>
          {#each Object.entries(groupOptions) as [optionName, option]}
            <option value={optionName}>{option}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
    <select onchange={perkChange}>
      {#await $descriptionImportStore}
        <option>Loading...</option>
      {:then perks}
        {#each perks.filter((perk) => perk.type === descriptionType) as perk}
          <option value={perk.hash}>{perk.name}</option>
        {/each}
      {/await}
    </select>
  </div>
  <div contenteditable="false">
    <STT_Editable />
  </div>
</STT_Component>

<style>
.topBar {
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
}

.drag-handle {
  flex: 0 0 auto;
  position: relative;
  width: 1rem;
  height: 1rem;
  top: 0.3rem;
  margin-right: 0.5rem;
  cursor: grab;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="1" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
</style>
