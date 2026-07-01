const form = document.querySelector("#diagnosisForm");
const result = document.querySelector("#diagnosisResult");
const calculatorForm = document.querySelector("#calculatorForm");
const calculatorResult = document.querySelector("#calculatorResult");

// 診断結果データ
const carrierRecommendations = {
  docomo: {
    title: "ドコモユーザーは、まずドコモ光",
    body: "ドコモスマホを使っているなら、ドコモ光セット割の対象になるか確認しましょう。家族でドコモ回線が多いほど、毎月の割引メリットを出しやすくなります。",
    link: '<a class="button primary" href="docomo.html" style="margin-top: 12px; display: inline-flex;">ドコモ光の詳細を見る</a>'
  },
  softbank: {
    title: "SoftBank / Y!mobileユーザーは、ソフトバンク光",
    body: "おうち割 光セットの対象条件を確認しましょう。固定電話オプションなどが条件になる場合があるので、スマホ割の合計額とオプション費用をセットで見るのがコツです。",
    link: '<a class="button primary" href="softbank.html" style="margin-top: 12px; display: inline-flex;">ソフトバンク光の詳細を見る</a>'
  },
  au: {
    title: "au / UQ mobileユーザーは、auひかり",
    body: "auスマートバリューやUQ mobileの対象条件を確認しましょう。auひかりは提供エリアやマンションタイプで申し込み可否が変わるため、住所確認が重要です。",
    link: '<a class="button primary" href="au.html" style="margin-top: 12px; display: inline-flex;">auひかりの詳細を見る</a>'
  },
  none: {
    title: "キャリアにこだわらないなら、2年総額で比較",
    body: "スマホ割が使えない場合は、月額、工事費、キャッシュバック、違約金補助、開通までの日数を合算して比べると選びやすくなります。",
    link: '<a class="button secondary" href="#fee-comparison" style="margin-top: 12px; display: inline-flex;">料金比較表を見る</a>'
  }
};

// 優先事項のヒント
function priorityHint(priority) {
  if (priority === "phone") return "スマホセット割を最優先にして、家族の対象回線数まで確認しましょう。";
  if (priority === "price") return "月額だけでなく、工事費とキャッシュバックの受け取り条件まで含めて見ましょう。";
  if (priority === "speed") return "速度重視なら、IPv6対応、建物の配線方式、利用者の口コミ、提供エリアを確認しましょう。";
  if (priority === "campaign") return "キャッシュバックや違約金補助などのキャンペーン条件を比較して、初期費用を最小化しましょう。";
  return "手続き重視なら、転用・事業者変更が使えるか、開通前に旧回線を解約しないことが大切です。";
}

// 住まいタイプのヒント
function homeHint(home) {
  if (home === "house") {
    return "戸建ては工事費と月額が高めになりやすいので、キャンペーン込みの総額で比較しましょう。";
  }
  return "マンションは建物設備で選べる回線が変わります。部屋番号まで入れて提供エリアを確認しましょう。";
}

// 現在回線のヒント
function currentLineHint(currentLine, priority) {
  if (currentLine === "flets" && priority === "easy") {
    return "フレッツ光からは転用・事業者変更で工事なし乗り換えが可能です。手続きの簡単さを重視するならドコモ光が候補になります。";
  }
  if (currentLine === "other-hikari" && priority === "campaign") {
    return "他社光回線からの乗り換えなら、違約金補助キャンペーンを比較して初期費用を抑えましょう。";
  }
  return "";
}

// 診断フォーム処理
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const carrier = data.get("carrier");
  const priority = data.get("priority");
  const home = data.get("home");
  const phoneLines = data.get("phoneLines");
  const currentLine = data.get("currentLine");
  const picked = carrierRecommendations[carrier];

  const linesHint = phoneLines >= 3
    ? `家族${phoneLines}回線分のセット割を活用すると、月数千円以上の節約が期待できます。`
    : "";

  result.innerHTML = `
    <strong>${picked.title}</strong>
    <p>${picked.body}</p>
    ${linesHint ? `<p>${linesHint}</p>` : ""}
    <p>${priorityHint(priority)}</p>
    <p>${homeHint(home)}</p>
    ${currentLineHint(currentLine, priority) ? `<p>${currentLineHint(currentLine, priority)}</p>` : ""}
    ${picked.link}
  `;
});

// 料金データ（戸建て）- 工事費無料キャンペーン適用中
const feeDataHouse = {
  docomo: { monthly: 5480, construction: 0, discountPerLine: 1100 },
  softbank: { monthly: 5720, construction: 0, discountPerLine: 1100 },
  au: { monthly: 4928, construction: 0, discountPerLine: 1100 }
};

// 料金データ（マンション）- 工事費無料キャンペーン適用中
const feeDataMansion = {
  docomo: { monthly: 3850, construction: 0, discountPerLine: 1100 },
  softbank: { monthly: 3700, construction: 0, discountPerLine: 1100 },
  au: { monthly: 3300, construction: 0, discountPerLine: 1100 }
};

