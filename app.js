// Simple single-file app for demo purposes. Data stored in localStorage for now.
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

// Navigation
qsa('header nav button').forEach(b=>b.addEventListener('click',()=>{
  const t = b.dataset.target;
  qsa('.page').forEach(p=>p.classList.add('hidden'));
  qs('#'+t).classList.remove('hidden');
}));

// Copy link
qs('#copyLink').addEventListener('click',()=>{
  const url = location.href.split('#')[0] + '#shared';
  navigator.clipboard?.writeText(url).then(()=>alert('Link copied: '+url),()=>alert('Copy failed'));
});

// Business rules
let rules = JSON.parse(localStorage.getItem('rules:v1')||'[]');
let editIndex = -1;
function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderRules(){
  const tbody = qs('#ruleTable tbody'); tbody.innerHTML='';
  rules.forEach((r,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${escapeHtml(r.title)}</td>
      <td>${escapeHtml(r.detected)}</td>
      <td>${escapeHtml(r.lookouts)}</td>
      <td>${escapeHtml(r.platforms||'')}</td>
      <td>${escapeHtml(r.recommendedAction)}</td>
      <td>${escapeHtml(r.confidence)}</td>
      <td>${escapeHtml(r.outcome||'unknown')}</td>
      <td>
        <button data-i="${i}" class="edit">Edit</button>
        <button data-i="${i}" class="delRow danger">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  qsa('#ruleTable button.edit').forEach(b=>b.addEventListener('click',e=>{ const i = +b.dataset.i; loadRule(i); }));
  qsa('#ruleTable button.delRow').forEach(b=>b.addEventListener('click',e=>{ const i = +b.dataset.i; if(!confirm('Delete rule?')) return; rules.splice(i,1); localStorage.setItem('rules:v1',JSON.stringify(rules)); renderRules(); }));
}

qs('#addRuleBtn').addEventListener('click',()=>{ clearEditor(); qs('#ruleTitle').focus(); });
function clearEditor(){ editIndex=-1; qs('#editorTitle').textContent='Add / Edit Rule'; qs('#ruleTitle').value=''; qs('#ruleDetected').value=''; qs('#ruleActionsTaken').value=''; qs('#ruleLookouts').value=''; qs('#rulePlatforms').value=''; qs('#ruleConfidence').value='medium'; qs('#ruleRecommendedAction').value='handle'; qs('#ruleOutcome').value='unknown'; qs('#deleteRule').style.display='none'; qsa('#ruleTable tbody tr').forEach(tr=>tr.classList.remove('selected-row')); }
function loadRule(i){
  editIndex = i;
  const r = rules[i];
  qs('#editorTitle').textContent = 'Edit Rule';
  qs('#ruleTitle').value = r.title;
  qs('#ruleDetected').value = r.detected||'';
  qs('#ruleActionsTaken').value = r.actionsTaken||'';
  qs('#ruleLookouts').value = r.lookouts||'';
  qs('#rulePlatforms').value = r.platforms||'';
  qs('#ruleConfidence').value = r.confidence||'medium';
  qs('#ruleRecommendedAction').value = r.recommendedAction||'handle';
  qs('#ruleOutcome').value = r.outcome||'unknown';
  qs('#deleteRule').style.display = 'inline-block';
  // highlight selected row
  qsa('#ruleTable tbody tr').forEach(tr=>tr.classList.remove('selected-row'));
  const sel = qs(`#ruleTable tbody tr:nth-child(${i+1})`);
  if(sel) sel.classList.add('selected-row');
  // open questions page
  qsa('.page').forEach(p=>p.classList.add('hidden'));
  qs('#ruleQuestions').classList.remove('hidden');
}

qs('#saveRule').addEventListener('click',()=>{
  const r = {
    title: qs('#ruleTitle').value.trim()||'Untitled',
    detected: qs('#ruleDetected').value.trim(),
    actionsTaken: qs('#ruleActionsTaken').value.trim(),
    lookouts: qs('#ruleLookouts').value.trim(),
    platforms: qs('#rulePlatforms').value.trim(),
    confidence: qs('#ruleConfidence').value,
    recommendedAction: qs('#ruleRecommendedAction').value,
    outcome: qs('#ruleOutcome').value,
    updated: Date.now()
  };
  // Basic validation for mandatory fields
  if(!r.detected || !r.actionsTaken || !r.lookouts || !r.recommendedAction){ alert('Please fill all mandatory fields: detected issue, actions taken, lookouts, recommended action'); return; }
  if(editIndex>=0) rules[editIndex]=r; else rules.push(r);
  localStorage.setItem('rules:v1',JSON.stringify(rules)); renderRules(); clearEditor();
});

qs('#deleteRule').addEventListener('click',()=>{ if(editIndex<0) return; if(!confirm('Delete this rule?')) return; rules.splice(editIndex,1); localStorage.setItem('rules:v1',JSON.stringify(rules)); renderRules(); clearEditor(); });
qs('#clearRule').addEventListener('click',clearEditor);
renderRules();

// Export table CSV
qs('#exportRulesBtn')?.addEventListener('click',()=>{
  if(!rules.length) return alert('No rules to export');
  const header = ['index','title','detected','lookouts','platforms','recommendedAction','confidence','outcome','updated'];
  const rows = rules.map((r,i)=>[i+1, r.title, r.detected, r.lookouts, r.platforms, r.recommendedAction, r.confidence, r.outcome||'', r.updated||'']);
  const csv = [header, ...rows].map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadCSV(csv,'rules_export.csv');
});

function downloadCSV(text, name){ const blob = new Blob([text], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

// Documentation uploads (stored metadata + file in IndexedDB simplified via localStorage base64 for demo)
let docs = JSON.parse(localStorage.getItem('docs:v1')||'[]');
function renderDocs(){ const ul=qs('#docList'); ul.innerHTML=''; docs.forEach((d,i)=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${escapeHtml(d.name)}</strong> <button data-i="${i}" class="openDoc">Open</button> <button data-i="${i}" class="delDoc danger">Delete</button>`; ul.appendChild(li); }); qsa('#docList button.openDoc').forEach(b=>b.addEventListener('click',e=>{ const i=+b.dataset.i; const d=docs[i]; const w=window.open(); w.document.write(`<iframe src="${d.data}" style="width:100%;height:100%"></iframe>`); })); qsa('#docList button.delDoc').forEach(b=>{ b.addEventListener('click',()=>{ if(!confirm('Delete doc?')) return; docs.splice(+b.dataset.i,1); localStorage.setItem('docs:v1',JSON.stringify(docs)); renderDocs(); }); }); }

qs('#docUpload').addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files||[]);
  for(const f of files){
    const data = await readFileAsDataURL(f);
    docs.push({ name:f.name, data, uploaded:Date.now() });
  }
  localStorage.setItem('docs:v1',JSON.stringify(docs)); renderDocs(); e.target.value='';
});
function readFileAsDataURL(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }
renderDocs();

// Note: chatbot and warning UI removed from this demo. Feedback and warning exports will be implemented server-side in future versions.
function downloadJSON(obj, name){ const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

// small helpers
function download(text, name){ const blob=new Blob([text],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }

// Initial view
qsa('.page').forEach(p=>p.classList.add('hidden')); qs('#home').classList.remove('hidden');
