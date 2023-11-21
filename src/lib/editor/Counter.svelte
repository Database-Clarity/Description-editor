<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core'
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap'

  export let node: NodeViewProps['node']
  export let updateAttributes: NodeViewProps['updateAttributes']
  export let selected: NodeViewProps['selected'] = false

  const handleClick = () => {
    updateAttributes({ count: node.attrs.count + 1 })
  }
</script>

<NodeViewWrapper class="svelte-component">
  <span class="label" contenteditable="false">Svelte Editable Component</span>

  <!-- Content is inserted here -->
  <NodeViewContent />
</NodeViewWrapper>
