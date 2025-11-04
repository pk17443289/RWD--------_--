const nameInput = document.querySelector("#nameInput");
const itemInput = document.querySelector("#itemInput");
const priceInput = document.querySelector("#priceInput");
const addBtn = document.querySelector("#addBtn");
const confirmBtn = document.querySelector("#confirmBtn");
const endConfirmBtn = document.querySelector("#endConfirmBtn");
const orderList = document.querySelector("#orderList");
const orderCountDisplay = document.querySelector("#orderCount");
const orderTotalPriceDisplay = document.querySelector("#orderTotalPrice");
const historyDiv = document.querySelector("#history");

let orderId = 0;
let orderTotal = 0;
let orderTotalPrice = 0;
let confirmed = false;

// 全形數字轉半形
function toHalfWidth(str) {
    return str.replace(/[\uFF10-\uFF19]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    );
}

// 更新統計
function updateStats() {
    orderCountDisplay.textContent = `目前有 ${orderTotal} 筆訂單`;
    orderTotalPriceDisplay.textContent = `總金額：${orderTotalPrice} 元`;
}

// 新增訂單
addBtn.addEventListener("click", () => {
    if (confirmed) {
        alert("目前正在確認中，無法新增！");
        return;
    }

    let name = nameInput.value.trim();
    const item = itemInput.value.trim();
    const price = Number(priceInput.value.trim());

    if (name === "" || item === "" || isNaN(price) || price <= 0) {
        alert("名字、品項、金額都要正確填！");
        return;
    }

    name = toHalfWidth(name);

    if (/^\d+$/.test(name)) {
        alert("名字不能是純數字！");
        return;
    }

    orderId++;
    const now = new Date();
    const timeStr = now.toLocaleString("zh-TW");

    const li = document.createElement("li");
    li.textContent = `#${orderId} - ${name} 想要 ${item} (${price} 元) （${timeStr}） `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "刪除";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", () => {
        if (confirmed) {
            alert("目前正在確認中，無法刪除！");
            return;
        }
        orderList.removeChild(li);
        orderTotal--;
        orderTotalPrice -= price;
        updateStats();
    });

    li.appendChild(deleteBtn);
    orderList.appendChild(li);

    orderTotal++;
    orderTotalPrice += price;
    updateStats();

    nameInput.value = "";
    itemInput.value = "";
    priceInput.value = "";
});

// 確認訂單
confirmBtn.addEventListener("click", () => {
    if (confirmed) {
        alert("訂單已在確認中！");
        return;
    }

    confirmed = true;
    addBtn.disabled = true;
    confirmBtn.disabled = true;
    endConfirmBtn.disabled = false;

    alert(`訂單已確認 ✅\n總數量：${orderTotal} 筆\n總金額：${orderTotalPrice} 元`);
});

// 結束確認
endConfirmBtn.addEventListener("click", () => {
    confirmed = false;
    addBtn.disabled = false;
    confirmBtn.disabled = false;
    endConfirmBtn.disabled = true;

    // 存到歷史紀錄
    const now = new Date();
    const timeStr = now.toLocaleString("zh-TW");

    const historyItem = document.createElement("div");
    historyItem.style.border = "1px solid #ccc";
    historyItem.style.padding = "10px";
    historyItem.style.marginBottom = "10px";
    historyItem.style.borderRadius = "8px";

    // 抓當前清單的內容
    const orders = Array.from(orderList.children).map(li => li.textContent.replace("刪除", "").trim()).join("<br>");

    historyItem.innerHTML = `
    <p><strong>紀錄時間：</strong>${timeStr}</p>
    <p>${orders || "（無訂單）"}</p>
    <p><strong>總數量：</strong>${orderTotal} 筆</p>
    <p><strong>總金額：</strong>${orderTotalPrice} 元</p>
`;

    // 刪除歷史紀錄按鈕
    const deleteHistoryBtn = document.createElement("button");
    deleteHistoryBtn.textContent = "刪除這筆紀錄";
    deleteHistoryBtn.style.marginTop = "5px";
    deleteHistoryBtn.addEventListener("click", () => {
        historyDiv.removeChild(historyItem);
    });

    historyItem.appendChild(deleteHistoryBtn);
    historyDiv.prepend(historyItem); // 新的放最上面

    // 清空清單
    orderList.innerHTML = "";
    orderId = 0;
    orderTotal = 0;
    orderTotalPrice = 0;
    updateStats();

    addBtn.disabled = false;
    confirmBtn.disabled = false;

    alert("確認結束，這輪訂單已存進歷史紀錄！");
});
