<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core'
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap'

  export let node: NodeViewProps['node']
  export let updateAttributes: NodeViewProps['updateAttributes']
  export let selected: NodeViewProps['selected'] = false

  const handleClick = () => {
    updateAttributes({ hash: node.attrs.hash + 1 })
  }

  const placeholderContent: any = {
    armor: {
      1: 'Abeyant Leap',
      2: 'ACD/0 Feedback Fence',
      3: 'Auto-Loading Link',
    },
    weapon: {
      1: 'Abeyant Leap',
      2: 'ACD/0 Feedback Fence',
      3: 'Auto-Loading Link',
    },
    mod: {
      1: 'Abeyant Leap',
      2: 'ACD/0 Feedback Fence',
      3: 'Auto-Loading Link',
    },
  }

  let selectedType = 'armor'
  let selectedName = '1'

  // TODO: add a button to delete the import
</script>

<NodeViewWrapper>
  <div class="descriptionImport" class:selected contenteditable="false">
    <select bind:value={selectedType}>
      <option value="armor">Armor</option>
      <option value="weapon">Weapon</option>
      <option value="mod">Mod</option>
    </select>
    <select bind:value={selectedName}>
      <option value="1">Abeyant Leap</option>
      <option value="2">ACD/0 Feedback Fence</option>
      <option value="3">Auto-Loading Link</option>
    </select>

    <div>
      {placeholderContent[selectedType][selectedName]}
    </div>
  </div>
</NodeViewWrapper>

<style lang="scss">
  .descriptionImport {
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }
  .selected {
    border-color: rgb(0, 255, 21);
  }
</style>
