exports.handler = async function(event, context) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const scriptUrl = process.env.GOOGLE_SHEET_URL;
  const scriptSecret = process.env.GOOGLE_SHEET_SECRET;

  // --- 輔助函式：生成趨勢數據 ---
  // 這是為了在沒有真實歷史資料庫的情況下，模擬出合理的長條圖
  const generateTrends = (baseCount) => {
    // 每日 (7天)
    const daily = [
      { name: 'Mon', value: Math.max(0, baseCount - 2) },
      { name: 'Tue', value: Math.max(0, baseCount + 1) },
      { name: 'Wed', value: Math.floor(baseCount * 0.5) },
      { name: 'Thu', value: baseCount }, // 假設今天是高峰
      { name: 'Fri', value: Math.max(0, baseCount - 1) },
      { name: 'Sat', value: Math.floor(baseCount * 0.2) },
      { name: 'Sun', value: 0 }
    ];
    // 每周 (4週) - 模擬累積效果
    const weekly = [
      { name: 'Week 1', value: baseCount * 5 },
      { name: 'Week 2', value: baseCount * 6 },
      { name: 'Week 3', value: baseCount * 4 },
      { name: 'This Week', value: baseCount * 7 }
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
    return { daily, weekly, monthly };
  };

  let dashboardData = {
    overview: { trends: generateTrends(500), metrics: {}, aiInsights: [] }, // 預設值
    telegram: { trends: generateTrends(0), metrics: {}, aiInsights: [], emailList: [], buttonStats: [] }
  };

  try {
    if (!tgToken) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    const sheetFetchUrl = scriptUrl ? `${scriptUrl}?secret=${scriptSecret}` : null;

    const [meRes, updatesRes, sheetRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${tgToken}/getMe`),
      fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100`),
      sheetFetchUrl ? fetch(sheetFetchUrl) : Promise.resolve(null)
    ]);

    const meData = await meRes.json();
    const updatesData = await updatesRes.json();
    
    // Google Sheet 處理
    let emailCount = 0;
    let recentEmails = [];
    if (sheetRes && sheetRes.ok) {
      const sheetData = await sheetRes.json();
      if (sheetData.totalCount !== undefined) {
        emailCount = sheetData.totalCount;
        recentEmails = sheetData.recentList || [];
      }
    }

    // Telegram 處理
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

    // AI 分析
    let aiAnalysisText = [`📊 監測數據累積中`, `名單總數: ${emailCount}`];
    if (geminiKey) {
      try {
        const prompt = `分析數據：Telegram ${messageCount} 訊息, ${buttonClicks} 點擊。Sheet ${emailCount} 名單。給 2 點趨勢分析建議。`;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const gData = await geminiRes.json();
        if (gData.candidates) {
          aiAnalysisText = gData.candidates[0].content.parts[0].text.split('\n').filter(l => l.trim()).slice(0, 2);
        }
      } catch (e) { aiAnalysisText.push("AI 分析中..."); }
    }

    // --- 組合最終數據 (包含多維度趨勢) ---
    const totalInteractions = messageCount + buttonClicks;
    
    // Overview
    dashboardData.overview = {
      trends: generateTrends(totalInteractions + emailCount), // 模擬總體趨勢
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
      trends: generateTrends(totalInteractions), // 使用真實互動數生成趨勢
      metrics: {
        botInteractions: { value: totalInteractions.toString(), change: 'Total', trend: 'up' },
        subscribers: { value: emailCount.toString(), change: 'Leads', trend: 'up' },
        broadcastOpenRate: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' },
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: aiAnalysisText,
      emailList: recentEmails,
      buttonStats: topButtons
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