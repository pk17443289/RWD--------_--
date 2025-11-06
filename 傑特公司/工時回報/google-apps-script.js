// ===== Google Apps Script - 倉庫工時回報系統 v3.0 =====
// 請將此程式碼複製到 Google Sheets 的 Apps Script 編輯器中
//
// 資料結構更新：每個工作項目包含 quantity（數量）和 time（時間）兩個欄位
// 例如：{ morning: {quantity: 5, time: 30} }

// 主要處理函數
function doPost(e) {
  try {
    // 取得目前的試算表
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 解析接收到的 JSON 資料
    const data = JSON.parse(e.postData.contents);

    // 準備要寫入的資料列
    const row = [
      // === 基本資訊 (A-C) ===
      data.timestamp,           // A: 提交時間
      data.employeeName,        // B: 員工姓名
      data.reportDate,          // C: 回報日期

      // === 簡單區域 (D-I) ===
      data.morning?.quantity || 0,        // D: 晨會-數量(個)
      data.morning?.time || 0,            // E: 晨會-時間(分)
      data.packaging_machine?.quantity || 0,  // F: 進包裝機-數量(個)
      data.packaging_machine?.time || 0,      // G: 進包裝機-時間(分)
      data.cleaning?.quantity || 0,       // H: 整理環境區-數量(個)
      data.cleaning?.time || 0,           // I: 整理環境區-時間(分)

      // === 進貨區 (J-Y) ===
      data.receiving?.snake?.quantity || 0,      // J: 進貨-拆蛇皮-數量(個)
      data.receiving?.snake?.time || 0,          // K: 進貨-拆蛇皮-時間(分)
      data.receiving?.count?.quantity || 0,      // L: 進貨-數數-數量(個)
      data.receiving?.count?.time || 0,          // M: 進貨-數數-時間(分)
      data.receiving?.sign?.quantity || 0,       // N: 進貨-簽收-數量(個)
      data.receiving?.sign?.time || 0,           // O: 進貨-簽收-時間(分)
      data.receiving?.classify?.quantity || 0,   // P: 進貨-分類樣品與大貨-數量(個)
      data.receiving?.classify?.time || 0,       // Q: 進貨-分類樣品與大貨-時間(分)
      data.receiving?.abnormal?.quantity || 0,   // R: 進貨-異常-數量(個)
      data.receiving?.abnormal?.time || 0,       // S: 進貨-異常-時間(分)
      data.receiving?.shelve?.quantity || 0,     // T: 進貨-大貨上架-數量(個)
      data.receiving?.shelve?.time || 0,         // U: 進貨-大貨上架-時間(分)
      data.receiving?.organize?.quantity || 0,   // V: 進貨-整理環境-數量(個)
      data.receiving?.organize?.time || 0,       // W: 進貨-整理環境-時間(分)
      data.receiving?.clean?.quantity || 0,      // X: 進貨-打掃進貨區環境-數量(個)
      data.receiving?.clean?.time || 0,          // Y: 進貨-打掃進貨區環境-時間(分)

      // === 檢貨區 (Z-AH) ===
      data.picking?.fetch?.quantity || 0,        // Z: 檢貨-去各個地方取貨-數量(個)
      data.picking?.fetch?.time || 0,            // AA: 檢貨-去各個地方取貨-時間(分)
      data.picking?.unbox_damaged?.quantity || 0, // AB: 檢貨-拆破損箱子-數量(個)
      data.picking?.unbox_damaged?.time || 0,     // AC: 檢貨-拆破損箱子-時間(分)
      data.picking?.stick_c?.quantity || 0,      // AD: 檢貨-把C料號黏在一起-數量(個)
      data.picking?.stick_c?.time || 0,          // AE: 檢貨-把C料號黏在一起-時間(分)
      data.picking?.separate?.quantity || 0,     // AF: 檢貨-分手包與包裝機包-數量(個)
      data.picking?.separate?.time || 0,         // AG: 檢貨-分手包與包裝機包-時間(分)
      data.picking?.machine?.quantity || 0,      // AH: 檢貨-過包裝機-數量(個)
      data.picking?.machine?.time || 0,          // AI: 檢貨-過包裝機-時間(分)

      // === 包貨區 (AJ-AQ) ===
      data.packing?.hand_pack?.quantity || 0,    // AJ: 包貨-手包-數量(個)
      data.packing?.hand_pack?.time || 0,        // AK: 包貨-手包-時間(分)
      data.packing?.machine_sticker?.quantity || 0, // AL: 包貨-包裝機-數量(個)
      data.packing?.machine_sticker?.time || 0,     // AM: 包貨-包裝機-時間(分)
      data.packing?.box?.quantity || 0,          // AN: 包貨-拿箱子裝貨-數量(個)
      data.packing?.box?.time || 0,              // AO: 包貨-拿箱子裝貨-時間(分)
      data.packing?.clean_area?.quantity || 0,   // AP: 包貨-整理環境-數量(個)
      data.packing?.clean_area?.time || 0,       // AQ: 包貨-整理環境-時間(分)

      // === 退貨區 (AR-BB) ===
      data.returns?.return_3day?.quantity || 0,  // AR: 退貨-退貨3天內-數量(個)
      data.returns?.return_3day?.time || 0,      // AS: 退貨-退貨3天內-時間(分)
      data.returns?.return_clear?.quantity || 0, // AT: 退貨-退清-數量(個)
      data.returns?.return_clear?.time || 0,     // AU: 退貨-退清-時間(分)
      data.returns?.inspect?.quantity || 0,      // AV: 退貨-檢測-數量(個)
      data.returns?.inspect?.time || 0,          // AW: 退貨-檢測-時間(分)
      data.returns?.sign?.quantity || 0,         // AX: 退貨-簽收-數量(個)
      data.returns?.sign?.time || 0,             // AY: 退貨-簽收-時間(分)
      data.returns?.shelve?.quantity || 0,       // AZ: 退貨-上架-數量(個)
      data.returns?.shelve?.time || 0,           // BA: 退貨-上架-時間(分)
      data.returns?.abnormal?.quantity || 0,     // BB: 退貨-異常退貨-數量(個)
      data.returns?.abnormal?.time || 0,         // BC: 退貨-異常退貨-時間(分)

      // === MO+店區 (BD-BK) ===
      data.mo_shop?.print?.quantity || 0,        // BD: MO店-印單-數量(個)
      data.mo_shop?.print?.time || 0,            // BE: MO店-印單-時間(分)
      data.mo_shop?.fetch_b?.quantity || 0,      // BF: MO店-去B棟拿商品-數量(個)
      data.mo_shop?.fetch_b?.time || 0,          // BG: MO店-去B棟拿商品-時間(分)
      data.mo_shop?.pick?.quantity || 0,         // BH: MO店-撿貨-數量(個)
      data.mo_shop?.pick?.time || 0,             // BI: MO店-撿貨-時間(分)
      data.mo_shop?.ship?.quantity || 0,         // BJ: MO店-出貨-數量(個)
      data.mo_shop?.ship?.time || 0,             // BK: MO店-出貨-時間(分)

      // === 酷澎區 (BL-BU) ===
      data.kupon?.check?.quantity || 0,          // BL: 酷澎-檢貨-數量(個)
      data.kupon?.check?.time || 0,              // BM: 酷澎-檢貨-時間(分)
      data.kupon?.unbox?.quantity || 0,          // BN: 酷澎-拆盒-數量(個)
      data.kupon?.unbox?.time || 0,              // BO: 酷澎-拆盒-時間(分)
      data.kupon?.pack?.quantity || 0,           // BP: 酷澎-包貨-數量(個)
      data.kupon?.pack?.time || 0,               // BQ: 酷澎-包貨-時間(分)
      data.kupon?.arrange?.quantity || 0,        // BR: 酷澎-擺貨-數量(個)
      data.kupon?.arrange?.time || 0,            // BS: 酷澎-擺貨-時間(分)
      data.kupon?.inventory?.quantity || 0,      // BT: 酷澎-盤點-數量(個)
      data.kupon?.inventory?.time || 0,          // BU: 酷澎-盤點-時間(分)

      // === 盤點區 (BV-BY) ===
      data.inventory?.duty?.quantity || 0,       // BV: 盤點-值日生-數量(個)
      data.inventory?.duty?.time || 0,           // BW: 盤點-值日生-時間(分)
      data.inventory?.count_goods?.quantity || 0, // BX: 盤點-盤點商品-數量(個)
      data.inventory?.count_goods?.time || 0,     // BY: 盤點-盤點商品-時間(分)

      // === 其他 (BZ) ===
      formatCustomItems(data.others), // BZ: 其他（合併自訂項目）

      // === 統計 (CA-CC) ===
      data.totalTime || 0,            // CA: 總時間(分)
      data.remainingTime || 0,        // CB: 剩餘時間(分)
      data.averageTime || 0           // CC: 平均時間(分/區)
    ];

    // 將資料新增到試算表
    sheet.appendRow(row);

    // 返回成功訊息
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': '資料已成功儲存'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    Logger.log('錯誤: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 格式化自訂項目
function formatCustomItems(customItems) {
  if (!customItems || customItems.length === 0) {
    return '';
  }

  // 將自訂項目格式化成字串："項目名稱(時間分鐘), 項目名稱(時間分鐘)"
  const formatted = customItems.map(item => {
    return `${item.name}(${item.value}分)`;
  }).join(', ');

  return formatted;
}

// 初始化試算表標題（首次使用時執行一次）
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 設定標題列
  const headers = [
    // 基本資訊 (A-C)
    '提交時間', '員工姓名', '回報日期',

    // 簡單區域 (D-I)
    '晨會-數量(個)', '晨會-時間(分)',
    '進包裝機-數量(個)', '進包裝機-時間(分)',
    '整理環境區-數量(個)', '整理環境區-時間(分)',

    // 進貨區 (J-Y)
    '進貨-拆蛇皮-數量(個)', '進貨-拆蛇皮-時間(分)',
    '進貨-數數-數量(個)', '進貨-數數-時間(分)',
    '進貨-簽收-數量(個)', '進貨-簽收-時間(分)',
    '進貨-分類樣品與大貨-數量(個)', '進貨-分類樣品與大貨-時間(分)',
    '進貨-異常-數量(個)', '進貨-異常-時間(分)',
    '進貨-大貨上架-數量(個)', '進貨-大貨上架-時間(分)',
    '進貨-整理環境-數量(個)', '進貨-整理環境-時間(分)',
    '進貨-打掃進貨區環境-數量(個)', '進貨-打掃進貨區環境-時間(分)',

    // 檢貨區 (Z-AH)
    '檢貨-去各個地方取貨-數量(個)', '檢貨-去各個地方取貨-時間(分)',
    '檢貨-拆破損箱子-數量(個)', '檢貨-拆破損箱子-時間(分)',
    '檢貨-把C料號黏在一起-數量(個)', '檢貨-把C料號黏在一起-時間(分)',
    '檢貨-分手包與包裝機包-數量(個)', '檢貨-分手包與包裝機包-時間(分)',
    '檢貨-過包裝機-數量(個)', '檢貨-過包裝機-時間(分)',

    // 包貨區 (AJ-AQ)
    '包貨-手包-數量(個)', '包貨-手包-時間(分)',
    '包貨-包裝機-數量(個)', '包貨-包裝機-時間(分)',
    '包貨-拿箱子裝貨-數量(個)', '包貨-拿箱子裝貨-時間(分)',
    '包貨-整理環境-數量(個)', '包貨-整理環境-時間(分)',

    // 退貨區 (AR-BC)
    '退貨-退貨3天內-數量(個)', '退貨-退貨3天內-時間(分)',
    '退貨-退清-數量(個)', '退貨-退清-時間(分)',
    '退貨-檢測-數量(個)', '退貨-檢測-時間(分)',
    '退貨-簽收-數量(個)', '退貨-簽收-時間(分)',
    '退貨-上架-數量(個)', '退貨-上架-時間(分)',
    '退貨-異常退貨-數量(個)', '退貨-異常退貨-時間(分)',

    // MO+店區 (BD-BK)
    'MO店-印單-數量(個)', 'MO店-印單-時間(分)',
    'MO店-去B棟拿商品-數量(個)', 'MO店-去B棟拿商品-時間(分)',
    'MO店-撿貨-數量(個)', 'MO店-撿貨-時間(分)',
    'MO店-出貨-數量(個)', 'MO店-出貨-時間(分)',

    // 酷澎區 (BL-BU)
    '酷澎-檢貨-數量(個)', '酷澎-檢貨-時間(分)',
    '酷澎-拆盒-數量(個)', '酷澎-拆盒-時間(分)',
    '酷澎-包貨-數量(個)', '酷澎-包貨-時間(分)',
    '酷澎-擺貨-數量(個)', '酷澎-擺貨-時間(分)',
    '酷澎-盤點-數量(個)', '酷澎-盤點-時間(分)',

    // 盤點區 (BV-BY)
    '盤點-值日生-數量(個)', '盤點-值日生-時間(分)',
    '盤點-盤點商品-數量(個)', '盤點-盤點商品-時間(分)',

    // 其他 (BZ)
    '其他',

    // 統計 (CA-CC)
    '總時間(分)', '剩餘時間(分)', '平均時間(分/區)'
  ];

  // 寫入標題
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 格式化標題列
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#FFD700');
  headerRange.setFontColor('#000000');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setWrap(true);

  // 凍結標題列
  sheet.setFrozenRows(1);

  // 設定欄寬
  sheet.setColumnWidth(1, 150);  // 提交時間
  sheet.setColumnWidth(2, 100);  // 員工姓名
  sheet.setColumnWidth(3, 100);  // 回報日期

  // 其他欄位自動調整寬度
  for (let i = 4; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 100);
  }

  // 其他欄位寬一點
  sheet.setColumnWidth(headers.length - 3, 200);  // 其他欄位

  Logger.log('試算表標題設定完成！共 ' + headers.length + ' 欄');
}

