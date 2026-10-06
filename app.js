// Dati: books.json (da prospetto_libri.xlsx). s = inizio del periodo trattato (null = nessun riferimento temporale)
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-');
const $=s=>document.querySelector(s);
const B=(await (await fetch('books.json')).json()).map((r,i)=>({i,id:slug(r.n),...r}));
const NOREF=B.filter(b=>b.s===null);
const ORD={bib:B,
  cro:B.filter(b=>b.s!==null).sort((a,b)=>a.s-b.s||a.i-b.i),
  wri:[...B].sort((a,b)=>a.y-b.y||a.i-b.i)};
const pos=Object.fromEntries(Object.entries(ORD).map(([m,l])=>[m,Object.fromEntries(l.map((b,k)=>[b.id,k+1]))]));
const full=m=>m==='cro'?[...ORD.cro,...NOREF]:ORD[m]; // ordine usato da precedente/successivo
let mode=localStorage.getItem('mode');if(!ORD[mode])mode='bib';
const cards=Object.fromEntries(B.map(b=>{const e=document.createElement('button');e.className='card';e.style.viewTransitionName='c'+b.i;
  e.innerHTML='<small></small>'+b.n;e.onclick=()=>location.hash='#/libro/'+b.id;return[b.id,e];}));
const card=(b,n)=>{cards[b.id].firstChild.textContent=n??'';return cards[b.id];};
function layout(){
  const q=slug($('#q').value.trim()),f=l=>l.filter(b=>slug(b.n).includes(q));
  $('#grid').replaceChildren(...f(ORD[mode]).map(b=>card(b,pos[mode][b.id])));
  const rest=mode==='cro'?f(NOREF):[];
  $('#grid2').replaceChildren(...rest.map(b=>card(b)));
  $('#noref').hidden=!rest.length;
  document.querySelectorAll('#seg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.m===mode));
}
function detail(id){
  const l=full(mode),k=l.findIndex(b=>b.id===id),b=l[k];if(!b)return location.hash='';
  const d=$('#detail');
  d.innerHTML=`<button class="back" id="bk">‹ Libri</button><h2>${b.n}</h2>
  <dl><dt>Scrittore</dt><dd>${b.w}</dd><dt>Luogo di scrittura</dt><dd>${b.p}</dd>
  <dt>Tempo completato</dt><dd>${b.yt}</dd><dt>Tempo trattato</dt><dd>${b.tt}</dd></dl>
  <div class="nav"><button ${k?'':'disabled'} data-g="${k?l[k-1].id:''}">‹ Precedente</button><button ${l[k+1]?'':'disabled'} data-g="${l[k+1]?.id??''}">Successivo ›</button></div>`;
  $('#bk').onclick=()=>history.length>1?history.back():location.hash='';
  d.querySelectorAll('.nav button').forEach(x=>x.onclick=()=>location.replace('#/libro/'+x.dataset.g));
}
function route(){
  const m=location.hash.match(/^#\/libro\/(.+)$/);
  $('#home').hidden=!!m;$('#detail').hidden=!m;
  if(m){detail(decodeURIComponent(m[1]));scrollTo(0,0);}
}
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
$('#seg').onclick=e=>{const m=e.target.dataset.m;if(!m)return;mode=m;localStorage.setItem('mode',m);
  document.startViewTransition&&!still?document.startViewTransition(layout):layout();}; // riordino animato (View Transitions API)
$('#q').oninput=layout;
addEventListener('hashchange',route);layout();route();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
