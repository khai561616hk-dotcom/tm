'use client'

import { useState, useEffect, useMemo } from 'react'
import { Award, Search, Filter, Calendar, Star, TrendingUp, User, ArrowUp, ArrowDown } from 'lucide-react'

export default function LeaderboardPage() {
    const [reviews, setReviews] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [branches, setBranches] = useState<any[]>([])

    // Filters
    const [branchFilter, setBranchFilter] = useState('all')
    const [filters, setFilters] = useState({
        dateOption: 'month', // default to month as before
        year: new Date().getFullYear(),
        startDate: '',
        endDate: '',
        search: ''
    })

    // Load Data
    useEffect(() => {
        const savedReviews = JSON.parse(localStorage.getItem('clinic_reviews') || '[]')
        const savedStaff = JSON.parse(localStorage.getItem('clinic_staff') || '[]')
        const savedBranches = JSON.parse(localStorage.getItem('clinic_branches') || '[]')

        setReviews(savedReviews)
        setStaffList(savedStaff)
        setBranches(savedBranches)
    }, [])

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

    // Calculate Stats
    const leaderboardData = useMemo(() => {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentWeek = getWeekNumber(now)

        // 1. Filter Reviews by Time & Branch (Review level)
        const filteredReviews = reviews.filter(r => {
            // Branch Filter
            if (branchFilter !== 'all' && r.branch !== branchFilter) return false

            // Time Filter
            const rDate = new Date(r.createdAt || r.date || new Date())
            const reviewWeek = getWeekNumber(rDate)
            const yesterday = new Date(now)
            yesterday.setDate(yesterday.getDate() - 1)

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

        // 2. Aggregate by Staff
        const stats: Record<string, {
            name: string,
            branch: string,
            totalScore: number,
            count: number,
            npsCount: number, // 4-5 stars
            reviews: any[]
        }> = {}

        filteredReviews.forEach(r => {
            if (r.staff) {
                if (!stats[r.staff]) {
                    // Find staff details
                    const staffParams = staffList.find(s => s.name === r.staff)
                    stats[r.staff] = {
                        name: r.staff,
                        branch: r.branch,
                        totalScore: 0,
                        count: 0,
                        npsCount: 0,
                        reviews: []
                    }
                }
                stats[r.staff].totalScore += (r.averageScore || 0)
                stats[r.staff].count += 1
                if ((r.averageScore || 0) >= 4) stats[r.staff].npsCount += 1
                stats[r.staff].reviews.push(r)
            }
        })

        // 3. Convert to Array and Rank
        let result = Object.values(stats).map(s => {
            const avg = s.count > 0 ? (s.totalScore / s.count).toFixed(2) : '0.00'
            const satRate = s.count > 0 ? Math.round((s.npsCount / s.count) * 100) : 0

            return {
                ...s,
                id: s.name, // simple id
                avgScore: parseFloat(avg),
                satisfactionRate: satRate,
            }
        })

        // Filter by search term
        if (filters.search) {
            result = result.filter(s => s.name.toLowerCase().includes(filters.search.toLowerCase()))
        }

        // Check if branch filter is applied but maybe staff has no reviews yet? 
        // Usually leaderboard shows only active staff. simpler.

        // Sort by Avg Score DESC, then Count DESC
        return result.sort((a, b) => {
            if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
            return b.count - a.count
        })
    }, [reviews, staffList, filters, branchFilter])

    const top3 = leaderboardData.slice(0, 3)
    const rest = leaderboardData.slice(3)

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Award className="text-amber-500" />
                        Bảng Xếp Hạng Nhân Viên
                    </h1>
                    <p className="text-gray-500 text-sm">Vinh danh những cá nhân xuất sắc nhất hệ thống</p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <div className="flex gap-2">
                        <select
                            value={filters.dateOption}
                            onChange={(e) => setFilters({ ...filters, dateOption: e.target.value })}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium text-blue-700 bg-blue-50"
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

                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                        >
                            <option value="all">Tất cả Chi nhánh</option>
                            {branches.map(b => (
                                <option key={b.name} value={b.name}>{b.name.replace('Chi nhánh', 'CN')}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Inputs */}
                    {filters.dateOption === 'custom_year' && (
                        <input
                            type="number"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                            className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
                            placeholder="Nhập năm..."
                        />
                    )}
                    {filters.dateOption === 'custom_range' && (
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
                            />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Top 3 Podium */}
            {top3.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
                    {/* 2nd Place */}
                    {top3[1] && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 relative order-2 md:order-1 transform md:scale-95">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-300 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow">2</div>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {top3[1].name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg truncate">{top3[1].name}</h3>
                                <p className="text-xs text-gray-500 mb-2 truncate">{top3[1].branch}</p>
                                <div className="flex justify-center items-center gap-1 text-medical-blue font-bold text-xl">
                                    <span>{top3[1].avgScore}</span> <Star className="w-4 h-4 fill-current" />
                                </div>
                                <p className="text-xs text-green-600 font-medium">{top3[1].satisfactionRate}% Hài lòng</p>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                        <div className="bg-gradient-to-b from-yellow-50 to-white rounded-2xl shadow-xl p-6 border-2 border-amber-200 relative order-1 md:order-2 transform md:-translate-y-4">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg text-lg">1</div>
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full mb-3 flex items-center justify-center text-3xl font-bold text-amber-500 border-4 border-white shadow-sm">
                                    {top3[0].name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-gray-900 text-xl truncate">{top3[0].name}</h3>
                                <p className="text-sm text-gray-600 mb-3 truncate">{top3[0].branch}</p>
                                <div className="flex justify-center items-center gap-2 text-amber-500 font-bold text-3xl mb-1">
                                    <span>{top3[0].avgScore}</span> <Star className="w-6 h-6 fill-current" />
                                </div>
                                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                    <TrendingUp className="w-3 h-3" /> {top3[0].satisfactionRate}% Hài lòng
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{top3[0].count} đánh giá</p>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-50 relative order-3 transform md:scale-95">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-300 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow">3</div>
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-orange-400">
                                    {top3[2].name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg truncate">{top3[2].name}</h3>
                                <p className="text-xs text-gray-500 mb-2 truncate">{top3[2].branch}</p>
                                <div className="flex justify-center items-center gap-1 text-medical-blue font-bold text-xl">
                                    <span>{top3[2].avgScore}</span> <Star className="w-4 h-4 fill-current" />
                                </div>
                                <p className="text-xs text-green-600 font-medium">{top3[2].satisfactionRate}% Hài lòng</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue outline-none"
                />
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Hạng</th>
                            <th className="px-6 py-4">Nhân viên</th>
                            <th className="px-6 py-4">Chi nhánh</th>
                            <th className="px-6 py-4 text-center">Số đánh giá</th>
                            <th className="px-6 py-4 text-center">Hài lòng</th>
                            <th className="px-6 py-4 text-right">Điểm TB</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {leaderboardData.map((staff, idx) => (
                            <tr key={staff.id} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${idx < 3 ? 'bg-medical-blue text-white' : 'text-gray-500 bg-gray-100'}`}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-medical-blue transition-colors">
                                    {staff.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {staff.branch}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-600">
                                    {staff.count}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${staff.satisfactionRate >= 90 ? 'bg-green-100 text-green-700' : staff.satisfactionRate >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {staff.satisfactionRate}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="inline-flex items-center gap-1 font-bold text-gray-800">
                                        <span>{staff.avgScore}</span>
                                        <Star className={`w-4 h-4 ${staff.avgScore >= 4.5 ? 'text-amber-400 fill-amber-400' : staff.avgScore < 3 ? 'text-red-400 fill-red-400' : 'text-gray-300'}`} />
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {leaderboardData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    Không tìm thấy dữ liệu nhân viên nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
