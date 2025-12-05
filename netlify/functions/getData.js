exports.handler = async function(event, context) {
  // 這是後端程式，以後我們會在這裡寫程式去連 Telegram/LinkedIn
  // 現在我們先回傳「假資料」來測試串接有沒有成功
  
  const mockData = {
    overview: {
      daily: [
        { name: 'Mon', views: 4000, engagement: 2400 },
        { name: 'Tue', views: 3000, engagement: 1398 },
        { name: 'Wed', views: 2000, engagement: 9800 },
        { name: 'Thu', views: 2780, engagement: 3908 },
        { name: 'Fri', views: 1890, engagement: 4800 },
        { name: 'Sat', views: 2390, engagement: 3800 },
        { name: 'Sun', views: 3490, engagement: 4300 },
      ],
      metrics: {
        totalViews: { value: '128.5K', change: '+12%', trend: 'up' },
        totalEngagement: { value: '42.3K', change: '+5%', trend: 'up' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85/100', change: '+2', trend: 'up' },
      },
      aiInsights: [
        "✅ 成功連線！這條訊息來自您的 Netlify 後端 API。",
        "LinkedIn 的數據目前穩定成長中。",
        "Telegram 機器人收到大量詢問。"
      ]
    },
    // 其他平台的預設空資料，避免報錯
    website: { daily: [], metrics: {}, aiInsights: [] },
    linkedin: { daily: [], metrics: {}, aiInsights: [] },
    forum: { daily: [], metrics: {}, aiInsights: [] },
    telegram: { daily: [], metrics: {}, aiInsights: [] }
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // 允許跨域
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mockData)
  };
};