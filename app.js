const K='buku_supplier_v1';
let d=JSON.parse(localStorage.getItem(K)||'{"sales":[],"debt":[],"expense":[]}');

const rp=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const save=()=>{localStorage.setItem(K,JSON.stringify(d));sum();};

function sum(){
  const a=d.sales.reduce((x,y)=>x+(Number(y.total)||0),0);
  const b=d.debt.reduce((x,y)=>x+(Number(y.total)||0),0);
  const c=d.expense.reduce((x,y)=>x+(Number(y.total)||0),0);
  salesEl.textContent=rp(a); debtEl.textContent=rp(b); expenseEl.textContent=rp(c); netEl.textContent=rp(a-b-c);
}

const salesEl=document.getElementById('sales'), debtEl=document.getElementById('debt'), expenseEl=document.getElementById('expense'), netEl=document.getElementById('net');
today.textContent=new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});

function show(h){form.classList.remove('hide');form.innerHTML=h;form.scrollIntoView({behavior:'smooth'});}
function closeF(){form.classList.add('hide');}
function val(id){return document.getElementById(id)?.value||'';}

function sales(n){
  show(`<h2>Tagihan — ${esc(n)}</h2>
  <label>Tanggal</label><input id="dt" type="date" value="${new Date().toISOString().slice(0,10)}">
  <label>Total tagihan</label><input id="v" type="number" inputmode="numeric" placeholder="Rp">
  <label>Sudah dibayar</label><input id="p" type="number" inputmode="numeric" value="0">
  <button class="save" onclick="saveSale('${esc(n)}')">Simpan</button>
  <button onclick="closeF()">Batal</button>`);
}
function saveSale(n){
  const v=+val('v')||0;if(!v)return alert('Isi total tagihan.');
  d.sales.push({date:val('dt'),name:n,total:v,paid:+val('p')||0});save();closeF();alert('Tersimpan.');
}

function debt(){
  show(`<h2>Tagihan Barang</h2>
  <label>Tanggal</label><input id="dt" type="date" value="${new Date().toISOString().slice(0,10)}">
  <label>Supplier / barang</label><input id="n" placeholder="Contoh: supplier sayur">
  <label>Total tagihan</label><input id="v" type="number" inputmode="numeric" placeholder="Rp">
  <label>Catatan selisih timbangan</label><input id="note" placeholder="Contoh: kurang 2 kg">
  <button class="save" onclick="saveDebt()">Simpan</button>
  <button onclick="closeF()">Batal</button>`);
}
function saveDebt(){
  const v=+val('v')||0;if(!v)return alert('Isi total tagihan.');
  d.debt.push({date:val('dt'),name:val('n'),total:v,note:val('note')});save();closeF();alert('Tersimpan.');
}

function expense(){
  show(`<h2>Pengeluaran</h2>
  <label>Tanggal</label><input id="dt" type="date" value="${new Date().toISOString().slice(0,10)}">
  <label>Keterangan</label><input id="n" placeholder="Contoh: bensin">
  <label>Jumlah</label><input id="v" type="number" inputmode="numeric" placeholder="Rp">
  <button class="save" onclick="saveExp()">Simpan</button>
  <button onclick="closeF()">Batal</button>`);
}
function saveExp(){
  const v=+val('v')||0;if(!v)return alert('Isi jumlah.');
  d.expense.push({date:val('dt'),name:val('n'),total:v});save();closeF();alert('Tersimpan.');
}

function edit(type,i){
  const arr=d[type], x=arr[i]; if(!x)return;
  if(type==='sales'){
    show(`<h2>Koreksi Tagihan</h2>
    <label>Rumah makan</label><input id="n" value="${esc(x.name)}">
    <label>Tanggal</label><input id="dt" type="date" value="${esc(x.date)}">
    <label>Total yang benar</label><input id="v" type="number" inputmode="numeric" value="${Number(x.total)||0}">
    <label>Sudah dibayar</label><input id="p" type="number" inputmode="numeric" value="${Number(x.paid)||0}">
    <button class="save" onclick="updateItem('sales',${i})">Simpan Koreksi</button>
    <button onclick="closeF()">Batal</button>`);
  } else if(type==='debt'){
    show(`<h2>Koreksi Tagihan Barang</h2>
    <label>Supplier / barang</label><input id="n" value="${esc(x.name)}">
    <label>Tanggal</label><input id="dt" type="date" value="${esc(x.date)}">
    <label>Total yang benar</label><input id="v" type="number" inputmode="numeric" value="${Number(x.total)||0}">
    <label>Catatan selisih timbangan</label><input id="note" value="${esc(x.note)}">
    <button class="save" onclick="updateItem('debt',${i})">Simpan Koreksi</button>
    <button onclick="closeF()">Batal</button>`);
  } else {
    show(`<h2>Koreksi Pengeluaran</h2>
    <label>Keterangan</label><input id="n" value="${esc(x.name)}">
    <label>Tanggal</label><input id="dt" type="date" value="${esc(x.date)}">
    <label>Jumlah yang benar</label><input id="v" type="number" inputmode="numeric" value="${Number(x.total)||0}">
    <button class="save" onclick="updateItem('expense',${i})">Simpan Koreksi</button>
    <button onclick="closeF()">Batal</button>`);
  }
}
function updateItem(type,i){
  const x=d[type][i]; if(!x)return;
  x.name=val('n'); x.date=val('dt'); x.total=+val('v')||0;
  if(type==='sales')x.paid=+val('p')||0;
  if(type==='debt')x.note=val('note');
  save();closeF();report();alert('Koreksi tersimpan. Total sudah dihitung ulang.');
}
function removeItem(type,i){
  if(!confirm('Hapus catatan ini?'))return;
  d[type].splice(i,1);save();report();
}

function list(type,title){
  const arr=d[type];
  if(!arr.length)return `<div class="row"><span>${title}</span><span class="right">Belum ada</span></div>`;
  return arr.map((x,i)=>`<div class="row">
    <b>${esc(x.name||title)}</b><br><small>${esc(x.date||'')}</small>
    ${x.note?`<br><small>${esc(x.note)}</small>`:''}
    <b class="right">${rp(x.total)}</b>
    <div style="clear:both;margin-top:8px;display:flex;gap:7px">
      <button onclick="edit('${type}',${i})" style="flex:1">Koreksi</button>
      <button onclick="removeItem('${type}',${i})" style="flex:1">Hapus</button>
    </div>
  </div>`).join('');
}

function report(){
  const r=document.getElementById('report');
  r.classList.remove('hide');
  const a=d.sales.reduce((x,y)=>x+(Number(y.total)||0),0),b=d.debt.reduce((x,y)=>x+(Number(y.total)||0),0),c=d.expense.reduce((x,y)=>x+(Number(y.total)||0),0);
  r.innerHTML=`<h2>Rekap & Koreksi</h2>
  <div class="row"><b>Total tagihan</b><b class="right">${rp(a)}</b></div>
  ${list('sales','Tagihan rumah makan')}
  <div class="row"><b>Tagihan barang</b><b class="right">${rp(b)}</b></div>
  ${list('debt','Tagihan barang')}
  <div class="row"><b>Pengeluaran</b><b class="right">${rp(c)}</b></div>
  ${list('expense','Pengeluaran')}
  <div class="row"><b>SISA MARGIN NETTO</b><b class="right ${a-b-c<0?'negative':'positive'}">${rp(a-b-c)}</b></div>`;
  r.scrollIntoView({behavior:'smooth'});
}
sum();