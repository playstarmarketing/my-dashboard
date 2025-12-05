import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Globe, Linkedin, MessageSquare, Send, 
  TrendingUp, Users, Eye, MousePointerClick, Sparkles, 
  ArrowUpRight, ArrowDownRight, Settings, Loader2
} from 'lucide-react';

const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-slate-500'}`}>
          {change}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const Dashboard = () => {
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 這裡去呼叫我們剛剛建立的後端 API
    fetch('/.netlify/functions/getData')
      .then(res => {
        if (!res.ok) throw new Error('API 連線失敗');
        return res.json();
      })
      .then(data => {
        setApiData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 gap-2">
        <Loader2 className="animate-spin" /> 正在連線雲端資料庫...
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-8 text-center">
        <h2 className="text-xl font-bold mb-2">無法取得資料</h2>
        <p>如果您是在本機預覽，這是正常的（因為還沒上傳到 Netlify）。</p>
        <p>請執行 git push 上傳後，去 Netlify 網址查看。</p>
      </div>
    );
  }

  // 為了簡化，我們先只顯示 Overview 的資料來測試串接
  const data = apiData.overview;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <h1 className="text-2xl font-bold mb-6">我的全通路儀表板 (API 串接版)</h1>
      
      {/* AI 分析區塊 */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold">
          <Sparkles size={20} /> AI 智能分析
        </div>
        <div className="space-y-2">
          {data.aiInsights.map((text, i) => (
            <div key={i} className="bg-white/60 p-2 rounded text-indigo-800 text-sm">
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* 數據卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="總瀏覽量" value={data.metrics.totalViews} change={data.metrics.change} trend="up" icon={Eye} color="bg-indigo-600" />
        <MetricCard title="總互動數" value={data.metrics.totalEngagement} change={data.metrics.change} trend="up" icon={MousePointerClick} color="bg-pink-600" />
        <MetricCard title="AI 分數" value={data.metrics.aiScore} change="+2" trend="up" icon={Sparkles} color="bg-violet-600" />
        <MetricCard title="轉換率" value={data.metrics.conversionRate} change="-0.4%" trend="down" icon={TrendingUp} color="bg-emerald-600" />
      </div>

      {/* 圖表 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
        <h3 className="font-bold mb-4 text-slate-700">流量趨勢</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;