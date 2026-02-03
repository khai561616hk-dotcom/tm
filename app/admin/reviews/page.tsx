'use client'

import { useState, useMemo, useEffect } from 'react'
import { utils, writeFile } from 'xlsx'
import { Star, Filter, Plus, Edit2, Trash2, Building2, User, Calendar, MessageSquare, ArrowLeft, Search, Download, ChevronDown, Trophy, RotateCcw } from 'lucide-react'
import Link from 'next/link'

// Helper để xử lý ngày tháng
const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString()
const getWeekNumber = (d: Date) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Mock Data mẫu
// Mock Data mẫu
const mockReviews = [
  {
    id: 1, branch: 'Cơ Sở 3 - Quận 7', staff: 'BS. Nguyễn Văn A', rating: 5, sentiment: 'happy', tags: ['Nhẹ nhàng'], comment: 'Bác sĩ rất tận tâm và chuyên nghiệp!', date: '2026-02-03',
    patient: 'Nguyễn Thị M', customerCode: 'KH001', customerPhone: '0901234567', customerEmail: 'm.nguyen@example.com', serviceDate: '2026-02-03',
    detailedRatings: { 'c1': { score: 5 }, 'c2': { score: 5, comment: 'Rất nhiệt tình' }, 'c3': { score: 5 } }
  },
  {
    id: 2, branch: 'Cơ Sở 1 - Quận 1', staff: 'KTV. Trần Thị B', rating: 5, sentiment: 'happy', tags: ['Vui vẻ', 'Chuyên nghiệp'], comment: 'Kỹ thuật viên rất thân thiện.', date: '2026-02-03',
    patient: 'Lê Văn N', customerCode: 'KH002', customerPhone: '0909888777', customerEmail: '', serviceDate: '2026-02-03',
    detailedRatings: { 'c1': { score: 5 }, 'c2': { score: 5 }, 'c3': { score: 5 } }
  },
  {
    id: 3, branch: 'Cơ Sở 3 - Quận 7', staff: 'BS. Lê Minh C', rating: 4, sentiment: 'happy', tags: ['Tận tâm'], comment: 'Tốt, tuy nhiên thời gian chờ hơi lâu.', date: '2026-02-02',
    patient: 'Trần Thị P', customerCode: 'KH003', customerPhone: '0912345678', customerEmail: 'p.tran@email.com', serviceDate: '2026-02-01',
    detailedRatings: { 'c1': { score: 4 }, 'c2': { score: 5 }, 'c3': { score: 3, comment: 'Sàn nhà hơi ướt' } }
  },
  {
    id: 4, branch: 'Cơ Sở 2 - Quận 3', staff: 'KTV. Phạm Thu D', rating: 3, sentiment: 'neutral', tags: ['Chậm trễ'], comment: 'Bình thường.', date: '2026-01-28',
    patient: 'Phạm Văn Q', customerCode: 'KH004', customerPhone: '0987654321', customerEmail: '', serviceDate: '2026-01-28',
    detailedRatings: { 'c1': { score: 3 }, 'c2': { score: 3 }, 'c3': { score: 4 } }
  },
  {
    id: 5, branch: 'Cơ Sở 1 - Quận 1', staff: 'BS. Nguyễn Văn A', rating: 5, sentiment: 'happy', tags: ['Nhẹ nhàng'], comment: 'Rất hài lòng!', date: '2026-01-15',
    patient: 'Vũ Thị R', customerCode: 'KH005', customerPhone: '0933444555', customerEmail: 'r.vu@test.com', serviceDate: '2026-01-15',
    detailedRatings: { 'c1': { score: 5 }, 'c2': { score: 5 }, 'c3': { score: 5 } }
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])

  // Dynamic Config State
  const [config, setConfig] = useState({
    branches: [
      'Chi nhánh Thanh Xuân, Hà Nội',
      'Chi nhánh Vinh Nghệ An',
      'Chi nhánh Quận 5',
      'Chi nhánh Phổ Quang',
      'Chi nhánh Quận 6',
      'Chi nhánh Quận Thủ Đức'
    ],
    staff: [] as any[],
    criteria: [
      { id: 'c1', label: 'Kỹ năng & Tay nghề' },
      { id: 'c2', label: 'Thái độ phục vụ' },
      { id: 'c3', label: 'Vệ sinh & Không gian' }
    ]
  })

  // Load reviews and config from localStorage on mount
  useEffect(() => {
    // Load Config
    const savedBranches = localStorage.getItem('clinic_branches')
    const savedStaff = localStorage.getItem('clinic_staff')
    const savedCriteria = localStorage.getItem('clinic_criteria')

    setConfig(prev => ({
      branches: savedBranches ? JSON.parse(savedBranches).map((b: any) => b.name) : prev.branches,
      staff: savedStaff ? JSON.parse(savedStaff) : [],
      criteria: savedCriteria ? JSON.parse(savedCriteria) : prev.criteria
    }))

    // Load Reviews
    const storedReviews = localStorage.getItem('clinic_reviews')

    if (storedReviews) {
      const userReviews = JSON.parse(storedReviews)
      const formattedUserReviews = userReviews.map((r: any) => ({
        id: r.id,
        branch: r.branch,
        staff: r.staff,
        rating: r.averageScore || 0, // Handle old format fallback
        sentiment: r.averageScore ? (r.averageScore >= 4 ? 'happy' : r.averageScore >= 3 ? 'neutral' : 'sad') : (r.sentiment || 'neutral'),
        tags: r.services || r.tags || [],
        comment: r.comment,
        date: r.createdAt ? r.createdAt.split('T')[0] : (r.date || new Date().toISOString().split('T')[0]),

        // Full Info
        patient: r.customerName || r.patient || 'Khách hàng',
        customerCode: r.customerCode || 'N/A',
        customerPhone: r.customerPhone || 'N/A',
        customerEmail: r.customerEmail || '',
        serviceDate: r.serviceDate || '',
        detailedRatings: r.ratings || r.detailedRatings || {},
        originalData: r // Keep original for modal
      }))
      setReviews(formattedUserReviews)
    } else {
      // First visit: Load Mock Data
      setReviews(mockReviews)
    }
  }, [])

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    branch: 'all',
    staff: 'all',
    rating: 'all',
    search: '',
    dateOption: 'all', // today, yesterday, this_week, last_week, this_year, last_year, custom
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  })

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  // Bulk Selection State
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])

  const handleDeleteSelected = () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedReviews.length} đánh giá đã chọn?`)) {
      const newReviews = reviews.filter(r => !selectedReviews.includes(r.id))
      setReviews(newReviews)
      localStorage.setItem('clinic_reviews', JSON.stringify(newReviews))
      setSelectedReviews([])
    }
  }

  // Dynamic Lists for Selects
  const branchList = ['all', ...config.branches]
  // Filter staff list based on selected branch in filter, or show all unique staff if 'all'
  const uniqueStaffNames = Array.from(new Set(config.staff.map(s => s.name)))
  const filteredStaffList = filters.branch === 'all'
    ? uniqueStaffNames
    : config.staff.filter(s => s.branch === filters.branch).map(s => s.name)

  const staffOptions = ['all', ...filteredStaffList]

  // Logic lọc dữ liệu
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Basic Filters
      if (filters.branch !== 'all' && r.branch !== filters.branch) return false
      if (filters.staff !== 'all' && r.staff !== filters.staff) return false
      if (filters.rating !== 'all' && r.rating !== parseInt(filters.rating)) return false
      if (filters.search && !r.comment.toLowerCase().includes(filters.search.toLowerCase()) && !r.patient.toLowerCase().includes(filters.search.toLowerCase())) return false

      // Date Filters
      const reviewDate = new Date(r.createdAt || r.date)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const currentYear = today.getFullYear()
      const currentWeek = getWeekNumber(today)
      const reviewWeek = getWeekNumber(reviewDate)

      switch (filters.dateOption) {
        case 'today':
          return isSameDay(reviewDate, today)
        case 'yesterday':
          return isSameDay(reviewDate, yesterday)
        case 'this_week':
          return reviewDate.getFullYear() === currentYear && reviewWeek === currentWeek
        case 'last_week':
          // Handle week rollover if needed, but simple check:
          // If current week is 1, last week is complicated (last year's last week), 
          // but for simplicity assume same year or handle properly in getWeekNumber logic if accessible.
          // Simplest approximation: check if time diff is between 7 and 14 days ago? 
          // Or strictly compare week numbers. 
          // Let's rely on week number difference.
          if (currentWeek === 1) return reviewDate.getFullYear() === currentYear - 1 && getWeekNumber(reviewDate) >= 52
          return reviewDate.getFullYear() === currentYear && reviewWeek === currentWeek - 1
        case 'month': // Legacy support if needed, but user removed it from options. Keep for safety or remove? User didn't ask for month.
          return reviewDate.getMonth() === today.getMonth() && reviewDate.getFullYear() === currentYear
        case 'this_year':
          return reviewDate.getFullYear() === currentYear
        case 'last_year':
          return reviewDate.getFullYear() === currentYear - 1
        case 'custom_year':
          // We need a year in state. Assuming filter.year exists. 
          // If not, we should probably default to current or handle UI to select it.
          // For now match filters.year
          return reviewDate.getFullYear() === Number(filters.year || currentYear)
        case 'custom_range':
          if (!filters.startDate || !filters.endDate) return true
          const start = new Date(filters.startDate)
          const end = new Date(filters.endDate)
          end.setHours(23, 59, 59, 999)
          return reviewDate >= start && reviewDate <= end
        default:
          return true
      }
    })
  }, [reviews, filters])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredReviews.slice(start, end)
  }, [filteredReviews, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)

  const resetFilters = () => {
    setFilters({
      branch: 'all',
      staff: 'all',
      rating: 'all',
      search: '',
      dateOption: 'all',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: ''
    })
  }

  // Logic thống kê nhân viên
  const staffStats = useMemo(() => {
    const stats: Record<string, { count: number, totalRating: number }> = {}

    filteredReviews.forEach(r => {
      // Fallback for mock data staff names if needed, but primarily use review data
      if (r.staff) {
        if (!stats[r.staff]) {
          stats[r.staff] = { count: 0, totalRating: 0 }
        }
        stats[r.staff].count += 1
        stats[r.staff].totalRating += r.rating
      }
    })

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avg: (data.totalRating / data.count).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
  }, [filteredReviews])

  // Logic thống kê Tiêu chí (DYNAMIC)
  const criteriaStats = useMemo(() => {
    // Initialize stats based on dynamic config.criteria
    const stats: Record<string, { count: number, totalScore: number, label: string }> = {}
    config.criteria.forEach(c => {
      stats[c.id] = { count: 0, totalScore: 0, label: c.label }
    })

    filteredReviews.forEach(r => {
      if (r.detailedRatings) {
        Object.entries(r.detailedRatings).forEach(([key, val]: [string, any]) => {
          // Only count if this criteria ID exists in our current config (or we want to show legacy ones?)
          // For now, let's allow all, initializing on fly if missing (handling legacy/deleted criteria gracefully)
          if (!stats[key]) {
            // Try to find label from config, or use ID
            const found = config.criteria.find(c => c.id === key)
            stats[key] = { count: 0, totalScore: 0, label: found ? found.label : key }
          }

          if (val.score > 0) {
            stats[key].count += 1
            stats[key].totalScore += val.score
          }
        })
      }
    })

    return Object.values(stats).map(item => ({
      label: item.label,
      avg: item.count > 0 ? (item.totalScore / item.count).toFixed(1) : '0.0',
      count: item.count
    }))
  }, [filteredReviews, config.criteria])

  // ... (Review Card Handlers...)

  // Handlers CRUD
  const handleAdd = () => {
    setEditingReview(null)
    setFormData({ branch: 'Cơ Sở 1 - Quận 1', staff: '', rating: 5, sentiment: 'happy', tags: [], comment: '', patient: '' })
    setShowModal(true)
  }

  // ... (Rest of handlers)

  const handleEdit = (review: any) => {
    setEditingReview(review)
    setFormData({ ...review })
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingReview) {
      setReviews(reviews.map(r => r.id === editingReview.id ? { ...r, ...formData } : r))
    } else {
      const newReview = { id: Date.now(), ...formData, date: new Date().toISOString().split('T')[0] }
      setReviews([newReview, ...reviews])
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Xóa đánh giá này?')) setReviews(reviews.filter(r => r.id !== id))
  }

  // Export Excel Handler
  const handleExportExcel = () => {
    // 1. Chuẩn bị dữ liệu
    const dataToExport = filteredReviews.map(r => {
      // Flatten detailed ratings
      const detailed: Record<string, string> = {}
      if (r.detailedRatings) {
        Object.entries(r.detailedRatings).forEach(([key, val]: [string, any]) => {
          // Mapping ID to Label
          const foundCriteria = config.criteria.find(c => c.id === key)
          const colName = foundCriteria ? foundCriteria.label : key

          detailed[`${colName} (Điểm)`] = val.score
          detailed[`${colName} (Ghi chú)`] = val.comment || ''
        })
      }

      return {
        'Ngày': r.date,
        'Chi nhánh': r.branch,
        'Nhân viên': r.staff,
        'Khách hàng': r.patient,
        'SĐT': r.customerPhone,
        'Mã KH': r.customerCode,
        'Email': r.customerEmail,
        'Ngày sử dụng DV': r.serviceDate,
        'Dịch vụ sử dụng': r.tags ? r.tags.join(', ') : '',
        'Điểm TB': r.rating,
        'Nội dung đánh giá': r.comment,
        ...detailed
      }
    })

    // 2. Tạo Worksheet
    const worksheet = utils.json_to_sheet(dataToExport)

    // 3. Tạo Workbook
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Danh sách Đánh giá')

    // 4. Xuất file
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)
    writeFile(workbook, `Danh_gia_Chat_luong_${timestamp}.xlsx`)
  }

  const getSentimentEmoji = (s: string) => s === 'happy' ? '😊' : s === 'neutral' ? '😐' : '☹️'

  // Helper render chi tiết điểm
  const renderDetailedRatings = (ratings: any) => {
    if (!ratings || Object.keys(ratings).length === 0) return null

    // Create dynamic mapping for display
    const criteriaLabelMap = config.criteria.reduce((acc, c) => ({ ...acc, [c.id]: c.label }), {} as Record<string, string>)

    return (
      <div className="mt-4 border-t border-gray-100 pt-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Chi tiết đánh giá:</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(ratings).map(([key, val]: [string, any]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-700 text-sm">{criteriaLabelMap[key] || key}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < val.score ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              {val.comment ? (
                <p className="text-xs text-gray-600 italic border-t border-gray-200 mt-1 pt-1">
                  &quot;{val.comment}&quot;
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 italic mt-1">(Không có nhận xét thêm)</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Quản lý Đánh giá & Phản hồi</h1>
          </div>
          <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Thêm mới
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* SECTION 1: BỘ LỌC MẠNH MẼ */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Filter className="w-5 h-5" />
              Bộ lọc Thống kê
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors border border-green-200"
            >
              <Download className="w-3 h-3" /> Xuất Excel
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Xóa lọc
            </button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedReviews.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-bold text-red-700">Đã chọn {selectedReviews.length} đánh giá</span>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all"
              >
                <Trash2 className="w-4 h-4" /> Xóa dòng chọn
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Hàng 1: Cơ bản */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Chi nhánh</label>
              <select
                value={filters.branch}
                onChange={e => setFilters({ ...filters, branch: e.target.value })}
                className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {branchList.map(b => <option key={b} value={b}>{b === 'all' ? 'Tất cả chi nhánh' : b}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Nhân viên</label>
              <select
                value={filters.staff}
                onChange={e => setFilters({ ...filters, staff: e.target.value })}
                className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {staffOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'Tất cả nhân viên' : s}</option>)}
              </select>
            </div>
            {/* Date Filter */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thời gian</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filters.dateOption}
                  onChange={(e) => setFilters({ ...filters, dateOption: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-blue-700 bg-blue-50 appearance-none"
                >
                  <option value="all">Toàn bộ thời gian</option>
                  <option value="today">📅 Hôm nay</option>
                  <option value="yesterday">📅 Hôm qua</option>
                  <option value="this_week">📅 Tuần này</option>
                  <option value="last_week">📅 Tuần trước</option>
                  <option value="this_year">📅 Năm nay</option>
                  <option value="last_year">📅 Năm trước</option>
                  <option value="custom_year">📅 Chọn theo Năm</option>
                  <option value="custom_range">📅 Tùy chọn ngày...</option>
                </select>
              </div>
            </div>

            {/* Dynamic Date Inputs based on selection */}
            {filters.dateOption === 'custom_year' && (
              <div className="md:col-span-1 animate-in fade-in slide-in-from-top-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chọn Năm</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {filters.dateOption === 'custom_range' && (
              <div className="md:col-span-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Always show search, or conditionally if you prefer. Original design had it always visible, but maybe pushed down? */}
            {/* Let's keep search here as a separate block effectively */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Nội dung, tên khách..."
                className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BẢNG THỐNG KÊ KÉP (MỚI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Thống kê Nhân viên */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Hiệu quả Nhân viên
              </h2>
            </div>
            <div className="p-4 max-h-[250px] overflow-y-auto">
              {staffStats.length > 0 ? (
                <div className="space-y-3">
                  {staffStats.map((st, idx) => (
                    <div key={st.name} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-amber-400' : 'bg-gray-400'}`}>{idx + 1}</span>
                        <span className="font-medium text-sm text-gray-700">{st.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                          <Star className="w-3.5 h-3.5 fill-current" /> {st.avg}
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{st.count} lượt</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500 italic">Chưa có dữ liệu.</p>}
            </div>
          </div>

          {/* Right: Thống kê Tiêu chí Chất lượng (Criteria Stats) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Chất lượng theo Tiêu chí
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {criteriaStats.map((c) => (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{c.label}</span>
                      <span className="font-bold text-gray-800">{c.avg}/5.0</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${parseFloat(c.avg) >= 4.5 ? 'bg-green-500' : parseFloat(c.avg) >= 4.0 ? 'bg-blue-500' : parseFloat(c.avg) >= 3.0 ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${(parseFloat(c.avg) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DANH SÁCH ĐÁNH GIÁ */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Danh sách Chi tiết ({filteredReviews.length})</h3>
          {filteredReviews.length > 0 ? (
            <>
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2 mb-2 px-2 justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length > 0 && selectedReviews.length === filteredReviews.length}
                    onChange={() => {
                      if (selectedReviews.length === filteredReviews.length) {
                        setSelectedReviews([])
                      } else {
                        setSelectedReviews(filteredReviews.map(r => r.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500 font-medium">Chọn tất cả ({filteredReviews.length})</span>
                </div>
                <div className="text-sm text-gray-500">
                  Hiển thị {paginatedReviews.length} / {filteredReviews.length} kết quả
                </div>
              </div>

              {paginatedReviews.map(review => (
                <div key={review.id} className={`rounded-xl shadow-sm p-5 border transition-all hover:shadow-md ${selectedReviews.includes(review.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => setSelectedReviews(prev => prev.includes(review.id) ? prev.filter(id => id !== review.id) : [...prev, review.id])}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      />

                      <div className="flex gap-4 flex-1">
                        {/* Avatar Sentiment */}
                        <div className="text-4xl flex-shrink-0 bg-gray-50 w-16 h-16 flex items-center justify-center rounded-2xl">
                          {getSentimentEmoji(review.sentiment)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header Info */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-gray-900">{review.patient}</span>
                            {review.customerCode && review.customerCode !== 'N/A' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-semibold">
                                {review.customerCode}
                              </span>
                            )}
                            {review.customerPhone && review.customerPhone !== 'N/A' && (
                              <span className="text-xs text-gray-500 flex items-center gap-1 min-w-0 truncate">
                                <MessageSquare className="w-3 h-3 flex-shrink-0" /> {review.customerPhone}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">{review.date}</span>
                          </div>

                          {/* Rating Overview */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            <span className="font-bold text-amber-500">{review.rating > 0 ? review.rating.toFixed(1) : '0.0'}</span>
                            {review.tags && review.tags.length > 0 && (
                              <div className="flex gap-1 ml-2 overflow-x-auto scrollbar-hide">
                                {review.tags.map((t: string) => (
                                  <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap border border-gray-200">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Main Comment */}
                          <p className="text-gray-700 bg-blue-50/50 p-3 rounded-lg border-l-4 border-blue-200 italic mb-3">
                            &quot;{review.comment}&quot;
                          </p>

                          {/* Files */}
                          {review.attachedFiles && review.attachedFiles.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-2">
                                <Download className="w-3 h-3" /> File đính kèm ({review.attachedFiles.length}):
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {review.attachedFiles.map((f: any, idx: number) => {
                                  if (typeof f === 'string' && f.startsWith('data:image')) {
                                    return (
                                      <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                        <img src={f} alt="Attached" className="w-full h-full object-cover" />
                                      </div>
                                    )
                                  }
                                  if (typeof f === 'string') {
                                    return <span key={idx} className="text-xs bg-gray-50 border px-2 py-1 rounded text-blue-600 truncate max-w-[150px]">{f}</span>
                                  }
                                  return null
                                })}
                              </div>
                            </div>
                          )}

                          {/* Detailed Ratings Breakdown */}
                          {renderDetailedRatings(review.detailedRatings)}

                          {/* Metadata Footer */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <User className="w-3 h-3 text-blue-500" /> {review.staff}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" /> {review.branch}
                            </span>
                            {review.serviceDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" /> Ngày DV: {review.serviceDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <button onClick={() => handleEdit(review)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(review.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Hiển thị</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>dòng mỗi trang</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Trước
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Trang {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Không tìm thấy đánh giá nào phù hợp.</p>
              <button onClick={resetFilters} className="mt-2 text-blue-600 text-sm hover:underline">Xóa danh sách lọc</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4 text-gray-800">{editingReview ? 'Sửa đánh giá' : 'Thêm đánh giá mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Chi nhánh</label>
                <select className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                  {config.branches.map((b: string) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nhân viên</label>
                <select className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" value={formData.staff} onChange={e => setFormData({ ...formData, staff: e.target.value })}>
                  <option value="">-- Chọn nhân viên --</option>
                  {Array.from(new Set(config.staff.map(s => s.name))).map((s: any) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên khách hàng</label>
                <input className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" placeholder="Tên khách hàng" value={formData.patient} onChange={e => setFormData({ ...formData, patient: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nội dung đánh giá</label>
                <textarea className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm h-24" placeholder="Nội dung đánh giá..." value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Điểm đánh giá (TB)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setFormData({ ...formData, rating: s })}>
                      <Star className={`w-8 h-8 ${s <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md">Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
