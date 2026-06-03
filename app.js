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
function renderRules(){
  const ul = qs('#ruleItems'); ul.innerHTML='';
  rules.forEach((r,i)=>{
    const li = document.createElement('li'); li.className='rule-item';
    li.innerHTML = `<div><div><strong>${escapeHtml(r.title)}</strong></div><div class="rule-meta">Action: ${r.action} • Lookouts: ${escapeHtml(r.lookouts)}</div></div><div><button data-i="${i}" class="edit">Edit</button></div>`;
    ul.appendChild(li);
  });
  qsa('#ruleItems button.edit').forEach(b=>b.addEventListener('click',e=>{
    const i = +b.dataset.i; loadRule(i);
  }));
}

function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

qs('#addRuleBtn').addEventListener('click',()=>{ clearEditor(); qs('#ruleTitle').focus(); });
function clearEditor(){ editIndex=-1; qs('#editorTitle').textContent='Add / Edit Rule'; qs('#ruleTitle').value=''; qs('#ruleCondition').value=''; qs('#ruleLookouts').value=''; qs('#ruleAction').value='handle'; qs('#deleteRule').style.display='none'; }
function loadRule(i){ editIndex=i; const r = rules[i]; qs('#editorTitle').textContent='Edit Rule'; qs('#ruleTitle').value=r.title; qs('#ruleCondition').value=r.condition; qs('#ruleLookouts').value=r.lookouts; qs('#ruleAction').value=r.action; qs('#deleteRule').style.display='inline-block'; }

qs('#saveRule').addEventListener('click',()=>{
  const r = { title:qs('#ruleTitle').value.trim()||'Untitled', condition:qs('#ruleCondition').value, lookouts:qs('#ruleLookouts').value, action:qs('#ruleAction').value };
  if(editIndex>=0) rules[editIndex]=r; else rules.push(r);
  localStorage.setItem('rules:v1',JSON.stringify(rules)); renderRules(); clearEditor();
});

qs('#deleteRule').addEventListener('click',()=>{
  if(editIndex<0) return; if(!confirm('Delete this rule?')) return; rules.splice(editIndex,1); localStorage.setItem('rules:v1',JSON.stringify(rules)); renderRules(); clearEditor();
});
qs('#clearRule').addEventListener('click',clearEditor);
renderRules();

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

// Chatbot feedback
let cbFeedback = JSON.parse(localStorage.getItem('cbFeedback:v1')||'[]');
function renderCb(){ const ul=qs('#cbFeedbackList'); ul.innerHTML=''; cbFeedback.forEach((f,i)=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${f.accuracy}%</strong> - ${escapeHtml(f.text)} <button data-i="${i}" class="delCb danger">Delete</button>`; ul.appendChild(li); }); qsa('#cbFeedbackList button.delCb').forEach(b=>b.addEventListener('click',()=>{ cbFeedback.splice(+b.dataset.i,1); localStorage.setItem('cbFeedback:v1',JSON.stringify(cbFeedback)); renderCb(); })); }
qs('#saveCbFeedback').addEventListener('click',()=>{ const text=qs('#cbFeedback').value.trim(); const acc=+qs('#cbAccuracy').value; if(!text) return alert('Enter feedback'); cbFeedback.push({ text, accuracy:acc, at:Date.now() }); localStorage.setItem('cbFeedback:v1',JSON.stringify(cbFeedback)); qs('#cbFeedback').value=''; renderCb(); });
qs('#exportCbFeedback').addEventListener('click',()=>{ downloadJSON(cbFeedback,'cb_feedback.json'); });
renderCb();

// Warnings
let warnings = JSON.parse(localStorage.getItem('warnings:v1')||'[]');
function renderWarnings(){ const ul=qs('#warningsList'); ul.innerHTML=''; warnings.forEach((w,i)=>{ const li=document.createElement('li'); li.className='rule-item'; li.innerHTML=`<div><strong>SR ${escapeHtml(w.srId)}</strong><div class=\"rule-meta\">Prob: ${w.prob}% • Action: ${w.action}</div><div>${escapeHtml(w.reason)}</div></div><div><div class=\"stars\">${renderStars(w.rating||0, i)}</div><button data-i="${i}" class="delWarning danger">Delete</button></div>`; ul.appendChild(li); }); qsa('#warningsList button.delWarning').forEach(b=>{ b.addEventListener('click',()=>{ warnings.splice(+b.dataset.i,1); localStorage.setItem('warnings:v1',JSON.stringify(warnings)); renderWarnings(); }); }); qsa('.star-btn').forEach(b=>b.addEventListener('click',()=>{ const idx=+b.dataset.idx; const widx=+b.dataset.w; warnings[widx].rating = idx; localStorage.setItem('warnings:v1',JSON.stringify(warnings)); renderWarnings(); })); }
function renderStars(rating, widx){ let out=''; for(let i=1;i<=5;i++){ out += `<button class="star-btn" data-idx="${i}" data-w="${widx}" title="${i} stars">${i<=rating? '★':'☆'}</button>`; } return out; }

qs('#warningForm').addEventListener('submit',e=>{ e.preventDefault(); const srId=qs('#srId').value.trim(); const prob=+qs('#prob').value; const reason=qs('#reason').value.trim(); const action=qs('#warnAction').value; if(!srId) return alert('SR ID required'); warnings.push({ srId, prob, reason, action, created:Date.now() }); localStorage.setItem('warnings:v1',JSON.stringify(warnings)); renderWarnings(); qs('#warningForm').reset(); });
qs('#exportWarnings').addEventListener('click',()=> downloadJSON(warnings,'warnings_export.json'));
function downloadJSON(obj, name){ const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }
renderWarnings();

// small helpers
function download(text, name){ const blob=new Blob([text],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }

// Initial view
qsa('.page').forEach(p=>p.classList.add('hidden')); qs('#home').classList.remove('hidden');
