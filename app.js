const HUE={Pentateuco:28,Storici:210,Poetici:300,Profeti:150,Vangeli:45,Storia:195,Lettere:10,Profezia:270};
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-');
const B=BOOKS.map((r,i)=>({i,id:slug(r[0]),n:r[0],t:r[1],c:r[2],a:r[3],p:r[4],y:r[5],ys:r[6],ns:r[7],nt:r[8]}));
// Ordini: ciascuna lista è già ordinata (a parità di valore resta l'ordine biblico)
const ORD={bib:[...B],cro:[...B].sort((a,b)=>a.ns-b.ns||a.i-b.i),wri:[...B].sort((a,b)=>a.y-b.y||a.i-b.i)};
const pos={};for(const m in ORD)ORD[m].forEach((b,k)=>(pos[m+b.id]=k+1));
let mode=localStorage.getItem('mode')||'bib';if(!ORD[mode])mode='bib';
const $=s=>document.querySelector(s),grid=$('#grid'),cards={};
B.forEach(b=>{const e=document.createElement('button');e.className='card';e.style.setProperty('--h',HUE[b.c]);e.innerHTML=`<small></small>${b.n}`;e.onclick=()=>location.hash='#/libro/'+b.id;cards[b.id]=e;});
function renderGrid(animate){
  const q=slug($('#q').value.trim()),old={};
  if(animate)for(const id in cards)old[id]=cards[id].getBoundingClientRect();
  grid.replaceChildren(...ORD[mode].filter(b=>slug(b.n).includes(q)).map(b=>{cards[b.id].firstChild.textContent=pos[mode+b.id];return cards[b.id];}));
  document.querySelectorAll('#seg button').forEach(x=>x.classList.toggle('on',x.dataset.m===mode));
  if(!animate||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  for(const id in cards){const e=cards[id];if(!e.isConnected)continue;const n=e.getBoundingClientRect(),dx=old[id].left-n.left,dy=old[id].top-n.top;
    if(dx||dy)e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:380,easing:'ease'});}
}
function showDetail(id){
  const l=ORD[mode],k=l.findIndex(b=>b.id===id),b=l[k];if(!b)return location.hash='';
  const d=$('#detail');
  d.innerHTML=`<button class="back" onclick="history.length>1?history.back():location.hash=''">‹ Libri</button>
  <h2>${b.n}</h2><p class="tag">${b.t==='AT'?'Antico':'Nuovo'} Testamento · ${b.c}</p>
  <dl><dt>Scrittore</dt><dd>${b.a}</dd><dt>Luogo in cui fu scritto</dt><dd>${b.p}</dd>
  <dt>Anno di completamento</dt><dd>${b.ys}</dd><dt>Periodo a cui si riferisce</dt><dd>${b.nt}</dd></dl>
  <div class="nav"><button ${k?'':'disabled'} data-g="${k?l[k-1].id:''}">‹ Precedente</button><button ${l[k+1]?'':'disabled'} data-g="${l[k+1]?l[k+1].id:''}">Successivo ›</button></div>`;
  d.querySelectorAll('.nav button').forEach(x=>x.onclick=()=>location.replace('#/libro/'+x.dataset.g));
}
function route(){
  const m=location.hash.match(/^#\/libro\/(.+)$/);
  $('#home').hidden=!!m;$('#detail').hidden=!m;
  if(m){showDetail(decodeURIComponent(m[1]));scrollTo(0,0);}
}
$('#seg').onclick=e=>{const m=e.target.dataset.m;if(!m)return;mode=m;localStorage.setItem('mode',m);renderGrid(true);};
$('#q').oninput=()=>renderGrid(false);
addEventListener('hashchange',route);renderGrid(false);route();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
