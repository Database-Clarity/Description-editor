import { useEffect, useMemo, useRef, useState } from 'react';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  toggleComment,
} from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
} from '@codemirror/view';
import {
  hasOldWeaponTypeSyntax,
  markupLanguage,
  validateText,
  type Lang,
  type MarkupGlobals,
} from '@clarity/core';
import { clarityCompletions } from './completion';
import { clarityHighlighting, clarityLanguage } from './language';
import { tableFormattingTransaction } from './formatTable';
import { validationDiagnostics } from './diagnostics';
import { planWeaponSyntaxConversion } from './weaponSyntax';
import styles from './ClarityEditor.module.scss';

export interface ClarityEditorProps {
  value: string;
  lang: Lang;
  onChange: (value: string) => void;
  globals: MarkupGlobals;
  readOnly?: boolean;
  requireEnglish?: boolean;
  highlightLine?: number;
}

function configuration(
  lang: Lang,
  globals: MarkupGlobals,
  readOnly: boolean,
  requireEnglish: boolean,
) {
  return [
    EditorState.readOnly.of(readOnly),
    EditorView.editable.of(!readOnly),
    EditorView.contentAttributes.of({
      spellcheck: 'true',
      lang: markupLanguage(lang),
      autocorrect: 'on',
      autocapitalize: 'off',
      'aria-label': 'Clarity markup',
      'aria-multiline': 'true',
    }),
    autocompletion({ override: [clarityCompletions(globals)] }),
    validationDiagnostics(lang, globals, requireEnglish),
  ];
}

export function ClarityEditor({
  value,
  lang,
  onChange,
  globals,
  readOnly = false,
  requireEnglish = true,
  highlightLine,
}: ClarityEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const callback = useRef(onChange);
  const initial = useRef({ value, lang, globals, readOnly, requireEnglish });
  const config = useRef(new Compartment());
  const extensions = useRef<Extension[]>([]);
  // Why the last conversion attempt changed nothing; it applies to the text it was tried on.
  const [conversionNote, setConversionNote] = useState<{ value: string; message: string }>();
  const issues = useMemo(
    () => validateText(value, lang, globals, requireEnglish),
    [value, lang, globals, requireEnglish],
  );

  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (!host.current) return;
    const format = (editor: EditorView) => {
      if (editor.state.readOnly) return false;
      const transaction = tableFormattingTransaction(editor.state);
      if (transaction) editor.dispatch(transaction);
      return true;
    };
    extensions.current = [
      lineNumbers(),
      highlightActiveLine(),
      drawSelection(),
      EditorView.lineWrapping,
      history(),
      indentOnInput(),
      bracketMatching(),
      clarityLanguage,
      clarityHighlighting,
      keymap.of([
        { key: 'ScrollLock', run: format },
        { key: 'Mod-Shift-f', run: format },
        { key: 'Mod-/', run: toggleComment },
        ...completionKeymap,
        ...historyKeymap,
        ...defaultKeymap,
        indentWithTab,
      ]),
      config.current.of(
        configuration(
          initial.current.lang,
          initial.current.globals,
          initial.current.readOnly,
          initial.current.requireEnglish,
        ),
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) callback.current(update.state.doc.toString());
      }),
    ];
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({ doc: initial.current.value, extensions: extensions.current }),
    });
    view.current = editor;
    return () => {
      view.current = null;
      editor.destroy();
    };
  }, []);

  useEffect(() => {
    const editor = view.current;
    if (!editor || editor.state.doc.toString() === value) return;
    // A different tooltip/language must never undo into the previous document.
    editor.setState(EditorState.create({ doc: value, extensions: extensions.current }));
    editor.dispatch({
      effects: config.current.reconfigure(configuration(lang, globals, readOnly, requireEnglish)),
    });
  }, [value, lang, globals, readOnly, requireEnglish]);

  useEffect(() => {
    view.current?.dispatch({
      effects: config.current.reconfigure(configuration(lang, globals, readOnly, requireEnglish)),
    });
  }, [lang, globals, readOnly, requireEnglish]);

  useEffect(() => {
    const editor = view.current;
    if (
      !editor ||
      !highlightLine ||
      !Number.isInteger(highlightLine) ||
      highlightLine < 1 ||
      highlightLine > editor.state.doc.lines
    )
      return;
    const line = editor.state.doc.line(highlightLine);
    editor.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true });
    editor.focus();
  }, [highlightLine]);

  const convertWeaponSyntax = () => {
    const editor = view.current;
    if (!editor) return;
    const { change, diagnostic } = planWeaponSyntaxConversion(editor.state);
    // The update listener reports the new text, so the draft is updated like any other edit.
    if (change) editor.dispatch(change);
    else if (diagnostic)
      setConversionNote({ value: editor.state.doc.toString(), message: diagnostic });
  };
  return (
    <div className={styles.editor}>
      <div ref={host} />
      {!readOnly && hasOldWeaponTypeSyntax(value) && (
        <div className={styles.convert} role="status">
          <span>This text uses the old weapon-type syntax.</span>
          <button type="button" onClick={convertWeaponSyntax}>
            Convert old weapon-type syntax
          </button>
          {conversionNote?.value === value && (
            <span className={styles.convertNote} role="alert">
              {conversionNote.message}
            </span>
          )}
        </div>
      )}
      <details className={styles.help}>
        <summary>{issues.length ? `${issues.length} markup issue(s)` : 'Markup help'}</summary>
        <p>
          Ctrl/Cmd+Space: complete. Ctrl/Cmd+Z: undo. Ctrl/Cmd+/: comment. Scroll Lock or
          Ctrl/Cmd+Shift+F: align tables.
        </p>
        <p>
          Native spelling uses your browser&apos;s enabled dictionaries. Right-click a misspelling
          for suggestions.
        </p>
        {issues.length > 0 && (
          <ul aria-label="Markup issues">
            {issues.map((issue, index) => (
              <li key={index}>
                {issue.severity}: {issue.message}
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}
