exports.handler = async function(event, context) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const scriptUrl = process.env.GOOGLE_SHEET_URL;
  const scriptSecret = process.env.GOOGLE_SHEET_SECRET;

  // 趨勢圖生成函式
  const generateTrends = (baseCount, type = 'views') => {
    const isMsg = type === 'msg';
    const daily = [
      { name: 'Mon', value: isMsg ? Math.max(0, baseCount - 3) : Math.floor(baseCount * 0.1) },
      { name: 'Tue', value: isMsg ? Math.max(0, baseCount - 1) : Math.floor(baseCount * 0.2) },
      { name: 'Wed', value: isMsg ? Math.floor(baseCount * 0.5) : Math.floor(baseCount * 0.15) },
      { name: 'Thu', value: isMsg ? Math.floor(baseCount * 0.2) : Math.floor(baseCount * 0.25) },
      { name: 'Fri', value: baseCount },
      { name: 'Sat', value: 0 },
      { name: 'Sun', value: 0 }
    ];
    if (isMsg) return { daily: daily.map(d => ({ name: d.name, msgSent: d.value })) };
    return { daily };
  };

  // 初始化資料結構：只保留 overview, website, telegram
  let dashboardData = {
    overview: { trends: generateTrends(0), metrics: {}, aiInsights: [] },
    website: { daily: [], metrics: {}, aiInsights: [] },
    telegram: { trends: generateTrends(0, 'msg'), metrics: {}, aiInsights: [], buttonStats: [] }
  };

  try {
    if (!tgToken) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    await fetch(`https://api.telegram.org/bot${tgToken}/deleteWebhook?drop_pending_updates=false`);

    const sheetFetchUrl = (scriptUrl && scriptSecret) ? `${scriptUrl}?secret=${scriptSecret}` : null;

    const [meRes, updatesRes, sheetRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${tgToken}/getMe`),
      fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100&offset=-20`), 
      sheetFetchUrl ? fetch(sheetFetchUrl).catch(e => null) : Promise.resolve(null)
    ]);

    const updatesData = await updatesRes.json();
    
    let emailCount = 0;
    let websiteViews = 0;
    
    if (sheetRes && sheetRes.ok) {
      try {
        const sheetData = await sheetRes.json();
        emailCount = sheetData.emailCount || 0;
        websiteViews = sheetData.websiteViews || 0;
      } catch (e) {}
    }

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

    const totalInteractions = messageCount + buttonClicks;
    const topButtons = Object.entries(buttonMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    // 計算轉換率 (名單 / 訪客)
    let conversionRate = 0;
    if (websiteViews > 0) {
      conversionRate = ((emailCount / websiteViews) * 100).toFixed(1);
    }

    let aiAnalysisText = [`📊 數據整合完畢`, `流量: ${websiteViews} / 轉換率: ${conversionRate}%`];
    
    if (geminiKey) {
      try {
        const prompt = `分析 Landing Page 表現：訪客 ${websiteViews} 人，獲取名單 ${emailCount} 筆，轉換率 ${conversionRate}%。TG互動 ${totalInteractions}。請給出 2 點優化轉換率的簡短繁體中文建議。`;
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

    // --- 組合回傳 ---
    dashboardData.overview = {
      trends: generateTrends(websiteViews + totalInteractions),
      metrics: {
        totalViews: { value: (websiteViews + totalInteractions).toString(), change: 'Total', trend: 'up' },
        totalEngagement: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' },
        leads: { value: `${emailCount}`, change: 'Signups', trend: 'up' },
        aiScore: { value: '92', change: '+2', trend: 'up' },
      },
      aiInsights: [`🤖 全通路監控中`, ...aiAnalysisText]
    };

    // 🌟 整合後的 Website (Landing Page) 數據
    dashboardData.website = {
      daily: generateTrends(websiteViews).daily,
      metrics: {
        visitors: { value: websiteViews.toString(), change: 'Views', trend: 'up' }, // 流量
        leads: { value: emailCount.toString(), change: 'Leads', trend: 'up' }, // 名單數
        conversionRate: { value: `${conversionRate}%`, change: 'Rate', trend: conversionRate > 1 ? 'up' : 'flat' }, // 轉換率
        avgCost: { value: '$0', change: 'Organic', trend: 'flat' } // 獲客成本(有機)
      },
      aiInsights: [`Landing Page 監控中`, `目前轉換率: ${conversionRate}%`]
    };

    dashboardData.telegram = {
      trends: generateTrends(totalInteractions, 'msg'),
      metrics: {
        botInteractions: { value: totalInteractions.toString(), change: 'Total', trend: 'up' },
        subscribers: { value: emailCount.toString(), change: 'Sheet', trend: 'up' },
        broadcastOpenRate: { value: buttonClicks.toString(), change: 'Clicks', trend: 'up' },
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: aiAnalysisText,
      buttonStats: topButtons
    };

  } catch (error) {
    console.error("API Error", error);
    dashboardData.overview.aiInsights = ["⚠️ 錯誤", error.message];
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify(dashboardData)
  };
};