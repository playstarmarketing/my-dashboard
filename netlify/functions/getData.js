exports.handler = async function(event, context) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const sheetUrl = process.env.GOOGLE_SHEET_URL;
  const geminiKey = process.env.GEMINI_API_KEY;

  let dashboardData = {
    overview: { daily: [], metrics: {}, aiInsights: [] },
    telegram: { daily: [], metrics: {}, aiInsights: [], emailList: [], buttonStats: [] } // 新增 buttonStats
  };

  try {
    if (!tgToken) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    // 平行抓取資料
    const [meRes, updatesRes, sheetRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${tgToken}/getMe`),
      fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100`), // 抓取最近 100 筆互動
      sheetUrl ? fetch(sheetUrl) : Promise.resolve(null)
    ]);

    const meData = await meRes.json();
    const updatesData = await updatesRes.json();
    
    // --- 1. 處理 Google Sheet (維持原樣) ---
    let emailCount = 0;
    let recentEmails = [];
    if (sheetRes && sheetRes.ok) {
      const csvText = await sheetRes.text();
      const rows = csvText.split('\n').filter(r => r.trim() !== '');
      emailCount = Math.max(0, rows.length - 1);
      recentEmails = rows.slice(1).slice(-5).reverse().map(r => r.split(',')[0]);
    }

    // --- 2. 處理 Telegram 行為數據 (關鍵升級!) ---
    const rawUpdates = updatesData.result || [];
    
    let messageCount = 0;
    let buttonClicks = 0;
    let buttonMap = {}; // 用來統計每個按鈕按了幾次

    rawUpdates.forEach(update => {
      // 情況 A: 用戶傳送文字訊息
      if (update.message) {
        messageCount++;
      }
      // 情況 B: 用戶點擊按鈕 (Callback Query)
      else if (update.callback_query) {
        buttonClicks++;
        // 抓取按鈕的 ID (data)
        const btnId = update.callback_query.data || "unknown_btn";
        if (!buttonMap[btnId]) buttonMap[btnId] = 0;
        buttonMap[btnId]++;
      }
    });

    // 將按鈕統計轉為陣列，並排序 (取前 5 名)
    const topButtons = Object.entries(buttonMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- 3. 準備 AI 分析 ---
    let aiInsights = [`📊 監測到 ${rawUpdates.length} 個互動事件`];
    if (buttonClicks > 0) {
      const bestBtn = topButtons.length > 0 ? topButtons[0].name : "無";
      aiInsights.push(`🔥 最熱門按鈕: [${bestBtn}]`);
    }

    if (geminiKey) {
      try {
        const prompt = `
          我是 Telegram 機器人管理員。數據顯示：
          1. 最近收到 ${messageCount} 則文字訊息。
          2. 用戶點擊了 ${buttonClicks} 次按鈕。
          3. 最常按的按鈕是：${topButtons.map(b => b.name).join(', ')}。
          
          請用繁體中文，針對用戶的「按鈕行為」給出 2 點優化腳本的建議。
        `;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const gData = await geminiRes.json();
        if (gData.candidates) {
          const text = gData.candidates[0].content.parts[0].text;
          aiInsights = text.split('\n').filter(l => l.trim() !== '').slice(0, 2);
        }
      } catch (e) {}
    }

    // --- 4. 組合回傳資料 ---
    dashboardData.overview.aiInsights = [`🤖 Bot 行為分析中`, ...aiInsights];
    dashboardData.overview.metrics = {
      totalViews: { value: (messageCount + buttonClicks).toString(), change: 'Live', trend: 'up' },
      totalEngagement: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' },
      conversionRate: { value: `${emailCount}`, change: 'Leads', trend: 'up' },
      aiScore: { value: '92', change: '+5', trend: 'up' },
    };

    dashboardData.telegram = {
      daily: [
        { name: 'Mon', msgSent: 2 }, { name: 'Tue', msgSent: 5 }, { name: 'Wed', msgSent: 3 },
        { name: 'Thu', msgSent: 1 }, { name: 'Fri', msgSent: messageCount + buttonClicks }, { name: 'Sat', msgSent: 0 }, { name: 'Sun', msgSent: 0 }
      ],
      metrics: {
        botInteractions: { value: (messageCount + buttonClicks).toString(), change: 'Total', trend: 'up' },
        subscribers: { value: emailCount.toString(), change: 'Leads', trend: 'up' },
        broadcastOpenRate: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' }, // 借用欄位顯示點擊數
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: aiInsights,
      emailList: recentEmails,
      buttonStats: topButtons // 傳送按鈕統計給前端
    };

  } catch (error) {
    console.error(error);
    dashboardData.overview.aiInsights = ["⚠️ 錯誤", error.message];
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    body: JSON.stringify(dashboardData)
  };
};