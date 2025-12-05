import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, 
  TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

// --- 靜態備用資料 ---
const STATIC_DATA = {
  overview: {
    daily: [
      { name: 'Mon', views: 4000 }, { name: 'Tue', views: 3000 }, { name: 'Wed', views: 2000 },
      { name: 'Thu', views: 2780 }, { name: 'Fri', views: 1890 }, { name: 'Sat', views: 2390 }, { name: 'Sun', views: 3490 },
    ],
    metrics: {
      totalViews: { value: '128.5K', change: '+12%', trend: 'up' },
      totalEngagement: { value: '42.3K', change: '+5%', trend: 'up' },
      conversionRate: { value: '3.2%', change: '-0.4%', trend: 'down' },
      aiScore: { value: '85/100', change: '+2', trend: 'up' },
    },
    aiInsights: ["✅ 這是靜態備用資料 (後端尚未回應)"]
  },
  telegram: {
    // 這裡加上 Telegram 的靜態測試資料
    daily: [
      { name: 'Mon', msgSent: 12 }, { name: 'Tue', msgSent: 19 }, { name: 'Wed', msgSent: 3 },
      { name: 'Thu', msgSent: 5 }, { name: 'Fri', msgSent: 2 }, { name: 'Sat', msgSent: 3 }, { name: 'Sun', msgSent: 10 },
    ],
    metrics: {
      botInteractions: { value: '3', change: '+New', trend: 'up' },
      subscribers: { value: '105', change: '+5', trend: 'up' },
      broadcastOpenRate: { value: '98%', change: '0%', trend: 'flat' },
      activeRate: { value: 'High', change: '', trend: 'flat' }
    },
    aiInsights: ["Telegram 測試資料"]
  }
};

// --- 元件 ---
const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        {Icon ? <Icon size={20} className="text-white" /> : <div className="w-5 h-5"/>}
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-slate-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
          {change}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value || '-'}</p>
  </div>
);

const AIInsightCard = ({ insights }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden mb-8">
    <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold relative z-10">
      <Sparkles size={20} /> AI 智能分析報告
    </div>
    <div className="space-y-2 relative z-10">
      {insights && insights.map((text, i) => (
        <div key={i} className="bg-white/60 p-2 rounded text-indigo-800 text-sm backdrop-blur-sm">
          {text}
        </div>
      ))}
    </div>
  </div>
);

// --- 主程式 ---
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(STATIC_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/.netlify/functions/getData');
        if (!res.ok) throw new Error('API 連線失敗');
        const result = await res.json();
        
        setData(result);
        setUseFallback(false);
      } catch (err) {
        console.warn("使用靜態資料:", err);
        setData(STATIC_DATA);
        setUseFallback(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 取得目前分頁的資料
  const currentData = data[activeTab] || STATIC_DATA[activeTab] || STATIC_DATA.overview;
  const metrics = currentData.metrics || {};
  const aiInsights = currentData.aiInsights || [];

  // 這是修正的關鍵：定義每個分頁要顯示什麼卡片 (Config)
  const getCardsConfig = () => {
    if (activeTab === 'telegram') {
      return [
        // 這裡對應後端回傳的 botInteractions, subscribers 等
        { key: 'botInteractions', title: '訊息互動數', icon: MessageSquare, color: 'bg-sky-500' },
        { key: 'subscribers', title: '訂閱人數', icon: Users, color: 'bg-blue-500' },
        { key: 'broadcastOpenRate', title: '推播開啟率', icon: Eye, color: 'bg-teal-500' },
        { key: 'activeRate', title: '活躍狀態', icon: Activity, color: 'bg-green-500', defaultValue: 'Online' }
      ];
    }
    // 預設 (Overview)
    return [
      { key: 'totalViews', title: '總瀏覽量', icon: Eye, color: 'bg-indigo-600' },
      { key: 'totalEngagement', title: '總互動數', icon: MousePointerClick, color: 'bg-pink-600' },
      { key: 'aiScore', title: 'AI 健康分', icon: Sparkles, color: 'bg-violet-600' },
      { key: 'conversionRate', title: '轉換率', icon: TrendingUp, color: 'bg-emerald-600' }
    ];
  };

  const cardsConfig = getCardsConfig();

  // 圖表設定
  let chartColor = "#6366f1";
  let dataKey = "views"; // 預設讀取 views 欄位
  
  if (activeTab === 'telegram') { 
    chartColor = "#0088cc"; 
    dataKey = "msgSent"; // Telegram 圖表改讀 msgSent 欄位
  } else if (activeTab === 'linkedin') {
    chartColor = "#0a66c2";
  }

  // 處理圖表資料 (若無資料顯示空陣列)
  const chartData = currentData.daily || [];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* 側邊欄 */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <LayoutDashboard size={28} />
            <span className="text-xl font-extrabold tracking-tight">OmniData</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Platform</p>
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard size={18} /> 總覽 (Overview)</button>
          <button onClick={() => setActiveTab('website')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'website' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}><Globe size={18} /> 官方網站</button>
          <button onClick={() => setActiveTab('linkedin')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'linkedin' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}><Linkedin size={18} /> LinkedIn</button>
          <button onClick={() => setActiveTab('telegram')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'telegram' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}><Send size={18} /> Telegram Bot</button>
        </nav>
      </aside>

      {/* 主內容 */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab} Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">即時數據監控中心</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${useFallback ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {isLoading ? <><Loader2 size={14} className="animate-spin"/> 讀取中...</> : 
             useFallback ? <><AlertCircle size={14}/> 離線模式</> : <><Globe size={14}/> 雲端連線成功</>}
          </div>
        </header>

        {/* AI 分析 */}
        <AIInsightCard insights={aiInsights} />

        {/* 動態渲染數據卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {cardsConfig.map((config) => {
            const metricData = metrics[config.key] || { value: config.defaultValue || '-', change: '0%', trend: 'flat' };
            return (
              <MetricCard 
                key={config.key}
                title={config.title} 
                value={metricData.value} 
                change={metricData.change} 
                trend={metricData.trend} 
                icon={config.icon} 
                color={config.color} 
              />
            );
          })}
        </div>

        {/* 圖表 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="font-bold mb-6 text-slate-700">趨勢圖表 ({activeTab})</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey={dataKey === 'views' ? 'views' : dataKey} stroke={chartColor} fillOpacity={1} fill="url(#colorMain)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">目前尚無圖表數據</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;