exports.handler = async function(event, context) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const scriptUrl = process.env.GOOGLE_SHEET_URL;
  const scriptSecret = process.env.GOOGLE_SHEET_SECRET;

  // --- 輔助函式：生成模擬趨勢數據 (讓圖表有東西跑) ---
  const generateTrends = (baseCount, type = 'views') => {
    const isMsg = type === 'msg';
    // 每日 (7天)
    const daily = [
      { name: 'Mon', value: isMsg ? 2 : baseCount - 5 },
      { name: 'Tue', value: isMsg ? 5 : baseCount + 2 },
      { name: 'Wed', value: isMsg ? 3 : baseCount - 2 },
      { name: 'Thu', value: isMsg ? 8 : baseCount + 5 },
      { name: 'Fri', value: baseCount }, // 今天
      { name: 'Sat', value: 0 },
      { name: 'Sun', value: 0 }
    ];
    // 每周 (4週)
    const weekly = [
      { name: 'Week 1', value: baseCount * 5 },
      { name: 'Week 2', value: baseCount * 6 },
      { name: 'Week 3', value: baseCount * 4 },
      { name: 'This Week', value: baseCount * 7 } // 預估值
    ];
    // 每月 (6個月)
    const monthly = [
      { name: 'Jan', value: baseCount * 20 },
      { name: 'Feb', value: baseCount * 22 },
      { name: 'Mar', value: baseCount * 18 },
      { name: 'Apr', value: baseCount * 25 },
      { name: 'May', value: baseCount * 28 },
      { name: 'Jun', value: baseCount * 30 }
    ];
    
    // 如果是 Telegram，把 value 欄位換成 msgSent 以配合前端
    if (isMsg) {
      return {
        daily: daily.map(d => ({ name: d.name, msgSent: d.value })),
        weekly: weekly.map(d => ({ name: d.name, msgSent: d.value })),
        monthly: monthly.map(d => ({ name: d.name, msgSent: d.value }))
      };
    }
    return { daily, weekly, monthly };
  };

  // 預設資料
  let dashboardData = {
    overview: { trends: generateTrends(500), metrics: {}, aiInsights: [] },
    telegram: { trends: generateTrends(0, 'msg'), metrics: {}, aiInsights: [], emailList: [], buttonStats: [] }
  };

  try {
    // 1. 抓取資料
    if (!tgToken) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    // 準備 Google Sheet 網址 (記得帶密碼)
    const sheetFetchUrl = (scriptUrl && scriptSecret) ? `${scriptUrl}?secret=${scriptSecret}` : null;

    // 平行請求
    const [meRes, updatesRes, sheetRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${tgToken}/getMe`),
      fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100`),
      sheetFetchUrl ? fetch(sheetFetchUrl).catch(e => null) : Promise.resolve(null)
    ]);

    const meData = await meRes.json();
    const updatesData = await updatesRes.json();
    
    // --- 2. 處理 Google Sheet ---
    let emailCount = 0;
    let recentEmails = ["讀取中..."];
    let sheetStatus = "未連接";

    if (sheetRes && sheetRes.ok) {
      try {
        const sheetData = await sheetRes.json();
        // 確保資料格式正確
        if (sheetData.totalCount !== undefined) {
          emailCount = sheetData.totalCount;
          recentEmails = sheetData.recentList || [];
          sheetStatus = "連線成功";
        } else {
          sheetStatus = "格式錯誤";
          recentEmails = ["格式錯誤: JSON欄位不符"];
        }
      } catch (e) {
        sheetStatus = "解析失敗";
        recentEmails = ["解析失敗: 非 JSON 格式"];
      }
    } else if (!sheetFetchUrl) {
      recentEmails = ["未設定環境變數"];
    }

    // --- 3. 處理 Telegram ---
    const rawUpdates = updatesData.result || [];
    let messageCount = 0;
    let buttonClicks = 0;
    let buttonMap = {};

    rawUpdates.forEach(update => {
      if (update.message) messageCount++;
      else if (update.callback_query) {
        buttonClicks++;
        const btnId = update.callback_query.data || "unknown";
        buttonMap[btnId] = (buttonMap[btnId] || 0) + 1;
      }
    });

    const topButtons = Object.entries(buttonMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalInteractions = messageCount + buttonClicks;

    // --- 4. AI 分析 ---
    let aiAnalysisText = [`📊 Sheet 狀態: ${sheetStatus}`, `名單數: ${emailCount}`];
    if (geminiKey) {
      try {
        const prompt = `分析：Telegram 互動 ${totalInteractions} 次，按鈕點擊 ${buttonClicks}。Google Sheet 收集 ${emailCount} 筆名單。給 2 點簡短繁體中文建議。`;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const gData = await geminiRes.json();
        if (gData.candidates) {
          aiAnalysisText = gData.candidates[0].content.parts[0].text.split('\n').filter(l => l.trim()).slice(0, 2);
        }
      } catch (e) { aiAnalysisText.push("AI 忙線中"); }
    }

    // --- 5. 組合數據 (這裡會生成多維度 trends) ---
    
    // Overview
    dashboardData.overview = {
      trends: generateTrends(totalInteractions + emailCount), // 生成趨勢
      metrics: {
        totalViews: { value: totalInteractions.toString(), change: 'Live', trend: 'up' },
        totalEngagement: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' },
        conversionRate: { value: `${emailCount}`, change: 'Leads', trend: 'up' },
        aiScore: { value: '92', change: '+5', trend: 'up' },
      },
      aiInsights: [`🤖 AI 狀態: 良好`, ...aiAnalysisText]
    };

    // Telegram
    dashboardData.telegram = {
      trends: generateTrends(totalInteractions, 'msg'), // 生成趨勢 (msg模式)
      metrics: {
        botInteractions: { value: totalInteractions.toString(), change: 'Total', trend: 'up' },
        subscribers: { value: emailCount.toString(), change: 'Sheet', trend: 'up' },
        broadcastOpenRate: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' },
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: aiAnalysisText,
      emailList: recentEmails,
      buttonStats: topButtons
    };

  } catch (error) {
    console.error(error);
    dashboardData.overview.aiInsights = ["⚠️ 系統錯誤", error.message];
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    body: JSON.stringify(dashboardData)
  };
};
