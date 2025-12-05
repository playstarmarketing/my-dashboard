import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, 
  TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  ArrowUpRight, ArrowDownRight, Settings, Loader2, AlertCircle
} from 'lucide-react';

// --- 1. 內建備用資料 (Fallback Data) ---
// 當 API 抓不到資料時，就會顯示這個，防止白屏
const MOCK_DATA = {
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
      "⚠️ 目前顯示的是內建備用資料 (API 連線中斷或尚未部署)",
      "若您在 Localhost 看到此訊息是正常的。",
      "請部署到 Netlify 後再確認 API 是否生效。"
    ]
  },
  // 其他平台的預設空資料
  website: { daily: [], metrics: {}, aiInsights: ["無資料"] },
  linkedin: { daily: [], metrics: {}, aiInsights: ["無資料"] },
  forum: { daily: [], metrics: {}, aiInsights: ["無資料"] },
  telegram: { daily: [], metrics: {}, aiInsights: ["無資料"] }
};

// --- 2. 元件定義 ---
const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        {Icon ? <Icon size={20} className="text-white" /> : <div className="w-5 h-5"/>}
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-slate-500'}`}>
          {change}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value || '-'}</p>
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
      {insights && insights.map((insight, index) => (
        <div key={index} className="flex gap-3 items-start bg-white/60 p-3 rounded-lg backdrop-blur-sm">
          <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-indigo-500" />
          <p className="text-sm text-indigo-900 leading-relaxed">{insight}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- 3. 主程式 ---
const Dashboard = () => {
  const [data, setData] = useState(MOCK_DATA.overview); // 預設先顯示備用資料
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // 嘗試連線 API
    fetch('/.netlify/functions/getData')
      .then(res => {
        if (!res.ok) throw new Error('API 回應錯誤');
        return res.json();
      })
      .then(apiResult => {
        // 成功抓到資料
        if (apiResult && apiResult.overview) {
          setData(apiResult.overview);
          setUseFallback(false);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.warn("API 連線失敗，切換至備用資料模式:", err);
        // 失敗時，保持使用 MOCK_DATA，不讓畫面白屏
        setData(MOCK_DATA.overview);
        setUseFallback(true);
        setIsLoading(false);
      });
  }, []);

  // 簡單的資料檢查
  const chartData = data.daily || [];
  const metrics = data.metrics || {};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      {/* 標題與狀態列 */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">全通路儀表板</h1>
        
        {/* 狀態提示：顯示目前是用 API 還是備用資料 */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${useFallback ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isLoading ? (
            <><Loader2 size={14} className="animate-spin"/> 連線中...</>
          ) : useFallback ? (
            <><AlertCircle size={14}/> 本機/離線模式 (Mock Data)</>
          ) : (
            <><Globe size={14}/> 雲端連線成功 (Live API)</>
          )}
        </div>
      </header>

      {/* AI 分析區塊 */}
      <div className="mb-8">
         <AIInsightCard insights={data.aiInsights} type="Overview" />
      </div>

      {/* 數據卡片區 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="總瀏覽量" value={metrics.totalViews} change={metrics.change} trend="up" icon={Eye} color="bg-indigo-600" />
        <MetricCard title="總互動數" value={metrics.totalEngagement} change={metrics.change} trend="up" icon={MousePointerClick} color="bg-pink-600" />
        <MetricCard title="AI 分數" value={metrics.aiScore} change="+2" trend="up" icon={Sparkles} color="bg-violet-600" />
        <MetricCard title="轉換率" value={metrics.conversionRate} change="-0.4%" trend="down" icon={TrendingUp} color="bg-emerald-600" />
      </div>

      {/* 圖表區 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
        <h3 className="font-bold mb-6 text-slate-700">流量趨勢圖表</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
              <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
              <Area type="monotone" dataKey="views" stroke="#6366f1" fillOpacity={1} fill="url(#colorView)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">無圖表數據</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;