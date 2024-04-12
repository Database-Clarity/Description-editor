<script lang="ts">
  import type { Readable } from 'svelte/store'
  import { BubbleMenu, type Editor } from 'svelte-tiptap'
  import type { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
  import { getAttributes, getMarkRange } from '@tiptap/core'

  export let editor: Readable<Editor>

  let currentLink = ''

  // Thats allot of effort just to get fucking types work
  type ShouldShowFunction = Parameters<typeof BubbleMenuPlugin>[number]['shouldShow']
  type ShouldShowProps = Parameters<NonNullable<ShouldShowFunction>>[number]

  const shouldShow = (props: ShouldShowProps) => {
    // Show only then clicking on a link and not then selecting text
    if (props.editor.isActive('link') && props.from === props.to) {
      const { state } = $editor.view
      const attrs = getAttributes(state, state.schema.marks.link.name)
      currentLink = attrs.href
      return true
    } else {
      return false
    }
  }

  const editLink = (newLink: string) => {
    if (!$editor?.view) return

    const { state, dispatch } = $editor.view
    const { schema, doc, tr } = state
    const linkMarkType = schema.marks.link

    const range = getMarkRange(doc.resolve(tr.selection.$anchor.pos), linkMarkType) // get the range of the link
    if (!range) return

    const { from, to } = range

    // remove link laving plain text
    tr.removeMark(from, to, linkMarkType)

    if (newLink === 'remove') {
      // dispatch transaction
      dispatch(tr)
      return
    }

    // get old attributes
    const attrs = getAttributes(state, linkMarkType.name)

    // create new mark
    const newMark = linkMarkType.create({
      ...attrs,
      href: newLink,
    })

    // add new mark
    tr.addMark(from, to, newMark)

    // dispatch transaction
    dispatch(tr)
  }

  $: editLink(currentLink)
</script>

{#if $editor}
  <BubbleMenu editor={$editor} {shouldShow}>
    <select bind:value={currentLink}>
      <option value="https://www.youtube.com/">youtube</option>
      <option value="https://www.google.com/">google</option>
      <option value="remove">Remove</option>
    </select>
  </BubbleMenu>
{/if}
