<script lang="ts">
import type { Writable } from 'svelte/store'
import Button from './Button.svelte'
import type { Editor } from '@tiptap/core'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { onMount, tick } from 'svelte'

let {
  editor,
  displayText = true,
}: {
  editor: Writable<Editor | undefined>
  displayText?: boolean
} = $props()

const toggleTooltip = () => $editor?.commands.toggleTooltip()

const updateTooltipProps = () => {
  $editor?.commands.updateTooltipId(10)
}

const active = $derived<boolean>($editor?.isActive('tooltip') || false)

let bubbleMenuElement = $state<HTMLDivElement>()
onMount(async () => {
  await tick()
  const bubbleMenuPlugin = BubbleMenuPlugin({
    pluginKey: 'tooltipBubbleMenu',
    editor: $editor!,
    element: bubbleMenuElement!,
    // TODO: Them pressing on svelte Component it should hide bubble menu but it doesn't
    shouldShow({ editor }) {
      return editor.isActive('tooltip') && editor.state.selection.content().size === 0
    },

    tippyOptions: {
      maxWidth: 'none',
    },
  })
  $editor?.registerPlugin(bubbleMenuPlugin)
})
</script>

<Button onclick={toggleTooltip} {active}>
  {#if displayText}
    <span>Tooltip</span>
  {/if}
</Button>

<div bind:this={bubbleMenuElement} style="visibility: hidden;">
  <div class="tooltip">
    <div>tooltip content {$editor?.getAttributes('tooltip').id}</div>
    <button onclick={updateTooltipProps}>update attribute</button>
  </div>
</div>

<style>
.tooltip {
  background-color: hsl(0, 0%, 45%);
  border-radius: 0.3rem;
}
</style>
