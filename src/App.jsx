import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, 
  TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  ArrowUpRight, ArrowDownRight, Settings
} from 'lucide-react';

// --- 模擬數據 (Mock Data) ---
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
      "總體流量在本周三達到高峰，主要由 LinkedIn 的病毒式貼文驅動。",
      "轉換率略有下降，建議檢查官網 Landing Page 的載入速度。",
      "Telegram 機器人的活躍度在週末顯著提升，建議在周五晚間推播內容。"
    ]
  },
  website: {
    daily: [
      { name: 'Mon', pageviews: 1200, bounceRate: 45 },
      { name: 'Tue', pageviews: 1400, bounceRate: 42 },
      { name: 'Wed', pageviews: 1100, bounceRate: 48 },
      { name: 'Thu', pageviews: 1600, bounceRate: 40 },
      { name: 'Fri', pageviews: 1800, bounceRate: 38 },
      { name: 'Sat', pageviews: 2200, bounceRate: 35 },
      { name: 'Sun', pageviews: 2100, bounceRate: 36 },
    ],
    metrics: {
      pageviews: { value: '11.4K', change: '+8%', trend: 'up' },
      avgSession: { value: '2m 14s', change: '+12s', trend: 'up' },
      bounceRate: { value: '41%', change: '-2%', trend: 'up' },
    },
    aiInsights: [
      "SEO 策略奏效，有機搜尋流量提升了 15%。",
      "「關於我們」頁面的跳出率偏高，建議增加團隊介紹影片以留住訪客。",
      "移動端用戶佔比達到 65%，請確保手機版導航列的易用性。"
    ]
  },
  linkedin: {
    daily: [
      { name: 'Mon', impressions: 500, clicks: 20 },
      { name: 'Tue', impressions: 800, clicks: 45 },
      { name: 'Wed', impressions: 2500, clicks: 120 },
      { name: 'Thu', impressions: 1200, clicks: 60 },
      { name: 'Fri', impressions: 900, clicks: 30 },
      { name: 'Sat', impressions: 600, clicks: 15 },
      { name: 'Sun', impressions: 400, clicks: 10 },
    ],
    metrics: {
      followers: { value: '5,240', change: '+45', trend: 'up' },
      impressions: { value: '6.9K', change: '+24%', trend: 'up' },
      engagementRate: { value: '4.8%', change: '+1.2%', trend: 'up' },
    },
    aiInsights: [
      "週三發布的關於「產業趨勢」的貼文獲得極高互動，建議多製作此類圖文。",
      "您的個人檔案瀏覽量上升，建議更新置頂精選文章以引導流量至官網。",
      "評論區互動率高，建議在貼文發布後 1 小時內回覆所有留言以觸發演算法獎勵。"
    ]
  },
  forum: {
    daily: [
      { name: 'Mon', posts: 5, replies: 12 },
      { name: 'Tue', posts: 8, replies: 24 },
      { name: 'Wed', posts: 4, replies: 15 },
      { name: 'Thu', posts: 10, replies: 45 },
      { name: 'Fri', posts: 12, replies: 50 },
      { name: 'Sat', posts: 15, replies: 60 },
      { name: 'Sun', posts: 14, replies: 55 },
    ],
    metrics: {
      activeThreads: { value: '24', change: '+3', trend: 'up' },
      sentimentScore: { value: 'Positive', change: 'Stable', trend: 'flat' },
      mentions: { value: '142', change: '+15%', trend: 'up' },
    },
    aiInsights: [
      "論壇使用者對新產品功能的討論熱度很高，情緒正面。",
      "發現 3 個關於定價問題的負面討論串，建議客服團隊介入澄清。",
      "週末是用戶發帖的高峰期，建議安排社群經理在週末輪班。"
    ]
  },
  telegram: {
    daily: [
      { name: 'Mon', msgSent: 150, newSubs: 2 },
      { name: 'Tue', msgSent: 200, newSubs: 5 },
      { name: 'Wed', msgSent: 180, newSubs: 3 },
      { name: 'Thu', msgSent: 220, newSubs: 8 },
      { name: 'Fri', msgSent: 350, newSubs: 12 },
      { name: 'Sat', msgSent: 400, newSubs: 15 },
      { name: 'Sun', msgSent: 380, newSubs: 10 },
    ],
    metrics: {
      subscribers: { value: '1,204', change: '+55', trend: 'up' },
      botInteractions: { value: '1.8K', change: '+12%', trend: 'up' },
      broadcastOpenRate: { value: '68%', change: '-2%', trend: 'down' },
    },
    aiInsights: [
      "Telegram Bot 的「查詢報價」功能使用率最高。",
      "廣播訊息的開啟率略有下降，建議精簡推播文字長度並增加互動按鈕。",
      "新加入的訂閱者多來自 LinkedIn 導流，建議在歡迎訊息中提供專屬 LinkedIn 用戶的優惠碼。"
    ]
  }
};

// --- 元件 Components ---

