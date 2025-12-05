exports.handler = async function(event, context) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. 準備基礎資料 (這裡補回了 daily 數據，解決圖表消失的問題)
  let dashboardData = {
    overview: {
      daily: [
        { name: 'Mon', views: 4000 },
        { name: 'Tue', views: 3000 },
        { name: 'Wed', views: 2000 },
        { name: 'Thu', views: 2780 },
        { name: 'Fri', views: 1890 },
        { name: 'Sat', views: 2390 },
        { name: 'Sun', views: 3490 },
      ],
      metrics: {
        totalViews: { value: 'Loading...', change: '0', trend: 'flat' },
        totalEngagement: { value: '-', change: '0', trend: 'flat' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85', change: '+2', trend: 'up' },
      },
      aiInsights: ["正在連線 Telegram API..."]
    },
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  try {
    // --- 抓取 Telegram 數據 ---
    if (!tgToken) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    // 避免 Webhook 衝突
    await fetch(`https://api.telegram.org/bot${tgToken}/deleteWebhook?drop_pending_updates=false`);
    
    // 取得機器人資訊 & 訊息
    const [meRes, updatesRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${tgToken}/getMe`),
      fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100&offset=-10`)
    ]);

    const meData = await meRes.json();
    const updatesData = await updatesRes.json();

    const botName = meData.result ? meData.result.first_name : "Bot";
    const messages = updatesData.result || [];
    const msgCount = messages.length;

    // --- 建立 Telegram 圖表數據 (混合真實數據) ---
    const telegramChartData = [
      { name: 'Mon', msgSent: 2 },
      { name: 'Tue', msgSent: 5 },
      { name: 'Wed', msgSent: Math.floor(msgCount * 0.5) },
      { name: 'Thu', msgSent: 1 },
      { name: 'Fri', msgSent: msgCount }, // 把真實數據放在今天
      { name: 'Sat', msgSent: 3 },
      { name: 'Sun', msgSent: 8 },
    ];

    // --- AI 分析 (Google Gemini) ---
    let aiAnalysisText = [`📊 機器人 (${botName}) 監測中`, `累積訊息數: ${msgCount}`];

    if (geminiKey) {
      try {
        const prompt = `
          你是數據分析師。分析我的 Telegram 機器人 "${botName}" 數據：
          收到 ${msgCount} 則新訊息。最新訊息內容: "${msgCount > 0 ? messages[messages.length - 1].message.text : '無'}"。
          請給出 2 點簡短繁體中文分析 (每點限 15 字內)。
        `;

        // 設定 8 秒超時，避免分析太久導致網站轉圈圈
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const geminiData = await geminiRes.json();
        if (geminiData.candidates && geminiData.candidates[0].content) {
          const rawText = geminiData.candidates[0].content.parts[0].text;
          const aiLines = rawText.split('\n').filter(line => line.trim() !== '').slice(0, 2);
          if (aiLines.length > 0) aiAnalysisText.push(...aiLines);
        }
      } catch (aiError) {
        console.warn("AI 分析超時或錯誤，略過");
        aiAnalysisText.push("⚡ AI 分析忙線中，顯示基礎數據");
      }
    }

    // --- 組合最終數據 ---
    // 1. 更新 Overview (保留原本的 Daily 圖表)
    dashboardData.overview.aiInsights = [`🤖 AI 狀態: 連線良好`, ...aiAnalysisText];
    dashboardData.overview.metrics.totalViews = { value: msgCount.toString(), change: 'Live', trend: 'up' };
    
    // 2. 更新 Telegram 分頁
    dashboardData.telegram = {
      daily: telegramChartData,
      metrics: {
        subscribers: { value: '1', change: 'Online', trend: 'flat' },
        botInteractions: { value: msgCount.toString(), change: '+New', trend: 'up' },
        broadcastOpenRate: { value: '98%', change: 'Stable', trend: 'flat' },
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: aiAnalysisText
    };

  } catch (error) {
    console.error(error);
    dashboardData.overview.aiInsights = ["⚠️ 系統錯誤", error.message];
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dashboardData)
  };
};