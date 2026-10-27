// The converter accepts only a numeric prefix, not arbitrary JavaScript.
export function evaluateMarkupMath(text: string): string {
  return text.replace(/\${.+?}/g, (expression) => {
    const source = expression.match(
      /(-?\d+(\.\d+)?)(\s{0,9}[+\-/*]\s{0,9}(-?\d+(\.\d+)?)){0,99}/,
    )?.[0];
    if (!source) return expression;
    const tokens = source.match(/-?\d+(?:\.\d+)?|[+*/-]/g) ?? [];
    let index = 0;
    function number(): number {
      return Number(tokens[index++]);
    }
    function product(): number {
      let value = number();
      while (tokens[index] === '*' || tokens[index] === '/') {
        const operator = tokens[index++];
        const right = number();
        value = operator === '*' ? value * right : value / right;
      }
      return value;
    }
    let value = product();
    while (index < tokens.length) {
      const operator = tokens[index];
      // A negative token immediately after a number is subtraction without spaces.
      if (operator.startsWith('-') && operator.length > 1) value += product();
      else {
        index++;
        const right = product();
        value = operator === '+' ? value + right : value - right;
      }
    }
    if (!Number.isFinite(value)) return String(value);
    const [coefficient, exponent = '0'] = String(value).split('e');
    const shifted = Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
    const [rounded, roundedExponent = '0'] = String(shifted).split('e');
    return String(Number(`${rounded}e${Number(roundedExponent) - 2}`));
  });
}
