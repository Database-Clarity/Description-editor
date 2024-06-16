<script lang="ts">
import { Editor } from '@tiptap/core'
import { onDestroy, onMount, type Snippet } from 'svelte'
import type { Writable } from 'svelte/store'
import type { EditorSettings, BubbleMenuSettings /*, FloatingMenuSettings */ } from './tipTapTypes'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
// import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'

let {
  bubbleMenu,
  // floatingMenu,
  children,
  editor,
  editorSettings,
  bubbleSettings,
  // floatingSettings,
}: {
  bubbleMenu?: Snippet
  // floatingMenu?: Snippet
  children?: Snippet
  editor: Writable<Editor | undefined>
  editorSettings: EditorSettings
  bubbleSettings?: BubbleMenuSettings
  // floatingSettings?: FloatingMenuSettings
} = $props()

let editorElement = $state<HTMLDivElement>()
let bubbleMenuElement = $state<HTMLDivElement>()
// let floatingMenuElement = $state<HTMLDivElement>()

onMount(() => {
  editor.set(
    new Editor({
      element: editorElement,
      ...editorSettings,
    })
  )

  if (bubbleMenu) {
    const bubbleMenuPlugin = BubbleMenuPlugin({
      pluginKey: 'bubbleMenu',
      editor: $editor!,
      element: bubbleMenuElement!,
      // TODO: Them pressing on svelte Component it should hide bubble menu but it doesn't
      // shouldShow() {
      //   return false
      // },
      ...bubbleSettings,
      tippyOptions: {
        maxWidth: 'none',
      },
    })
    $editor?.registerPlugin(bubbleMenuPlugin)
  }

  // if (floatingMenu) {
  //   const plugin = FloatingMenuPlugin({
  //     pluginKey: 'floatingMenu',
  //     editor: $editor!,
  //     element: floatingMenuElement!,
  //     // TODO: Make sure it doesn't have same issue as bubble menu with not hiding
  //     ...floatingSettings,
  //   })
  //   $editor!.registerPlugin(plugin)
  // }

  $editor!.on('transaction', () => {
    editor.set($editor)
  })
})

onDestroy(() => {
  if ($editor) {
    $editor.unregisterPlugin(bubbleSettings?.pluginKey ?? 'bubbleMenu')
    // $editor.unregisterPlugin(floatingSettings?.pluginKey ?? 'floatingMenu')
    $editor.destroy()
  }
})
</script>

<div bind:this={editorElement} style="display: contents;">
  <!-- {#if !$editor}
    <div class="tiptap ProseMirror">
      {#if children}
        {@render children()}
      {/if}
    </div>
  {/if} -->
</div>

{#if bubbleMenu}
  <div bind:this={bubbleMenuElement} style="visibility: hidden;">
    {@render bubbleMenu()}
  </div>
{/if}

<!-- {#if floatingMenu}
  <div bind:this={floatingMenuElement} style="visibility: hidden;">
    {@render floatingMenu()}
  </div>
{/if} -->
