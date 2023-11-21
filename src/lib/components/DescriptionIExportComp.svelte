<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core'
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap'

  export let node: NodeViewProps['node']
  export let updateAttributes: NodeViewProps['updateAttributes']
  export let selected: NodeViewProps['selected'] = false

  const handleClick = () => {
    updateAttributes({ hash: node.attrs.hash + 1 })
  }
</script>

<NodeViewWrapper>
  <div class="descriptionImport" class:selected>
    <div contenteditable="false">
      <input placeholder="Enter name for this export" />
    </div>
    <NodeViewContent></NodeViewContent>
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
