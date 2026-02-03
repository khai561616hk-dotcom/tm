'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Star, TrendingUp, Users, Building2, Award, Heart, Shield, Smile, Frown, Meh, Settings, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

// Mock Data - 5 Branches
const branchesData = [
  { id: 1, name: 'Cơ Sở 1 - Quận 1', csat: 4.8, nps: 85, totalReviews: 324, trend: '+12%' },
  { id: 2, name: 'Cơ Sở 2 - Quận 3', csat: 4.6, nps: 78, totalReviews: 298, trend: '+8%' },
  { id: 3, name: 'Cơ Sở 3 - Quận 7', csat: 4.9, nps: 92, totalReviews: 412, trend: '+15%' },
  { id: 4, name: 'Cơ Sở 4 - Thủ Đức', csat: 4.5, nps: 72, totalReviews: 256, trend: '+5%' },
  { id: 5, name: 'Cơ Sở 5 - Bình Thạnh', csat: 4.7, nps: 81, totalReviews: 345, trend: '+10%' },
]

const topPerformers = [
  { id: 1, name: 'BS. Nguyễn Văn A', branch: 'Cơ Sở 3', score: 4.95, badge: '🏅', reviews: 156, specialty: 'Nha khoa thẩm mỹ' },
  { id: 2, name: 'KTV. Trần Thị B', branch: 'Cơ Sở 1', score: 4.92, badge: '❤️', reviews: 142, specialty: 'Chăm sóc khách hàng' },
  { id: 3, name: 'BS. Lê Minh C', branch: 'Cơ Sở 3', score: 4.89, badge: '🛡️', reviews: 138, specialty: 'Điều trị nha chu' },
]

const chartData = branchesData.map(b => ({ name: b.name.split(' - ')[1], CSAT: b.csat, NPS: b.nps / 20 }))

const radarData = [
  { metric: 'Thái độ', value: 95 },
  { metric: 'Kỹ thuật', value: 88 },
  { metric: 'Vệ sinh', value: 92 },
  { metric: 'Tư vấn', value: 85 },
  { metric: 'Hậu mãi', value: 90 },
]