// 測試函數（可選）
function testDoPost() {
  const testData = {
    timestamp: new Date().toLocaleString('zh-TW'),
    employeeName: '測試員工',
    reportDate: '2025-01-06',

    // 簡單區域
    morning: { quantity: 5, time: 30 },
    packaging_machine: { quantity: 10, time: 50 },
    cleaning: { quantity: 3, time: 20 },

    // 進貨區
    receiving: {
      snake: { quantity: 15, time: 60 },
      count: { quantity: 200, time: 90 },
      sign: { quantity: 5, time: 10 },
      classify: { quantity: 50, time: 25 },
      abnormal: { quantity: 2, time: 5 },
      shelve: { quantity: 100, time: 40 },
      organize: { quantity: 1, time: 15 },
      clean: { quantity: 1, time: 10 }
    },

    // 檢貨區
    picking: {
      fetch: { quantity: 30, time: 20 },
      unbox_damaged: { quantity: 10, time: 15 },
      stick_c: { quantity: 20, time: 25 },
      separate: { quantity: 50, time: 30 },
      machine: { quantity: 40, time: 20 }
    },

    // 包貨區
    packing: {
      hand_pack: { quantity: 60, time: 40 },
      machine_sticker: { quantity: 80, time: 30 },
      box: { quantity: 25, time: 20 },
      clean_area: { quantity: 1, time: 15 }
    },

    // 退貨區
    returns: {
      return_3day: { quantity: 15, time: 20 },
      return_clear: { quantity: 10, time: 15 },
      inspect: { quantity: 20, time: 10 },
      sign: { quantity: 3, time: 5 },
      shelve: { quantity: 25, time: 15 },
      abnormal: { quantity: 5, time: 10 }
    },

    // MO+店區
    mo_shop: {
      print: { quantity: 50, time: 10 },
      fetch_b: { quantity: 30, time: 20 },
      pick: { quantity: 40, time: 25 },
      ship: { quantity: 35, time: 15 }
    },

    // 酷澎區
    kupon: {
      check: { quantity: 25, time: 15 },
      unbox: { quantity: 20, time: 10 },
      pack: { quantity: 30, time: 20 },
      arrange: { quantity: 40, time: 15 },
      inventory: { quantity: 100, time: 10 }
    },

    // 盤點區
    inventory: {
      duty: { quantity: 1, time: 15 },
      count_goods: { quantity: 50, time: 25 }
    },

    // 其他
    others: [
      { name: '會議', value: 30 },
      { name: '訓練', value: 20 }
    ],

    // 統計
    totalTime: 480,
    remainingTime: 0,
    averageTime: 44
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}

// 建立統計工作表
function createStatsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 創建或取得統計工作表
  let statsSheet = ss.getSheetByName('員工統計');
  if (!statsSheet) {
    statsSheet = ss.insertSheet('員工統計');
  } else {
    statsSheet.clear();
  }

  // 取得資料工作表
  const dataSheet = ss.getSheets()[0];
  const lastRow = dataSheet.getLastRow();

  if (lastRow <= 1) {
    statsSheet.getRange('A1').setValue('尚無資料');
    return;
  }

  // 設定統計表標題
  const statsHeaders = [
    '員工姓名',
    '回報次數',
    '平均總時間(分)',
    '最常使用區域',
    '最後回報日期'
  ];

  statsSheet.getRange(1, 1, 1, statsHeaders.length).setValues([statsHeaders]);

  // 格式化標題
  const headerRange = statsSheet.getRange(1, 1, 1, statsHeaders.length);
  headerRange.setBackground('#FF6B00');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 凍結標題列
  statsSheet.setFrozenRows(1);

  // 這裡可以加入更複雜的統計邏輯
  // 例如使用 QUERY 函數或 Apps Script 來計算統計資料

  Logger.log('統計工作表已創建！');
}

