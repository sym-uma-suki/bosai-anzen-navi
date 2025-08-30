// Enhanced client-side app (PWA-capable)
let map, userMarker, sheltersLayer;
let lang = 'ja';
const sheltersUrl = 'data/shelters.json'; // optional: replace with real API

window.addEventListener('load', async () => {
  initMap();
  bindUI();
  loadChecklist();
  registerPWAInstall();
  // try to register SW if available
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('sw.js'); console.log('sw ok'); } catch(e){console.warn(e)}
  }
});

function initMap(){
  map = L.map('map', { zoomControl:false }).setView([35.681236,139.767125], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);
  sheltersLayer = L.layerGroup().addTo(map);
}

function bindUI(){
  document.getElementById('locBtn').onclick = getLocation;
  document.getElementById('shelterBtn').onclick = showShelters;
  document.getElementById('sosBtn').onclick = sendSOS;
  document.getElementById('langBtn').onclick = toggleLanguage;
  document.getElementById('shareChecklist').onclick = shareChecklist;
}

function getLocation(){
  if (!navigator.geolocation) { alert('位置情報に対応していません'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    if (userMarker) userMarker.remove();
    userMarker = L.marker([lat,lon]).addTo(map).bindPopup(lang==='ja'?'現在地':'You are here').openPopup();
    map.setView([lat,lon],15);
  }, err => alert((lang==='ja'?'位置情報を取得できませんでした':'Cannot get location')));
}

async function showShelters(){
  sheltersLayer.clearLayers();
  try{
    const res = await fetch(sheltersUrl);
    const data = await res.json();
    data.forEach(s => {
      const m = L.marker([s.lat, s.lng]).addTo(sheltersLayer);
      const html = `<strong>${s.name}</strong><br/>収容:${s.capacity}  バリアフリー:${s.barrier_free? '◯':'×'}<br/>混雑:${s.crowd}`;
      m.bindPopup(html);
    });
  }catch(e){
    // fallback sample
    const sample = [
      {name:'第一避難所', lat:35.684, lng:139.770, capacity:800, barrier_free:true, crowd:'空きあり'},
      {name:'第二避難所', lat:35.679, lng:139.760, capacity:600, barrier_free:false, crowd:'混雑'}
    ];
    sample.forEach(s => {
      L.marker([s.lat,s.lng]).addTo(sheltersLayer).bindPopup(`<strong>${s.name}</strong><br/>${s.crowd}`);
    });
  }
}

function sendSOS(){
  if (confirm(lang==='ja'?'本当にSOSを発信しますか？':'Send SOS?')){
    // For demo: open phone dial; production: integrate emergency API or auto-send to contacts
    window.location.href = 'tel:119';
  }
}

function toggleLanguage(){
  lang = (lang==='ja') ? 'en' : 'ja';
  document.getElementById('title')?.textContent = (lang==='ja') ? '防災安心ナビ' : 'Disaster Safety Navi';
  document.getElementById('statusTitle').textContent = (lang==='ja') ? '状況' : 'Status';
}

function loadChecklist(){
  const list = [
    {item:'飲料水（3日分）', ok:false},
    {item:'非常食（3日分）', ok:false},
    {item:'モバイルバッテリー', ok:true},
  ];
  const ul = document.getElementById('checklist');
  ul.innerHTML = '';
  list.forEach(it => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${it.item}</span><span>${it.ok? '✅':'⬜'}</span>`;
    ul.appendChild(li);
  });
}

function shareChecklist(){
  const txt = Array.from(document.querySelectorAll('#checklist li')).map(li => li.textContent.trim()).join('\n');
  if (navigator.share) navigator.share({title:'防災チェックリスト', text:txt}).catch(()=>null);
  else { navigator.clipboard.writeText(txt); alert('コピーしました'); }
}

function registerPWAInstall(){
  let deferred;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    document.getElementById('installBtn').style.display = 'inline-block';
  });
  document.getElementById('installBtn').onclick = async () => {
    if (deferred){ deferred.prompt(); deferred=null; }
  };
}
