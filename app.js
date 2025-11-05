// Main app logic: autosave, highlight sync, run preview, import/export
document.getElementById('year').textContent = new Date().getFullYear();

const htmlInput = document.getElementById('html-code');
const cssInput = document.getElementById('css-code');
const jsInput = document.getElementById('js-code');
const htmlHigh = document.getElementById('html-highlight');
const cssHigh = document.getElementById('css-highlight');
const jsHigh = document.getElementById('js-highlight');
const runBtn = document.getElementById('run-btn');
const resetBtn = document.getElementById('reset-btn');
const preview = document.getElementById('preview');
const autosaveToggle = document.getElementById('autosave-toggle');
const autorenderToggle = document.getElementById('autorender-toggle');
const projectNameInput = document.getElementById('project-name');
const saveLocalBtn = document.getElementById('save-local');
const downloadJsonBtn = document.getElementById('download-json');
const importJsonBtn = document.getElementById('import-json');
const fileInput = document.getElementById('file-input');
const downloadHtmlBtn = document.getElementById('download-html');
const newProjBtn = document.getElementById('new-proj');
const clearStorageBtn = document.getElementById('clear-storage');

const STORAGE_KEY_PREFIX = 'advanced_editor_v1_';

function getStorageKey(name){ return STORAGE_KEY_PREFIX + (name || 'default'); }

function saveToLocal(name){
  const payload = {
    name: name || projectNameInput.value || 'meu-projeto',
    html: htmlInput.value,
    css: cssInput.value,
    js: jsInput.value,
    updated: Date.now()
  };
  localStorage.setItem(getStorageKey(payload.name), JSON.stringify(payload));
  localStorage.setItem(STORAGE_KEY_PREFIX + 'last', payload.name);
  toast('Projeto salvo em localStorage');
}

function loadFromLocal(name){
  const raw = localStorage.getItem(getStorageKey(name));
  if(!raw) return false;
  const payload = JSON.parse(raw);
  projectNameInput.value = payload.name;
  htmlInput.value = payload.html;
  cssInput.value = payload.css;
  jsInput.value = payload.js;
  syncHighlights();
  renderPreview();
  return true;
}

function autosaveHandler(){
  if(!autosaveToggle.checked) return;
  const name = projectNameInput.value || 'meu-projeto';
  saveToLocal(name);
}

function syncHighlights(){
  htmlHigh.innerHTML = highlightByLang('html', htmlInput.value);
  cssHigh.innerHTML = highlightByLang('css', cssInput.value);
  jsHigh.innerHTML = highlightByLang('js', jsInput.value);
}

function renderPreview(){
  const html = htmlInput.value;
  const css = '<style>' + cssInput.value + '</style>';
  const js  = '<script>' + jsInput.value + '<\/script>';
  const blob = new Blob([html + css + js], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  preview.src = url;
  setTimeout(()=>{ try{ URL.revokeObjectURL(url);}catch(e){} }, 2000);
}

function debounce(fn, wait){ let t; return function(){ clearTimeout(t); t = setTimeout(()=>fn.apply(this, arguments), wait); } }

// initial sample
const SAMPLE_HTML = '<!doctype html>\n<html>\n  <head><meta charset="utf-8"><title>Mini Preview</title></head>\n  <body>\n    <h1>Olá, mundo!</h1>\n    <p>Edite este código e clique em Executar.</p>\n  </body>\n</html>';
const SAMPLE_CSS = 'body { font-family: Inter, system-ui, sans-serif; padding: 1rem; color: #222; background: #fff; }';
const SAMPLE_JS = "console.log('Olá do JS!');";

function setSample(){
  htmlInput.value = SAMPLE_HTML;
  cssInput.value = SAMPLE_CSS;
  jsInput.value = SAMPLE_JS;
  syncHighlights();
  renderPreview();
}

runBtn.addEventListener('click', () => { renderPreview(); });

resetBtn.addEventListener('click', () => { setSample(); });

htmlInput.addEventListener('input', () => { syncHighlights(); if(autorenderToggle.checked) debounce(renderPreview, 400)(); if(autosaveToggle.checked) debounce(autosaveHandler, 800)(); });
cssInput.addEventListener('input',  () => { syncHighlights(); if(autorenderToggle.checked) debounce(renderPreview, 400)(); if(autosaveToggle.checked) debounce(autosaveHandler, 800)(); });
jsInput.addEventListener('input',   () => { syncHighlights(); if(autorenderToggle.checked) debounce(renderPreview, 400)(); if(autosaveToggle.checked) debounce(autosaveHandler, 800)(); });

// download project as JSON
downloadJsonBtn.addEventListener('click', () => {
  const name = projectNameInput.value || 'meu-projeto';
  const payload = { name, html: htmlInput.value, css: cssInput.value, js: jsInput.value, created: Date.now() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name + '.json'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>{ try{ URL.revokeObjectURL(url);}catch(e){} }, 2000);
});

// import JSON
importJsonBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const payload = JSON.parse(ev.target.result);
      projectNameInput.value = payload.name || 'meu-projeto';
      htmlInput.value = payload.html || '';
      cssInput.value = payload.css || '';
      jsInput.value = payload.js || '';
      syncHighlights();
      renderPreview();
      toast('Projeto importado');
    } catch(err){ toast('Arquivo inválido'); }
  };
  reader.readAsText(f);
});

// download as single HTML file
downloadHtmlBtn.addEventListener('click', () => {
  const html = htmlInput.value;
  const css = '<style>' + cssInput.value + '</style>';
  const js  = '<script>' + jsInput.value + '<\/script>';
  const content = html + '\n' + css + '\n' + js;
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = (projectNameInput.value||'project') + '.html'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>{ try{ URL.revokeObjectURL(url);}catch(e){} }, 2000);
});

// new project (clears and sets sample)
newProjBtn.addEventListener('click', () => {
  projectNameInput.value = '';
  setSample();
  toast('Novo projeto criado');
});

saveLocalBtn.addEventListener('click', () => {
  const name = projectNameInput.value || 'meu-projeto';
  saveToLocal(name);
});

// clear storage
clearStorageBtn.addEventListener('click', () => {
  if(confirm('Remover todos os projetos salvos localmente?')){
    Object.keys(localStorage).forEach(k => { if(k.startsWith(STORAGE_KEY_PREFIX)) localStorage.removeItem(k); });
    toast('Armazenamento limpo');
  }
});

// small toast
function toast(msg){
  let el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el);
  el.animate([{ opacity:0, transform:'translateY(8px)' },{ opacity:1, transform:'translateY(0)' }], { duration:260, easing:'cubic-bezier(.2,.9,.3,1)' });
  setTimeout(()=>{ el.animate([{ opacity:1 },{ opacity:0 }], { duration:300 }); setTimeout(()=>el.remove(),400); }, 2000);
}

// load last project if present
window.addEventListener('load', () => {
  const last = localStorage.getItem(STORAGE_KEY_PREFIX + 'last');
  if(last && loadFromLocal(last)){
    toast('Projeto carregado do armazenamento local');
  } else {
    setSample();
  }
  syncHighlights();
  renderPreview();
});