const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend !== 'flat' && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}
        </div>
      )}
      {trend === 'flat' && (
        <div className="flex items-center text-sm font-medium text-slate-400">
          - {change}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const AIInsightCard = ({ insights, type }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Sparkles size={100} className="text-indigo-600" />
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="bg-indigo-600 p-1.5 rounded-full">
        <Sparkles size={16} className="text-white" />
      </div>
      <h3 className="font-bold text-indigo-900">AI 智能分析報告: {type}</h3>
    </div>
    <div className="space-y-3 relative z-10">
      {insights.map((insight, index) => (
        <div key={index} className="flex gap-3 items-start bg-white/60 p-3 rounded-lg backdrop-blur-sm">
          <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-indigo-500" />
          <p className="text-sm text-indigo-900 leading-relaxed">{insight}</p>
        </div>
      ))}
    </div>
    <button className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
      生成詳細 PDF 報告 <ArrowUpRight size={12} />
    </button>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [activeTab, timeRange]);

  const currentData = mockData[activeTab];
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    let chartData = timeRange === 'daily' ? currentData.daily : (currentData.weekly || currentData.daily);
    let chartColor = "#6366f1"; 
    let metrics = currentData.metrics;
    
    let dataKey1 = "views";
    let dataKey2 = "engagement";
    
    if (activeTab === 'linkedin') {
      chartColor = "#0a66c2";
      dataKey1 = "impressions";
      dataKey2 = "clicks";
    } else if (activeTab === 'website') {
      chartColor = "#10b981";
      dataKey1 = "pageviews";
      dataKey2 = "bounceRate";
    } else if (activeTab === 'telegram') {
      chartColor = "#0088cc";
      dataKey1 = "msgSent";
      dataKey2 = "newSubs";
    } else if (activeTab === 'forum') {
      chartColor = "#8b5cf6";
      dataKey1 = "replies";
      dataKey2 = "posts";
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {Object.entries(metrics).map(([key, data], idx) => {
             let icon = TrendingUp;
             if (key.includes('View') || key.includes('Impression')) icon = Eye;
             if (key.includes('Click') || key.includes('engage')) icon = MousePointerClick;
             if (key.includes('User') || key.includes('follow') || key.includes('Sub')) icon = Users;
             
             return (
              <MetricCard 
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                value={data.value}
                change={data.change}
                trend={data.trend}
                icon={icon}
                color={activeTab === 'linkedin' ? 'bg-blue-600' : activeTab === 'telegram' ? 'bg-sky-500' : activeTab === 'website' ? 'bg-emerald-500' : activeTab === 'forum' ? 'bg-violet-500' : 'bg-indigo-600'}
              />
             );
           })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">
                {activeTab === 'overview' ? '流量與互動趨勢' : '平台表現分析'}
              </h3>
              <div className="flex gap-2">
                 <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: chartColor}}></span> 
                    {dataKey1}
                 </span>
                 <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span> 
                    {dataKey2}
                 </span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{color: '#1e293b', fontSize: '13px'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={dataKey1} 
                    stroke={chartColor} 
                    fillOpacity={1} 
                    fill="url(#colorMain)" 
                    strokeWidth={2}
                  />
                   <Area 
                    type="monotone" 
                    dataKey={dataKey2} 
                    stroke="#94a3b8" 
                    fillOpacity={0} 
                    fill="transparent" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-1">
             <AIInsightCard insights={currentData.aiInsights} type={activeTab === 'overview' ? '綜合總覽' : activeTab} />
             
             {/* Secondary Small Chart or Info */}
             <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-700 mb-4 text-sm">每週目標達成率</h4>
                <div className="flex justify-between items-end mb-2">
                   <span className="text-3xl font-bold text-slate-800">78%</span>
                   <span className="text-xs text-slate-500 mb-1">目標: 100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  根據目前速度，您將在周五前達成所有 KPI 指標。
                </p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <LayoutDashboard size={28} />
            <span className="text-xl font-extrabold tracking-tight">OmniData</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Platform</p>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} />
            總覽 (Overview)
          </button>
          
          <button 
            onClick={() => setActiveTab('website')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'website' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Globe size={18} />
            官方網站
          </button>
          
          <button 
            onClick={() => setActiveTab('linkedin')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'linkedin' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Linkedin size={18} />
            LinkedIn
          </button>
          
          <button 
            onClick={() => setActiveTab('forum')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'forum' ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare size={18} />
            討論區論壇
          </button>

          <button 
            onClick={() => setActiveTab('telegram')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'telegram' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Send size={18} />
            Telegram Bot
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-yellow-400" />
              <span className="font-bold text-sm">升級 AI Pro</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">解鎖更深度的預測分析與自動化報表功能。</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-xs font-bold transition-colors">
              查看方案
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'website' && 'Website Analytics'}
              {activeTab === 'linkedin' && 'LinkedIn Performance'}
              {activeTab === 'forum' && 'Community Insights'}
              {activeTab === 'telegram' && 'Bot Statistics'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button 
              onClick={() => setTimeRange('daily')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === 'daily' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
             >
               每日
             </button>
             <button 
              onClick={() => setTimeRange('weekly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === 'weekly' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
             >
               每周
             </button>
          </div>
          
          <div className="flex gap-2 md:hidden">
             <button className="p-2 bg-white rounded border border-slate-200"><Settings size={18}/></button>
          </div>
        </header>

        {renderContent()}

      </main>
    </div>
  );
};

export default Dashboard;