<script lang="ts">
// import * as monaco from 'monaco-editor'
import Meta from './Meta.svelte'

const { data } = $props()

let testEditor = $state<HTMLDivElement>()

let editor2 = $state()
</script>

<div bind:this={testEditor}></div>

<!-- <div class="editorWrapper">
  <div class="editorButtons">
    <button onclick={editor.toggleBold} class:active={editor.activeStyles.bold} title="CTRL + B / ⌘ + B">
      <span>Bold</span>
    </button>
    {@render colorButtons()}
    {@render justifyButtons()}
    {@render imgButtons()}
    <button onclick={() => editor.setColor('comment')}>comment</button>
    <button onclick={editor.toggleEnhanced}>enhanced</button>
    {@render linkButton()}
    <button onclick={editor.toggleUnorderedList}>ul</button>
  </div> -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- <div
    bind:this={editor.editorElement}
    contenteditable="true"
    class="mainEditor"
    onkeydown={(e) => {
      escapeImgNode_keydown(e)
      format()
    }}
    onpaste={escapeImgNode_paste}>
  </div>
</div> -->

<!-- <div class="flex flex-row flex-wrap justify-center gap-4 rounded">
  <div class="editorContainer">
    <div class="flex flex-row flex-wrap gap-1 p-1">
      <Alignment editor={mainEditor} />
      <EditorButton editor={mainEditor} type="bold" title="CTRL + B / ⌘ + B" />
      <EditorButton editor={mainEditor} type="bulletList" title="TAB" />
      <EditorButton editor={mainEditor} type="comment" title="CTRL + /" />
      <EditorButton editor={mainEditor} type="enhanced" title="" />
      <EditorButton editor={mainEditor} type="highlight" title="" />
      <TextColor editor={mainEditor} />
      <Images editor={mainEditor} />
      <Table editor={mainEditor} />
      <Link editor={mainEditor} />
      <Tooltip editor={mainEditor} />
    </div>
    <div class="editorStyles firstEditor bg-tint-dark px-2">
      <SvelteTiptap editor={mainEditor} {editorSettings}>
        {#snippet bubbleMenu()}
          <div class="bubbleMenu">
            <EditorButton editor={mainEditor} type="bold" title="CTRL + B / ⌘ + B" displayText={false} />
            <EditorButton editor={mainEditor} type="comment" title="CTRL + /" displayText={false} />
            <EditorButton editor={mainEditor} type="enhanced" title="" displayText={false} />
            <EditorButton editor={mainEditor} type="highlight" title="" displayText={false} />
            <TextColor editor={mainEditor} displayText={false} />
            <Link editor={mainEditor} displayText={false} />
          </div>
        {/snippet}
      </SvelteTiptap>
    </div>
    <div class="editorStyles secondEditor bg-tint-dark px-2">
      <SvelteTiptap editor={secondEditor} {editorSettings} />
    </div>
  </div>
   <PerkSelection perksPromise={data.perksPromise} lang={data.lang} editor={mainEditor} hash={data.hash} /> 
  <Search perksPromise={data.perksPromise} />
</div> -->
<!-- 
<button onclick={dump}>dump</button>
<button onclick={getOldDescription}>getOldDescription</button> -->

<Meta hash={data.hash} />

<style>
.bubbleMenu {
  display: flex;
  gap: 0.3rem;
  padding: 0.3rem;
  background-color: hsla(0, 0%, 30%, 0.7);
  border-radius: 0.3rem;
  box-shadow: 0 0 0.3rem 0 hsla(0, 0%, 0%, 0.2);
}

.editorWrapper {
  max-width: 1192px;

  > div[contenteditable] {
    padding: 0.3rem;
    background-color: light-dark(var(--lm_background-color_secondary), var(--dm_background-color_secondary));
    color: light-dark(var(--lm_text-color_primary), var(--dm_text-color_primary));
  }
  > div:focus-visible {
    outline: none;
  }

  .editorButtons {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
    padding: 0.3rem 0;

    .dropdown {
      display: flex;
      flex-direction: column;
    }

    > button {
      display: flex;
      align-items: flex-end;
      flex-direction: row;
    }
  }
  .mainEditor {
    height: 50vh;
  }
  .secondEditor {
    height: 40vh;
    border-top: 0.3rem solid hsla(0, 0%, 100%, 0.2);
  }
}

@font-face {
  font-family: D2 Clarity fonts;
  src: url(/D2-Clarity-fonts.woff);
}
</style>
