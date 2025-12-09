import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Calendar, LayoutTemplate, Target
} from 'lucide-react';

const STATIC_TRENDS = {
  daily: [{name:'Mon', value:10}, {name:'Tue', value:15}, {name:'Wed', value:8}, {name:'Thu', value:12}, {name:'Fri', value:20}, {name:'Sat', value:14}, {name:'Sun', value:18}],
  weekly: [{name:'Week 1', value:80}, {name:'Week 2', value:120}, {name:'Week 3', value:95}, {name:'Week 4', value:150}],
  monthly: [{name:'Jan', value:400}, {name:'Feb', value:380}, {name:'Mar', value:520}, {name:'Apr', value:480}]
};

const STATIC_DATA = { 
  overview: { trends: STATIC_TRENDS, metrics: {}, aiInsights: ["Loading..."] },
  website: { daily: [], metrics: {}, aiInsights: [] },
  landing: { daily: [], metrics: {}, aiInsights: [] }, // 🆕 初始化
  telegram: { trends: STATIC_TRENDS, metrics: {}, aiInsights: [], buttonStats: [] }
};

const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        {Icon ? <Icon size={20} className="text-white" /> : <div className="w-5 h-5"/>}
      </div>
      <div className="text-sm font-medium text-emerald-500">{change}</div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value || '-'}</p>
  </div>
);

const ButtonClickChart = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
    <h3 className="font-bold mb-6 text-slate-700 flex items-center gap-2">
      <MousePointerClick size={18} /> 用戶熱點分析 (Button Clicks)
    </h3>
    {data && data.length > 0 ? (
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0"/>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
          <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex items-center justify-center text-slate-400">尚無按鈕點擊數據</div>
    )}
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('daily'); 
  const [data, setData] = useState(STATIC_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/getData')
      .then(res => res.json())
      .then(result => { setData(result); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const currentData = data[activeTab] || data.overview || {};
  const metrics = currentData.metrics || {};
  const trends = currentData.trends || STATIC_TRENDS;
  const chartData = trends[timeRange] || trends.daily || [];

  const isTelegram = activeTab === 'telegram';
  const buttonStats = isTelegram ? (currentData.buttonStats || []) : [];

  // 根據不同 Tab 定義顯示的卡片
  let cardsConfig = [];
  
  if (activeTab === 'telegram') {
    cardsConfig = [
      { key: 'botInteractions', title: '訊息互動數', icon: MessageSquare, color: 'bg-sky-500' },
      { key: 'subscribers', title: 'Email 名單數 (Leads)', icon: Users, color: 'bg-blue-500' },
      { key: 'broadcastOpenRate', title: '按鈕點擊數', icon: MousePointerClick, color: 'bg-pink-500' },
      { key: 'activeRate', title: '機器人狀態', icon: Globe, color: 'bg-green-500' }
    ];
  } else if (activeTab === 'website') {
    cardsConfig = [
      { key: 'pageviews', title: '總瀏覽量', icon: Eye, color: 'bg-emerald-500' },
      { key: 'avgSession', title: '平均停留時間', icon: Activity, color: 'bg-orange-500' },
      { key: 'bounceRate', title: '跳出率', icon: ArrowDownRight, color: 'bg-red-500' },
      { key: 'conversion', title: '轉換率', icon: TrendingUp, color: 'bg-indigo-500' }
    ];
  } else if (activeTab === 'landing') {
    // 🆕 Landing Page 專屬卡片
    cardsConfig = [
      { key: 'visitors', title: '活動頁訪客', icon: Target, color: 'bg-rose-500' },
      { key: 'ctaClicks', title: 'CTA 點擊數', icon: MousePointerClick, color: 'bg-amber-500' },
      { key: 'signup', title: '名單獲取 (Leads)', icon: Users, color: 'bg-blue-600' },
      { key: 'costPerLead', title: 'CPL (獲客成本)', icon: TrendingUp, color: 'bg-slate-600' }
    ];
  } else {
    // Overview
    cardsConfig = [
      { key: 'totalViews', title: '全通路總流量', icon: Eye, color: 'bg-indigo-600' },
      { key: 'totalEngagement', title: '總互動', icon: MousePointerClick, color: 'bg-pink-600' },
      { key: 'aiScore', title: 'AI 健康分', icon: Sparkles, color: 'bg-violet-600' },
      { key: 'conversionRate', title: '名單轉換數', icon: TrendingUp, color: 'bg-emerald-600' }
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 text-indigo-600 flex items-center gap-2">
          <LayoutDashboard size={28} /><span className="text-xl font-extrabold">OmniData</span>
        </div>
        <nav className="p-4 space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard size={18}/> 總覽</button>
          
          <button onClick={() => setActiveTab('website')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'website' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}><Globe size={18} /> 官方網站</button>
          
          {/* 🆕 新增 Landing Page 按鈕 */}
          <button onClick={() => setActiveTab('landing')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'landing' ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutTemplate size={18} /> Landing Page</button>
          
          <button onClick={() => setActiveTab('linkedin')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'linkedin' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}><Linkedin size={18} /> LinkedIn</button>
          
          <button onClick={() => setActiveTab('telegram')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'telegram' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}><Send size={18}/> Telegram Bot</button>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold capitalize">{activeTab === 'landing' ? 'Landing Page' : activeTab} Dashboard</h1>
            <div className="flex gap-2 mt-1 items-center">
               <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex gap-1 items-center w-fit">
                 {isLoading ? <Loader2 className="animate-spin" size={12}/> : <Globe size={12}/>} 
                 {isLoading ? "更新中..." : "系統線上"}
               </div>
            </div>
          </div>

          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                  timeRange === range ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range === 'daily' ? '每日' : range === 'weekly' ? '每周' : '每月'}
              </button>
            ))}
          </div>
        </header>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative mb-8">
          <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold"><Sparkles size={20} /> AI 智能分析報告</div>
          <div className="space-y-2">
            {(currentData.aiInsights || []).map((text, i) => (
              <div key={i} className="bg-white/60 p-2 rounded text-indigo-800 text-sm">{text}</div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {cardsConfig.map(config => {
            const m = metrics[config.key] || { value: '-', change: '' };
            return <MetricCard key={config.key} {...config} value={m.value} change={m.change} />;
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
            <h3 className="font-bold mb-6 text-slate-700 flex items-center gap-2">
              <TrendingUp size={18} /> 流量趨勢 ({timeRange === 'daily' ? '每日' : timeRange === 'weekly' ? '每周' : '每月'})
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTab === 'landing' ? "#e11d48" : isTelegram ? "#0088cc" : "#6366f1"} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={activeTab === 'landing' ? "#e11d48" : isTelegram ? "#0088cc" : "#6366f1"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey={isTelegram ? "msgSent" : "value"} stroke={activeTab === 'landing' ? "#e11d48" : isTelegram ? "#0088cc" : "#6366f1"} fillOpacity={1} fill="url(#colorMain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {isTelegram && <ButtonClickChart data={buttonStats} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;