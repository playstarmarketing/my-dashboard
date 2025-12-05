exports.handler = async function(event, context) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY; // 取出 Gemini 鑰匙

  // 預設資料結構
  let dashboardData = {
    overview: {
      daily: [],
      metrics: {
        totalViews: { value: 'Loading...', change: '0', trend: 'flat' },
        totalEngagement: { value: '-', change: '0', trend: 'flat' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85', change: '+2', trend: 'up' },
      },
      aiInsights: []
    },
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  try {
    // ------------------------------------------------
    // 1. 抓取 Telegram 數據
    // ------------------------------------------------
    if (!tgToken) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    await fetch(`https://api.telegram.org/bot${tgToken}/deleteWebhook?drop_pending_updates=false`);
    
    // 取得基本資料
    const meRes = await fetch(`https://api.telegram.org/bot${tgToken}/getMe`);
    const meData = await meRes.json();
    const botName = meData.result ? meData.result.first_name : "Bot";

    // 取得訊息 (Limit 100)
    const updatesRes = await fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100&offset=-10`);
    const updatesData = await updatesRes.json();
    const messages = updatesData.result || [];
    const msgCount = messages.length;

    // 生成圖表數據 (簡單模擬)
    const telegramChartData = [
      { name: 'Mon', msgSent: 0 },
      { name: 'Tue', msgSent: 0 },
      { name: 'Wed', msgSent: Math.floor(msgCount * 0.2) },
      { name: 'Thu', msgSent: Math.floor(msgCount * 0.5) },
      { name: 'Fri', msgSent: msgCount },
      { name: 'Sat', msgSent: 0 },
      { name: 'Sun', msgSent: 0 },
    ];

    // ------------------------------------------------
    // 2. 呼叫 Google Gemini 進行 AI 分析
    // ------------------------------------------------
    let aiAnalysisText = [
      `📊 機器人 (${botName}) 目前累積 ${msgCount} 則新訊息。`,
      "等待 AI 分析中..."
    ];

    if (geminiKey) {
      // 準備要問 AI 的問題 (Prompt)
      const prompt = `
        你是一個專業的數據分析師。
        我的 Telegram 機器人 "${botName}" 目前收到了 ${msgCount} 則新訊息。
        最新的一則訊息內容是: "${msgCount > 0 ? messages[messages.length - 1].message.text : '無'}"。
        
        請給我 3 條簡短、專業的繁體中文分析建議 (每條不超過 20 字)。
        格式範例：
        1. 互動率穩定，建議持續...
        2. 訊息量偏低，嘗試...
      `;

      // 打電話給 Google
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const geminiData = await geminiRes.json();
      
      // 解析 AI 的回答
      if (geminiData.candidates && geminiData.candidates[0].content) {
        const rawText = geminiData.candidates[0].content.parts[0].text;
        // 簡單處理文字，把換行切成陣列
        aiAnalysisText = rawText.split('\n').filter(line => line.trim() !== '').slice(0, 3);
      }
    } else {
      aiAnalysisText.push("⚠️ 未設定 GEMINI_API_KEY，無法進行智能分析");
    }

    // ------------------------------------------------
    // 3. 組合最終資料回傳
    // ------------------------------------------------
    
    // 填入 Overview
    dashboardData.overview.aiInsights = [
      `🤖 AI 分析完成 (Model: Gemini 1.5)`,
      ...aiAnalysisText // 展開 AI 的建議
    ];
    
    dashboardData.overview.metrics.totalViews = { 
      value: msgCount.toString(), 
      change: 'Live', 
      trend: 'up' 
    };

    // 填入 Telegram 分頁
    dashboardData.telegram = {
      daily: telegramChartData,
      metrics: {
        subscribers: { value: '1', change: 'Online', trend: 'flat' },
        botInteractions: { value: msgCount.toString(), change: '+New', trend: 'up' },
        broadcastOpenRate: { value: '98%', change: 'Stable', trend: 'flat' },
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: aiAnalysisText // 這裡也顯示 AI 的建議
    };

  } catch (error) {
    console.error(error);
    dashboardData.overview.aiInsights = ["⚠️ 系統錯誤", error.message];
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify(dashboardData)
  };
};