export default function Home() {
  const [filters, setFilters] = useState({
    dateOption: 'month',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  })
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalStaff: 0,
    avgScore: 0, // renamed from avgCSAT
    satisfactionRate: 0, // renamed from totalNPS
    branchesData: [] as any[],
    topPerformers: [] as any[],
    radarData: [] as any[]
  })

  useEffect(() => {
    // 1. Load Data
    const savedReviews = JSON.parse(localStorage.getItem('clinic_reviews') || '[]')
    const savedBranches = JSON.parse(localStorage.getItem('clinic_branches') || '[]')
    const savedStaff = JSON.parse(localStorage.getItem('clinic_staff') || '[]')
    const configCriteria = JSON.parse(localStorage.getItem('clinic_criteria') || '[]')

    const branchesList = savedBranches.length > 0 ? savedBranches : [
      { id: 1, name: 'Chi nhánh Thanh Xuân, Hà Nội', staff: 12 },
      { id: 2, name: 'Chi nhánh Vinh Nghệ An', staff: 9 },
      { id: 3, name: 'Chi nhánh Quận 5', staff: 15 },
      { id: 4, name: 'Chi nhánh Phổ Quang', staff: 8 },
      { id: 5, name: 'Chi nhánh Quận 6', staff: 13 },
      { id: 6, name: 'Chi nhánh Quận Thủ Đức', staff: 10 },
    ]

    // Helpers
    const getWeekNumber = (d: Date) => {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    }

    const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    }

    // 2. Filter Reviews by Time
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentWeek = getWeekNumber(now)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const filteredReviews = savedReviews.filter((r: any) => {
      const rDate = new Date(r.createdAt || r.date || new Date())
      const reviewWeek = getWeekNumber(rDate)

      switch (filters.dateOption) {
        case 'today':
          return isSameDay(rDate, now)
        case 'yesterday':
          return isSameDay(rDate, yesterday)
        case 'this_week':
          return rDate.getFullYear() === currentYear && reviewWeek === currentWeek
        case 'last_week':
          if (currentWeek === 1) return rDate.getFullYear() === currentYear - 1 && getWeekNumber(rDate) >= 52
          return rDate.getFullYear() === currentYear && reviewWeek === currentWeek - 1
        case 'month':
          return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === currentYear
        case 'this_year':
          return rDate.getFullYear() === currentYear
        case 'last_year':
          return rDate.getFullYear() === currentYear - 1
        case 'custom_year':
          return rDate.getFullYear() === Number(filters.year || currentYear)
        case 'custom_range':
          if (!filters.startDate || !filters.endDate) return true
          const start = new Date(filters.startDate)
          const end = new Date(filters.endDate)
          end.setHours(23, 59, 59, 999)
          return rDate >= start && rDate <= end
        case 'all':
          return true
        default:
          return true
      }
    })

    // 3. Calculate Global Stats
    const totalReviews = filteredReviews.length
    const totalRatingSum = filteredReviews.reduce((sum: number, r: any) => sum + (r.averageScore || 0), 0)
    const avgScore = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : '0.0'

    // Satisfaction Rate (formerly NPS) - Percentage of >= 4 stars
    const happyReviews = filteredReviews.filter((r: any) => (r.averageScore || 0) >= 4).length
    const satisfactionRate = totalReviews > 0 ? Math.round((happyReviews / totalReviews) * 100) : 0

    // 4. Calculate Branch Stats for Charts
    const branchesStats = branchesList.map((branch: any) => {
      const branchReviews = filteredReviews.filter((r: any) => r.branch === branch.name)
      const bTotal = branchReviews.length
      const bSum = branchReviews.reduce((sum: number, r: any) => sum + (r.averageScore || 0), 0)
      const bAvg = bTotal > 0 ? (bSum / bTotal).toFixed(1) : '0.0'
      const bHappy = branchReviews.filter((r: any) => (r.averageScore || 0) >= 4).length
      const bSatRate = bTotal > 0 ? Math.round((bHappy / bTotal) * 100) : 0

      return {
        id: branch.id,
        name: branch.name,
        avgScore: parseFloat(bAvg),
        satisfactionRate: bSatRate,
        totalReviews: bTotal,
        trend: bTotal > 0 ? '+Ổn định' : '---'
      }
    })

    // 5. Top Performers
    const staffPerformance: Record<string, { total: number, count: number, branch: string }> = {}
    filteredReviews.forEach((r: any) => {
      if (r.staff) {
        if (!staffPerformance[r.staff]) staffPerformance[r.staff] = { total: 0, count: 0, branch: r.branch }
        staffPerformance[r.staff].total += (r.averageScore || 0)
        staffPerformance[r.staff].count += 1
      }
    })

    const topPerformersData = Object.entries(staffPerformance)
      .map(([name, data]) => ({
        id: name,
        name: name,
        branch: data.branch,
        score: (data.total / data.count).toFixed(2),
        reviews: data.count,
        badge: '🏅',
        specialty: 'Nhân viên xuất sắc'
      }))
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
      .slice(0, 3)

    // 6. Radar Data (Criteria Comparison) - Aggregated
    // Initialize defaults if localStorage is empty
    const defaultCriteria = [
      { id: 'c1', label: 'Kỹ năng' },
      { id: 'c2', label: 'Thái độ' },
      { id: 'c3', label: 'Vệ sinh' }
    ]
    const activeCriteria = configCriteria.length > 0 ? configCriteria : defaultCriteria

    const criteriaStats: Record<string, { total: number, count: number, label: string }> = {}
    activeCriteria.forEach((c: any) => {
      criteriaStats[c.id] = { total: 0, count: 0, label: c.label }
    })

    filteredReviews.forEach((r: any) => {
      if (r.ratings) {
        Object.entries(r.ratings).forEach(([k, v]: [string, any]) => {
          if (criteriaStats[k]) {
            criteriaStats[k].total += v.score
            criteriaStats[k].count += 1
          }
        })
      }
    })

    const radarData = Object.values(criteriaStats).map(c => ({
      metric: c.label,
      value: c.count > 0 ? (c.total / c.count).toFixed(1) : 0, // Scale 0-5
      fullMark: 5
    }))

    setStats({
      totalBranches: branchesList.length,
      totalStaff: savedStaff.length > 0 ? savedStaff.length : 0,
      avgScore: parseFloat(avgScore),
      satisfactionRate: satisfactionRate,
      branchesData: branchesStats,
      topPerformers: topPerformersData,
      radarData: radarData
    })
  }, [filters]) // Re-run when filters changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="glass-effect shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-medical-blue to-soft-teal p-3 rounded-xl shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-medical-blue to-soft-teal bg-clip-text text-transparent">
                Quality Center
              </h1>
              <p className="text-sm text-gray-600">Hệ thống Đánh giá Chất lượng</p>
            </div>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            <Link href="/admin/branches" className="px-3 md:px-4 py-2 rounded-lg hover:bg-white/50 transition-all text-sm font-semibold text-gray-700 hover:text-medical-blue whitespace-nowrap">
              Chi nhánh
            </Link>
            <Link href="/admin/staff" className="px-3 md:px-4 py-2 rounded-lg hover:bg-white/50 transition-all text-sm font-semibold text-gray-700 hover:text-medical-blue whitespace-nowrap">
              Nhân viên
            </Link>
            <Link href="/admin/leaderboard" className="px-3 md:px-4 py-2 rounded-lg hover:bg-white/50 transition-all text-sm font-semibold text-gray-700 hover:text-medical-blue flex items-center gap-1 whitespace-nowrap">
              <Award className="w-4 h-4" /> BXH
            </Link>
            <Link href="/admin/reviews" className="px-3 md:px-4 py-2 rounded-lg hover:bg-white/50 transition-all text-sm font-semibold text-gray-700 hover:text-medical-blue whitespace-nowrap">
              Đánh giá
            </Link>
            <Link href="/admin/settings" className="px-3 md:px-4 py-2 rounded-lg hover:bg-white/50 transition-all text-sm font-semibold text-gray-700 hover:text-medical-blue flex items-center gap-1 whitespace-nowrap">
              <Settings className="w-4 h-4" /> Cấu hình
            </Link>
            <Link href="/portal" className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
              <Users className="w-4 h-4" /> Portal Khách
            </Link>
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-500">Tổng Quản lý</p>
              <p className="font-semibold text-gray-800">Admin Dashboard</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-medical-blue to-soft-teal flex items-center justify-center text-white font-bold flex-shrink-0">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-xl font-bold text-gray-800">Tổng quan Hoạt động</h2>
          <div className="flex flex-col md:flex-row items-end gap-2">

            {/* Dynamic Inputs */}
            {filters.dateOption === 'custom_year' && (
              <div className="animate-in fade-in slide-in-from-right-2">
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-medical-blue outline-none w-32 shadow-sm"
                  placeholder="Nhập năm..."
                />
              </div>
            )}
            {filters.dateOption === 'custom_range' && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-medical-blue outline-none shadow-sm"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-medical-blue outline-none shadow-sm"
                />
              </div>
            )}

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.dateOption}
                onChange={(e) => setFilters({ ...filters, dateOption: e.target.value })}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-medical-blue outline-none font-medium text-blue-700 bg-white shadow-sm appearance-none border-gray-200 hover:border-medical-blue transition-colors cursor-pointer"
              >
                <option value="all">Toàn bộ thời gian</option>
                <option value="today">📅 Hôm nay</option>
                <option value="yesterday">📅 Hôm qua</option>
                <option value="this_week">📅 Tuần này</option>
                <option value="last_week">📅 Tuần trước</option>
                <option value="month">📅 Tháng này</option>
                <option value="this_year">📅 Năm nay</option>
                <option value="last_year">📅 Năm trước</option>
                <option value="custom_year">📅 Chọn theo Năm</option>
                <option value="custom_range">📅 Tùy chọn ngày...</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Building2 />} label="Tổng Cơ Sở" value={stats.totalBranches} gradient="from-blue-400 to-blue-600" />
          <StatCard icon={<Users />} label="Nhân Viên" value={stats.totalStaff} gradient="from-teal-400 to-teal-600" />
          <StatCard icon={<Star />} label="Điểm Đánh Giá TB" value={stats.avgScore} gradient="from-amber-400 to-amber-600" sub="Thang điểm 5.0" />
          <StatCard icon={<TrendingUp />} label="Tỉ Lệ Hài Lòng" value={`${stats.satisfactionRate}%`} gradient="from-green-400 to-green-600" sub="Khách chấm >= 4 sao" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 card-hover">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="text-medical-blue" />
              So Sánh Chất Lượng Giữa Các Cơ Sở
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.branchesData.map(b => ({ name: b.name.replace('Chi nhánh', 'CN'), Score: b.avgScore, SatRate: b.satisfactionRate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar name="Điểm TB" dataKey="Score" fill="#4A90E2" radius={[8, 8, 0, 0]} />
                {/* Scaled Satisfaction Rate for dual axis visualization effect or just tooltip */}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6 card-hover">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-soft-teal" />
              Chất Lượng Theo Tiêu Chí
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar name="Điểm TB" dataKey="value" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 card-hover">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-amber-500" />
            🏆 Wall of Fame - Nhân Viên Xuất Sắc
          </h2>
          {stats.topPerformers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topPerformers.map((perf, idx) => (
                <div key={perf.id} className={`relative p-6 rounded-xl border-2 ${idx === 0 ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="absolute -top-3 -right-3 text-4xl">{perf.badge}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-medical-blue to-soft-teal flex items-center justify-center text-white font-bold text-lg">
                      {perf.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg truncate w-32">{perf.name}</h3>
                      <p className="text-xs text-gray-600 truncate w-32">{perf.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-bold text-medical-blue">{perf.score}</span>
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{perf.specialty}</p>
                  <p className="text-xs text-gray-500">{perf.reviews} đánh giá</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center">Chưa có đủ dữ liệu đánh giá trong khoảng thời gian này.</p>}
        </div>

        {/* Branch List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 card-hover">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="text-medical-blue" />
            Chi Tiết Các Cơ Sở
          </h2>
          <div className="space-y-4">
            {stats.branchesData.map(branch => (
              <div key={branch.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:shadow-md transition-all cursor-pointer gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-blue to-soft-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {branch.id}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">{branch.name}</h3>
                    <p className="text-sm text-gray-600">{branch.totalReviews} đánh giá</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full justify-between md:justify-end">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Điểm TB</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-xl font-bold text-medical-blue">{branch.avgScore}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">% Hài Lòng</p>
                    <span className="text-xl font-bold text-soft-teal">{branch.satisfactionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
        <p>💚 Hệ thống Đánh giá Chất lượng - Phòng khám Đa chi nhánh</p>
      </footer>
    </div>
  )
}

function StatCard({ icon, label, value, gradient, sub }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SentimentCard({ icon, label, count, color, bgColor }: any) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 card-hover`}>
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{count}</p>
    </div>
  )
}
