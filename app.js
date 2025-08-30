let map, userMarker, sheltersLayer;
let lang = 'ja';
const sheltersUrl = 'data/shelters.json';

window.addEventListener('load', async () => {
  initMap();
  bindUI();
  loadChecklist();
  registerPWAInstall();
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('sw.js'); } catch(e){console.warn(e)}
  }
});

function initMap(){
  map = L.map('map').setView([35.681236,139.767125], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OSM</a>',
    maxZoom: 19
  }).addTo(map);
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
  }, err => alert('位置情報を取得できませんでした'));
}

async function showShelters(){
  sheltersLayer.clearLayers();
  try{
    const res = await fetch(sheltersUrl);
    const data = await res.json();
    data.forEach(s => {
      L.marker([s.lat, s.lng]).addTo(sheltersLayer)
        .bindPopup(`<strong>${s.name}</strong><br/>収容:${s.capacity}<br/>混雑:${s.crowd}`);
    });
  }catch(e){
    console.error(e);
    alert("避難所データを読み込めませんでした");
  }
}

function sendSOS(){
  if (confirm('本当にSOSを発信しますか？')){
    window.location.href = 'tel:119';
  }
}

function toggleLanguage(){
  lang = (lang==='ja') ? 'en' : 'ja';
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
  if (navigator.share) navigator.share({title:'防災チェックリスト', text:txt});
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
