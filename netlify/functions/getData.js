exports.handler = async function(event, context) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  // 基礎假資料結構
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
    // 初始化 Telegram 結構
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  try {
    if (!token) throw new Error("未設定 TELEGRAM_BOT_TOKEN");

    // 1. 刪除 Webhook (避免卡住)
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);

    // 2. 取得機器人資訊
    const meResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meResponse.json();

    // 3. 取得訊息
    const updatesResponse = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100&offset=-10`);
    const updatesData = await updatesResponse.json();

    const botName = meData.result ? meData.result.first_name : "Unknown";
    const messages = updatesData.result || [];
    const messageCount = messages.length;
    
    // 4. --- 關鍵修正：生成 Telegram 的圖表數據 ---
    // 我們用真實的 messageCount 來模擬今天的數據，讓圖表有東西可以畫
    const telegramChartData = [
      { name: 'Mon', msgSent: 0 },
      { name: 'Tue', msgSent: 0 },
      { name: 'Wed', msgSent: Math.floor(messageCount * 0.2) }, // 模擬一點過去數據
      { name: 'Thu', msgSent: Math.floor(messageCount * 0.5) },
      { name: 'Fri', msgSent: messageCount }, // 把真實數據顯示在今天 (假設今天是週五)
      { name: 'Sat', msgSent: 0 },
      { name: 'Sun', msgSent: 0 },
    ];

    // 5. 填入 Overview 數據
    const lastMsg = messageCount > 0 ? messages[messages.length - 1].message.text : "無";
    dashboardData.overview.aiInsights = [
      `✅ 連線正常: ${botName}`,
      `📨 真實訊息庫存: ${messageCount} 則`,
      messageCount > 0 ? `最新: "${lastMsg}"` : "等待訊息中..."
    ];
    
    dashboardData.overview.metrics.totalViews = { 
      value: messageCount.toString(), 
      change: '+Live', 
      trend: 'up' 
    };

    // 6. 填入 Telegram 分頁數據 (包含剛剛生成的圖表)
    dashboardData.telegram = {
      daily: telegramChartData, // <--- 這裡就是圖表顯示的關鍵！
      metrics: {
        subscribers: { value: '1', change: 'Online', trend: 'flat' },
        botInteractions: { value: messageCount.toString(), change: '+New', trend: 'up' },
        broadcastOpenRate: { value: '98%', change: '0%', trend: 'flat' },
        activeRate: { value: 'High', change: '', trend: 'flat' }
      },
      aiInsights: [
        `機器人 ${botName} 正在監控中`,
        `已將 ${messageCount} 筆互動數據繪製於圖表`
      ]
    };

  } catch (error) {
    console.error(error);
    dashboardData.overview.aiInsights = ["⚠️ Error", error.message];
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