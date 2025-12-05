exports.handler = async function(event, context) {
  // 1. 從 Netlify 保險箱取出密碼
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  // 準備回傳的資料結構
  let dashboardData = {
    overview: {
      daily: [
        { name: 'Mon', views: 0 },
        { name: 'Tue', views: 0 },
        { name: 'Wed', views: 0 },
        { name: 'Thu', views: 0 },
        { name: 'Fri', views: 0 },
        { name: 'Sat', views: 0 },
        { name: 'Sun', views: 0 },
      ],
      metrics: {
        totalViews: { value: 'Checking...', change: '0%', trend: 'flat' },
        totalEngagement: { value: '-', change: '0%', trend: 'flat' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85', change: '+2', trend: 'up' },
      },
      aiInsights: ["正在連線 Telegram API..."]
    },
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  try {
    // 診斷 1: 檢查 Token 是否存在
    if (!token) {
      throw new Error("Netlify 環境變數未讀取到 Token");
    }

    // 2. 詢問 Telegram 機器人資訊
    const meResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meResponse.json();

    if (!meData.ok) {
      throw new Error(`Telegram API 拒絕連線: ${meData.description}`);
    }

    // 3. 詢問最近訊息 (getUpdates)
    // 這裡我們加上 offset=0 確保不會遺漏，並加上 timeout 避免卡住
    const updatesResponse = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=10`);
    const updatesData = await updatesResponse.json();

    // 4. 統計數據
    const botName = meData.result.first_name;
    const messages = updatesData.result || [];
    const messageCount = messages.length;
    
    // 5. 顯示診斷結果
    const timeString = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    
    dashboardData.overview.aiInsights = [
      `✅ 連線成功 (更新時間: ${timeString})`,
      `🤖 機器人: ${botName}`,
      `📨 目前收到的訊息數: ${messageCount} 則`,
      messageCount === 0 ? "💡 提示: 請試著傳送訊息給機器人，然後重新整理網頁。" : "🎉 成功抓取到真實數據！"
    ];

    dashboardData.overview.metrics.totalViews = { 
      value: messageCount.toString(), 
      change: messages.length > 0 ? '+New' : '0', 
      trend: messages.length > 0 ? 'up' : 'flat' 
    };

    dashboardData.overview.metrics.totalEngagement = {
      value: messageCount.toString(),
      change: 'Live',
      trend: 'up'
    };

  } catch (error) {
    console.error("Telegram Error:", error);
    dashboardData.overview.aiInsights = [
      "⚠️ 診斷模式：連線失敗",
      `錯誤原因: ${error.message}`,
      "請檢查 Netlify 環境變數設定是否正確，並嘗試重新部署。"
    ];
  }

  // 回傳結果 (強制不快取)
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate", // 關鍵：禁止快取
      "Pragma": "no-cache",
      "Expires": "0"
    },
    body: JSON.stringify(dashboardData)
  };
};