// 2年間総額計算（月単位）
function calculateTwoYearTotal(monthlyFee, construction, phoneLines, discountPerLine, cashback, penalty) {
  const monthlyDiscount = phoneLines * discountPerLine;
  const netMonthly = Math.max(0, monthlyFee - monthlyDiscount);
  const twoYearMonthly = netMonthly * 24;
  const netConstruction = Math.max(0, construction - cashback);
  const total = twoYearMonthly + netConstruction - penalty;
  return total;
}

// 実質月額計算
function calculateEffectiveMonthly(total) {
  return Math.round(total / 24);
}

// 計算機フォーム処理
calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(calculatorForm);
  const homeType = data.get("homeType");
  const phoneLines = parseInt(data.get("phoneLines")) || 0;
  const cashback = parseInt(data.get("cashback")) || 0;
  const penalty = parseInt(data.get("penalty")) || 0;

  const feeData = homeType === "house" ? feeDataHouse : feeDataMansion;

  const results = Object.entries(feeData).map(([carrier, data]) => {
    const total = calculateTwoYearTotal(
      data.monthly,
      data.construction,
      phoneLines,
      data.discountPerLine,
      cashback,
      penalty
    );
    const effectiveMonthly = calculateEffectiveMonthly(total);

    const carrierNames = {
      docomo: "ドコモ光",
      softbank: "ソフトバンク光",
      au: "auひかり"
    };

    return {
      carrier: carrierNames[carrier],
      total: total,
      monthly: effectiveMonthly,
      monthlyFee: data.monthly,
      discount: phoneLines * data.discountPerLine
    };
  }).sort((a, b) => a.monthly - b.monthly);

  calculatorResult.innerHTML = `
    <h3>計算結果</h3>
    <p class="calc-summary">条件：${homeType === "house" ? "戸建て" : "マンション"}、スマホ${phoneLines}回線、キャッシュバック${cashback.toLocaleString()}円、違約金補助${penalty.toLocaleString()}円</p>
    <div class="calc-results">
      ${results.map((r, i) => `
        <div class="calc-result-card ${i === 0 ? "best" : ""}">
          ${i === 0 ? '<span class="best-badge">おすすめ</span>' : ''}
          <h4>${r.carrier}</h4>
          <dl>
            <dt>実質月額</dt>
            <dd class="price">${r.monthly.toLocaleString()}円</dd>
            <dt>月額料金</dt>
            <dd>${r.monthlyFee.toLocaleString()}円</dd>
            ${r.discount > 0 ? `<dt>セット割引</dt>
            <dd class="discount">-${r.discount.toLocaleString()}円/月</dd>` : ''}
            <dt>2年間総額</dt>
            <dd>${r.total.toLocaleString()}円</dd>
          </dl>
        </div>
      `).join("")}
    </div>
    <p class="calc-note">※実質月額＝2年間総額÷24ヶ月（セット割・キャッシュバック・違約金補助を含む）</p>
  `;
});

// 料金比較表タブ切り替え
const feeTabs = document.querySelectorAll(".fee-tab");
const feeTableBody = document.querySelector("#feeTableBody");

if (feeTabs.length > 0) {
  feeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      feeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const tabType = tab.dataset.tab;
      updateFeeTable(tabType);
    });
  });
}

function updateFeeTable(type) {
  const data = type === "house" ? feeDataHouse : feeDataMansion;

  feeTableBody.innerHTML = Object.entries(data).map(([carrier, d]) => {
    // 実質月額計算: 基本料金 - セット割 - キャッシュバック分(30,000円÷24ヶ月=1,250円)
    const realMonthly = d.monthly - d.discountPerLine - 1250;

    const carrierNames = {
      docomo: { name: "ドコモ光", plan: "ホーム1ギガ" },
      softbank: { name: "ソフトバンク光", plan: "基本プラン" },
      au: { name: "auひかり", plan: "home1" }
    };

    const mansionPlans = {
      docomo: "マンションタイプ",
      softbank: "マンションタイプ",
      au: "マンションタイプ"
    };

    // auひかりを最初に表示
    const order = ['au', 'docomo', 'softbank'];
    if (!order.includes(carrier)) return '';

    return `
      <tr data-carrier="${carrier}">
        <td><strong>${carrierNames[carrier].name}</strong><br><small>${type === "house" ? carrierNames[carrier].plan : mansionPlans[carrier]}</small></td>
        <td>${d.monthly.toLocaleString()}円</td>
        <td>-${d.discountPerLine.toLocaleString()}円/月</td>
        <td><span class="cashback">30,000円</span></td>
        <td><span class="free">無料</span></td>
        <td><strong class="real-price">${realMonthly.toLocaleString()}円</strong></td>
      </tr>
    `;
  }).join("");
}
