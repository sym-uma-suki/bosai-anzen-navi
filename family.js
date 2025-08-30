// 家族データ（ダミー）
const family = [
  { name: "お母さん", battery: 68, location: "自宅" },
  { name: "お父さん", battery: 32, location: "避難所" },
  { name: "子供", battery: 15, location: "移動中" }
];

// 家族リストを表示
function renderFamily() {
  const listDiv = document.getElementById("familyList");
  listDiv.innerHTML = "";
  family.forEach(member => {
    const div = document.createElement("div");
    div.textContent = `${member.name} - 電池残量 ${member.battery}% - 場所: ${member.location}`;
    if (member.battery < 20) div.style.color = "red"; // バッテリー少ないと赤文字
    listDiv.appendChild(div);
  });
}

// AI安心メッセージを生成
function generateMessage() {
  const status = document.getElementById("statusSelect").value;
  let msg = "";

  if (status === "home") {
    msg = "現在自宅で安全に待機しています。心配しないでください。";
  } else if (status === "shelter") {
    msg = "無事に避難所に到着しました。安心してください。";
  } else if (status === "moving") {
    msg = "避難中ですが、安全に移動しています。連絡はまたします。";
  }

  document.getElementById("messageArea").innerText = "提案: " + msg;
  window.generatedMessage = msg; // グローバル保存
}

// 送信（デモ → 本番はLINE/メールAPIに繋げる）
function sendMessage() {
  if (window.generatedMessage) {
    alert("家族に送信しました（デモ）:\n" + window.generatedMessage);
  } else {
    alert("まずメッセージを生成してください。");
  }
}

renderFamily();
