export interface MarkupGlobals {
  variables: string;
  titles: string;
  imports?: Readonly<Record<string, string>>;
  type?: string;
}

export interface MarkupSpan {
  text?: string;
  classNames?: (string | undefined)[];
  link?: string;
  title?: MarkupLine[];
}

export interface MarkupCell {
  cellContent: MarkupSpan[];
  colSpan?: number;
  rowSpan?: number;
  classNames?: (string | undefined)[];
}

export interface MarkupLine {
  classNames?: (string | undefined)[];
  linesContent?: MarkupSpan[];
  table?: { classNames?: (string | undefined)[]; rowContent?: MarkupCell[] }[];
  /** Canonical weapon type names this line is scoped to; absent for text shared by every type. */
  weaponTypes?: string[];
  /** Index of the `<weapons>` block the line belongs to (consecutive lines of a block share it). */
  weaponBlock?: number;
  /** True when the block was `<weapons other>`; its `weaponTypes` is the resolved complement. */
  weaponOther?: boolean;
  isFormula?: boolean;
}

export interface MarkupDiagnostic {
  message: string;
  severity: 'error' | 'warning';
}

export interface ParsedMarkup {
  lines: MarkupLine[];
  diagnostics: MarkupDiagnostic[];
}
