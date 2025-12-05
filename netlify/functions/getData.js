exports.handler = async function(event, context) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  let dashboardData = {
    overview: {
      daily: [], // 省略假資料以節省空間
      metrics: {
        totalViews: { value: 'Checking...', change: '0', trend: 'flat' },
        totalEngagement: { value: '-', change: '0', trend: 'flat' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85', change: '+2', trend: 'up' },
      },
      aiInsights: []
    },
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  try {
    if (!token) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    // 1. 強制刪除 Webhook (關鍵修正！)
    // 這行會告訴 Telegram：「不要把訊息推給別人了，全部留給我自己抓！」
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);

    // 2. 取得機器人資訊
    const meResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meResponse.json();

    // 3. 取得訊息 (增加 limit 確保抓得到)
    const updatesResponse = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100&offset=-5`);
    const updatesData = await updatesResponse.json();

    const botName = meData.result ? meData.result.first_name : "Unknown";
    const messages = updatesData.result || [];
    const messageCount = messages.length;
    
    // 4. 準備顯示文字
    const timeString = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const lastMsg = messageCount > 0 ? messages[messages.length - 1].message.text : "無";

    dashboardData.overview.aiInsights = [
      `✅ 連線狀態: 良好 (更新於 ${timeString})`,
      `🤖 機器人: ${botName}`,
      `📨 訊息庫存: ${messageCount} 則`,
      messageCount > 0 ? `最新訊息: "${lastMsg}"` : "💡 現在請去 Telegram 傳送「Hello」給機器人！"
    ];

    dashboardData.overview.metrics.totalViews = { 
      value: messageCount.toString(), 
      change: messageCount > 0 ? '+New' : '0', 
      trend: messageCount > 0 ? 'up' : 'flat' 
    };

    // 更新 Telegram 分頁的數據
    dashboardData.telegram = {
      metrics: {
        subscribers: { value: '1', change: 'Live', trend: 'flat' },
        botInteractions: { value: messageCount.toString(), change: 'Real-time', trend: 'up' },
        broadcastOpenRate: { value: '98%', change: '+2%', trend: 'up' }
      },
      aiInsights: [`已成功切換至長輪詢模式 (Long Polling)`, `等待新訊息中...`]
    };

  } catch (error) {
    console.error(error);
    dashboardData.overview.aiInsights = ["⚠️ 連線錯誤", error.message];
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