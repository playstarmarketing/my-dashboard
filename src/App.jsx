import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, 
  TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  Loader2, AlertCircle
} from 'lucide-react';

// --- 靜態資料 (修正了資料結構) ---
const STATIC_DATA = {
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
    "✅ 錯誤已修復！資料讀取路徑已更正。",
    "現在您應該能清楚看到數據卡片與圖表。",
    "此版本為靜態展示，確保系統穩定性。"
  ]
};

// --- 元件 ---
const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        {Icon ? <Icon size={20} className="text-white" /> : <div className="w-5 h-5"/>}
      </div>
      <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-slate-500'}`}>
        {change}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    {/* 這裡之前出錯了，現在確保只顯示文字或數字 */}
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const Dashboard = () => {
  // 直接使用靜態資料
  const data = STATIC_DATA;
  const metrics = data.metrics; 

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">全通路儀表板</h1>
        <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 w-fit rounded-full text-xs font-medium">
            <Loader2 size={14} className="animate-spin" />
            <span>系統修復完成：React 渲染正常</span>
        </div>
      </header>

      {/* AI 分析區塊 */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold">
          <Sparkles size={20} /> 系統狀態報告
        </div>
        <div className="space-y-2">
          {data.aiInsights.map((text, i) => (
            <div key={i} className="bg-white/60 p-2 rounded text-indigo-800 text-sm">
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* 數據卡片區 - 修正了這裡的資料傳遞方式 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="總瀏覽量" 
          value={metrics.totalViews.value} 
          change={metrics.totalViews.change} 
          trend={metrics.totalViews.trend} 
          icon={Eye} 
          color="bg-indigo-600" 
        />
        <MetricCard 
          title="總互動數" 
          value={metrics.totalEngagement.value} 
          change={metrics.totalEngagement.change} 
          trend={metrics.totalEngagement.trend} 
          icon={MousePointerClick} 
          color="bg-pink-600" 
        />
        <MetricCard 
          title="AI 分數" 
          value={metrics.aiScore.value} 
          change={metrics.aiScore.change} 
          trend={metrics.aiScore.trend} 
          icon={Sparkles} 
          color="bg-violet-600" 
        />
        <MetricCard 
          title="轉換率" 
          value={metrics.conversionRate.value} 
          change={metrics.conversionRate.change} 
          trend={metrics.conversionRate.trend} 
          icon={TrendingUp} 
          color="bg-emerald-600" 
        />
      </div>

      {/* 圖表區 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
        <h3 className="font-bold mb-6 text-slate-700">流量趨勢</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.daily}>
            <defs>
              <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#6366f1" fillOpacity={1} fill="url(#colorView)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;