// Simple regex-based highlighter for HTML/CSS/JS
// Not a full parser — intended for readable basic highlighting offline.
function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function highlightHTML(code){
  code = escapeHtml(code);
  // comments
  code = code.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>');
  // tags
  code = code.replace(/(&lt;\/?[a-zA-Z0-9\-]+)([^&]*?)(&gt;)/g, function(m, p1, p2, p3){
    p1 = '<span class="token-tag">'+p1+'</span>';
    // attributes
    p2 = p2.replace(/([a-zA-Z-:]+)(=)("[^"]*"|'[^']*')/g, '<span class="token-attr">$1</span>$2<span class="token-string">$3</span>');
    return p1 + p2 + p3;
  });
  return code;
}

function highlightCSS(code){
  code = escapeHtml(code);
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
  code = code.replace(/([a-zA-Z-]+)(?=\s*\{)/g, '<span class="token-keyword">$1</span>');
  code = code.replace(/(:\s*)([^;\{]+)/g, function(m,p1,p2){ return p1 + '<span class="token-string">'+p2+'</span>'; });
  return code;
}

function highlightJS(code){
  code = escapeHtml(code);
  code = code.replace(/(\/\/.*?$)/gm, '<span class="token-comment">$1</span>');
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
  // strings
  code = code.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, '<span class="token-string">$1</span>');
  // keywords (simple set)
  code = code.replace(/\b(function|return|var|let|const|if|else|for|while|switch|case|break|new|class|try|catch|finally|throw|await|async|import|from)\b/g, '<span class="token-keyword">$1</span>');
  // function names
  code = code.replace(/\b([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*(?=\()/g, '<span class="token-fn">$1</span>');
  return code;
}

function highlightByLang(lang, code){
  if(lang==='html') return highlightHTML(code);
  if(lang==='css') return highlightCSS(code);
  if(lang==='js') return highlightJS(code);
  return escapeHtml(code);
}
