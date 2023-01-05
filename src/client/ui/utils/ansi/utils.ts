export function escapeHTML(text: string): string {
  return text.replace(/[&<>"']/gm, match => {
    switch (match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#x27;';
      default:
        return match;
    }
  });
}

// ES5 template string transformer
export function regexp(regexp: string, flag?: string): RegExp {
  // Remove white-space and comments
  return new RegExp(regexp.replace(/^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm, ''), flag);
}
