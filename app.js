let map;
let userMarker;
let lang = "ja"; // 言語設定

// ページ読み込み時に地図を初期化
window.onload = () => {
  map = L.map('map').setView([35.681236, 139.767125], 13); // 東京駅あたり
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
};

// 現在地を取得
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([lat, lon]).addTo(map).bindPopup("あなたの現在地");
      map.setView([lat, lon], 15);
    }, () => {
      alert("位置情報を取得できませんでした");
    });
  } else {
    alert("この端末では位置情報が使えません");
  }
}

// 避難所表示（サンプルデータ）
function showShelters() {
  const shelters = [
    { name: "第一避難所", lat: 35.684, lon: 139.770 },
    { name: "第二避難所", lat: 35.679, lon: 139.760 }
  ];
  shelters.forEach(s => {
    L.marker([s.lat, s.lon]).addTo(map).bindPopup(s.name);
  });
}

// 言語切り替え
function toggleLanguage() {
  lang = (lang === "ja") ? "en" : "ja";
  document.getElementById("title").textContent = 
    (lang === "ja") ? "防災安心ナビ" : "Disaster Safety Navi";
  alert((lang === "ja") ? "日本語に切り替えました" : "Switched to English");
}
