exports.handler = async function(event, context) {
  // 1. 從 Netlify 保險箱取出密碼
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // 準備回傳的資料結構 (預設先用假資料墊底)
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
        totalViews: { value: 'Loading...', change: '0%', trend: 'flat' },
        totalEngagement: { value: '-', change: '0%', trend: 'flat' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85', change: '+2', trend: 'up' },
      },
      aiInsights: ["正在連線 Telegram API..."]
    },
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  try {
    // 2. 如果沒有設定 Token，就回傳錯誤提示
    if (!token) {
      throw new Error("請先在 Netlify 設定 TELEGRAM_BOT_TOKEN");
    }

    // 3. 真實連線：詢問 Telegram 機器人資訊 (getMe)
    const meResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meResponse.json();

    // 4. 真實連線：詢問最近的訊息更新 (getUpdates)
    const updatesResponse = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const updatesData = await updatesResponse.json();

    // 5. 統計數據
    const botName = meData.result ? meData.result.first_name : "Unknown Bot";
    const messageCount = updatesData.result ? updatesData.result.length : 0;
    
    // 6. 將真實數據填入 dashboardData
    dashboardData.overview.aiInsights = [
      `✅ 成功連線到機器人：${botName}`,
      `📊 機器人目前暫存訊息數：${messageCount} 則`,
      "數據來源：Telegram Official API"
    ];

    dashboardData.overview.metrics.totalViews = { 
      value: messageCount.toString(), 
      change: '+New', 
      trend: 'up' 
    };

    // 這裡我們把 Telegram 的數據也更新一下
    dashboardData.telegram = {
      metrics: {
        subscribers: { value: '1', change: '0', trend: 'flat' }, // 暫時寫死
        botInteractions: { value: messageCount.toString(), change: 'Live', trend: 'up' }
      },
      aiInsights: [`機器人 ${botName} 運作正常`, `收到 ${messageCount} 個新事件`]
    };

  } catch (error) {
    console.error("Telegram API Error:", error);
    dashboardData.overview.aiInsights = [
      "⚠️ Telegram 連線失敗",
      error.message || "請檢查 Netlify Environment Variables 設定"
    ];
  }

  // 回傳結果
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dashboardData)
  };
};