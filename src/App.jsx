import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, Activity, FileText, PieChart
} from 'lucide-react';

const STATIC_DATA = { overview: { daily: [], metrics: {}, aiInsights: ["Loading..."] } };

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

const AIInsightCard = ({ insights }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative mb-8">
    <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold"><Sparkles size={20} /> AI 行為分析報告</div>
    <div className="space-y-2">
      {insights && insights.map((text, i) => (
        <div key={i} className="bg-white/60 p-2 rounded text-indigo-800 text-sm">{text}</div>
      ))}
    </div>
  </div>
);

// 新增：按鈕點擊分析圖表
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex items-center justify-center text-slate-400">尚無按鈕點擊數據</div>
    )}
  </div>
);

const EmailListComponent = ({ emails }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 overflow-y-auto">
    <h3 className="font-bold mb-4 text-slate-700 flex items-center gap-2">
      <FileText size={18} /> Google Sheet 名單
    </h3>
    {emails && emails.length > 0 ? (
      <ul className="space-y-3">
        {emails.map((email, idx) => (
          <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
            <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">{idx + 1}</span>
            {email}
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-slate-400 text-sm text-center mt-10">尚無資料</div>
    )}
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
  
  const isTelegram = activeTab === 'telegram';
  const emailList = isTelegram ? (currentData.emailList || []) : [];
  const buttonStats = isTelegram ? (currentData.buttonStats || []) : []; // 取得按鈕數據

  const cardsConfig = isTelegram ? [
    { key: 'botInteractions', title: '總互動事件', icon: Activity, color: 'bg-sky-500' },
    { key: 'subscribers', title: '名單總數', icon: Users, color: 'bg-blue-500' },
    { key: 'broadcastOpenRate', title: '按鈕點擊數', icon: MousePointerClick, color: 'bg-pink-500' },
    { key: 'activeRate', title: '機器人狀態', icon: Globe, color: 'bg-green-500' }
  ] : [
    { key: 'totalViews', title: '總流量', icon: Eye, color: 'bg-indigo-600' },
    { key: 'totalEngagement', title: '總互動', icon: MousePointerClick, color: 'bg-pink-600' },
    { key: 'aiScore', title: 'AI 健康分', icon: Sparkles, color: 'bg-violet-600' },
    { key: 'conversionRate', title: '轉換數', icon: TrendingUp, color: 'bg-emerald-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 text-indigo-600 flex items-center gap-2">
          <LayoutDashboard size={28} /><span className="text-xl font-extrabold">OmniData</span>
        </div>
        <nav className="p-4 space-y-1">
          <button onClick={() => setActiveTab('overview')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"><LayoutDashboard size={18}/> 總覽</button>
          <button onClick={() => setActiveTab('telegram')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"><Send size={18}/> Telegram Bot</button>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold capitalize">{activeTab} Dashboard</h1>
          <div className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex gap-2 items-center">
            {isLoading ? <Loader2 className="animate-spin" size={14}/> : <Globe size={14}/>} 
            {isLoading ? "更新中..." : "系統線上"}
          </div>
        </header>

        <AIInsightCard insights={currentData.aiInsights} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {cardsConfig.map(config => {
            const m = metrics[config.key] || { value: '-', change: '' };
            return <MetricCard key={config.key} {...config} value={m.value} change={m.change} />;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：如果是在 Telegram 分頁，顯示按鈕點擊圖表；否則顯示流量圖表 */}
          <div className="lg:col-span-2">
             {isTelegram ? (
               <ButtonClickChart data={buttonStats} />
             ) : (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                 <h3 className="font-bold mb-6 text-slate-700">流量趨勢</h3>
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={currentData.daily || []}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                     <XAxis dataKey="name" tick={{fontSize: 12}} />
                     <YAxis tick={{fontSize: 12}} />
                     <Tooltip />
                     <Area type="monotone" dataKey="views" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             )}
          </div>
          
          {/* 右側：名單列表 */}
          <div className="lg:col-span-1">
            <EmailListComponent emails={emailList} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;