// 資料驗證函數
function validateData(data) {
  // 檢查必填欄位
  if (!data.employeeName || data.employeeName.trim() === '') {
    throw new Error('員工姓名為必填欄位');
  }

  if (!data.reportDate) {
    throw new Error('回報日期為必填欄位');
  }

  // 檢查姓名不為純數字
  if (/^\d+$/.test(data.employeeName)) {
    throw new Error('員工姓名不能為純數字');
  }

  return true;
}

// 自動發送通知（可選,需要設定 Email）
function sendNotification(data) {
  const recipient = 'your-email@example.com'; // 請修改成你的 Email

  const subject = `倉庫工時回報 - ${data.employeeName} - ${data.reportDate}`;

  let body = `
員工姓名：${data.employeeName}
回報日期：${data.reportDate}
提交時間：${data.timestamp}

=== 工作時間統計 ===
總時間：${data.totalTime} 分鐘 (${(data.totalTime/60).toFixed(1)} 小時)
剩餘時間：${data.remainingTime} 分鐘
平均時間：${data.averageTime} 分鐘/區

=== 詳細資料 ===
`;

  // 簡單區域
  if (data.morning?.time > 0) {
    body += `晨會：數量 ${data.morning.quantity} 個, 時間 ${data.morning.time} 分鐘\n`;
  }
  if (data.packaging_machine?.time > 0) {
    body += `進包裝機：數量 ${data.packaging_machine.quantity} 個, 時間 ${data.packaging_machine.time} 分鐘\n`;
  }
  if (data.cleaning?.time > 0) {
    body += `整理環境區：數量 ${data.cleaning.quantity} 個, 時間 ${data.cleaning.time} 分鐘\n`;
  }

  // 可以繼續添加其他區域的詳細資料...

  MailApp.sendEmail(recipient, subject, body);
}
