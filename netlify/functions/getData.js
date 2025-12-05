exports.handler = async function(event, context) {
  // 這裡以後會換成去抓 LinkedIn/Telegram 的真實程式碼
  // 現在我們先把假資料放在後端，模擬 API 的運作
  
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
      weekly: [
        { name: 'Week 1', views: 24000, engagement: 12400 },
        { name: 'Week 2', views: 33000, engagement: 15398 },
        { name: 'Week 3', views: 22000, engagement: 9800 },
        { name: 'Week 4', views: 42780, engagement: 23908 },
      ],
      metrics: {
        totalViews: { value: '128.5K', change: '+12%', trend: 'up' },
        totalEngagement: { value: '42.3K', change: '+5%', trend: 'up' },
        conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
        aiScore: { value: '85/100', change: '+2', trend: 'up' },
      },
      aiInsights: [
        "（來自後端 API）總體流量在本周三達到高峰。",
        "（來自後端 API）Telegram 機器人的活躍度顯著提升。",
        "這段文字是透過 Netlify Functions 傳送過來的！"
      ]
    },
    // ... 為了節省篇幅，其他平台暫時省略，前端會處理預設值
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // 允許跨域存取
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mockData)
  };
};