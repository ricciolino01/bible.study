// Categoria -> [testamento, tonalità]. Antico Testamento = tinte calde, Nuovo Testamento = tinte fredde.
const CAT={Pentateuco:['AT',28],Storici:['AT',46],Poetici:['AT',8],Profeti:['AT',340],Vangeli:['NT',200],Storia:['NT',175],Lettere:['NT',225],Profezia:['NT',265]};
const $=s=>document.querySelector(s);
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-');
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// 1. DATI E ORDINAMENTI (a parità di valore vale l'ordine biblico, cioè l'ordine delle righe)
const B=(await (await fetch('books.json')).json()).map((b,i)=>({...b,i}));
const NOREF=B.filter(b=>b.trattato_inizio===null);
const ORD={bib:B,
  cro:B.filter(b=>b.trattato_inizio!==null).sort((a,b)=>a.trattato_inizio-b.trattato_inizio||a.i-b.i),
  wri:[...B].sort((a,b)=>(a.completato_anno??Infinity)-(b.completato_anno??Infinity)||a.i-b.i)};
const pos=Object.fromEntries(Object.entries(ORD).map(([m,l])=>[m,Object.fromEntries(l.map((b,k)=>[b.id,k+1]))]));
const full=m=>m==='cro'?[...ORD.cro,...NOREF]:ORD[m]; // ordine di precedente/successivo
let mode=localStorage.getItem('mode');if(!ORD[mode])mode='bib';

// 2. CASELLE E LEGENDA
const cards=Object.fromEntries(B.map(b=>{const e=document.createElement('button'),c=CAT[b.categoria];
  e.className='card'+(c?'':' n');if(c)e.style.setProperty('--h',c[1]);
  e.style.viewTransitionName='c'+b.i;e.innerHTML='<small></small>'+esc(b.nome);
  e.onclick=()=>location.hash='#/libro/'+b.id;return[b.id,e];}));
const card=(b,n)=>{cards[b.id].firstChild.textContent=n??'';return cards[b.id];};
for(const[t,nome]of[['AT','Antico Testamento'],['NT','Nuovo Testamento']]){ // la legenda mostra solo le categorie presenti
  const cs=Object.keys(CAT).filter(c=>CAT[c][0]===t&&B.some(b=>b.categoria===c));if(!cs.length)continue;
  const r=document.createElement('div');
  r.innerHTML=`<b>${nome}</b>`+cs.map(c=>`<span><i style="--h:${CAT[c][1]}"></i>${c}</span>`).join('');$('#legend').append(r);}

// 3. GRIGLIA, RICERCA E AREA "SENZA RIFERIMENTO"
function layout(){
  const q=slug($('#q').value.trim()),f=l=>l.filter(b=>slug(b.nome).includes(q));
  $('#grid').replaceChildren(...f(ORD[mode]).map(b=>card(b,pos[mode][b.id])));
  const rest=mode==='cro'?f(NOREF):[];
  $('#grid2').replaceChildren(...rest.map(b=>card(b)));
  $('#noref').hidden=!rest.length;
  document.querySelectorAll('#seg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.m===mode));
}

// 4. SCHEDA DETTAGLIO
function detail(id){
  const l=full(mode),k=l.findIndex(b=>b.id===id),b=l[k];if(!b)return location.hash='';
  $('#detail').innerHTML=`<button class="back" id="bk">‹ Libri</button><h2>${esc(b.nome)}</h2>
  <dl><dt>Scrittore</dt><dd>${esc(b.scrittore)}</dd><dt>Luogo di scrittura</dt><dd>${esc(b.luogo)}</dd>
  <dt>Tempo completato</dt><dd>${esc(b.completato_testo)}</dd><dt>Tempo trattato</dt><dd>${esc(b.trattato_testo)}</dd></dl>
  <div class="nav"><button ${k?'':'disabled'} data-g="${k?l[k-1].id:''}">‹ Precedente</button><button ${l[k+1]?'':'disabled'} data-g="${l[k+1]?.id??''}">Successivo ›</button></div>`;
  $('#bk').onclick=()=>history.length>1?history.back():location.hash='';
  document.querySelectorAll('.nav button').forEach(x=>x.onclick=()=>location.replace('#/libro/'+x.dataset.g));
}

// 5. ROUTING (hash) E AVVIO
function route(){
  const m=location.hash.match(/^#\/libro\/(.+)$/);
  $('#home').hidden=!!m;$('#detail').hidden=!m;
  if(m){detail(decodeURIComponent(m[1]));scrollTo(0,0);}
}
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
$('#seg').onclick=e=>{const m=e.target.dataset.m;if(!m)return;mode=m;localStorage.setItem('mode',m);
  document.startViewTransition&&!still?document.startViewTransition(layout):layout();}; // View Transitions; senza supporto riordina e basta
$('#q').oninput=layout;
addEventListener('hashchange',route);layout();route();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
window.caches?.keys().then(k=>{$('#ver').textContent='Versione app: '+(k.find(x=>x.startsWith('bibbia-'))||'')});
