'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Settings, List, Star, ArrowLeft, PenTool, Check, Users } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('services')

  // Mock Data: Dịch vụ
  const [services, setServices] = useState([
    'Lấy cao răng', 'Nhổ răng', 'Trám răng', 'Tẩy trắng răng',
    'Niềng răng', 'Cấy ghép Implant', 'Tiểu phẫu', 'Chăm sóc da', 'Massage trị liệu'
  ])
  const [newService, setNewService] = useState('')
  // Bulk Service State
  const [showBulkService, setShowBulkService] = useState(false)
  const [bulkServiceInput, setBulkServiceInput] = useState('')
  const [selectedServices, setSelectedServices] = useState<number[]>([])

  // Mock Data: Tiêu chí (Labels)
  const [criteria, setCriteria] = useState([
    { id: 'c1', label: 'Kỹ năng & Tay nghề' },
    { id: 'c2', label: 'Thái độ phục vụ' },
    { id: 'c3', label: 'Vệ sinh & Không gian' }
  ])
  const [newCriteria, setNewCriteria] = useState('')
  // Bulk Criteria State
  const [showBulkCriteria, setShowBulkCriteria] = useState(false)
  const [bulkCriteriaInput, setBulkCriteriaInput] = useState('')
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])

  // HR Config State (Roles & Specialties)
  const [roles, setRoles] = useState(['Bác sĩ', 'Kỹ thuật viên', 'Lễ tân', 'Quản lý'])
  const [specialties, setSpecialties] = useState(['Nha khoa tổng quát', 'Nha khoa thẩm mỹ', 'Niềng răng', 'Cấy ghép Implant', 'Chăm sóc da'])

  const [newRole, setNewRole] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedServices = localStorage.getItem('clinic_services')
    const savedCriteria = localStorage.getItem('clinic_criteria')
    const savedRoles = localStorage.getItem('clinic_roles')
    const savedSpecialties = localStorage.getItem('clinic_specialties')

    if (savedServices) setServices(JSON.parse(savedServices))
    if (savedCriteria) setCriteria(JSON.parse(savedCriteria))
    if (savedRoles) setRoles(JSON.parse(savedRoles))
    if (savedSpecialties) setSpecialties(JSON.parse(savedSpecialties))
  }, [])

  // Xử lý Dịch vụ
  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()])
      setNewService('')
    }
  }

  const handleBulkAddServices = () => {
    const lines = bulkServiceInput.split('\n').map(s => s.trim()).filter(s => s !== '')
    if (lines.length > 0) {
      setServices([...services, ...lines])
      setBulkServiceInput('')
      setShowBulkService(false)
    }
  }

  const handleDeleteService = (index: number) => {
    if (confirm('Xóa dịch vụ này?')) {
      setServices(services.filter((_, i) => i !== index))
      setSelectedServices(selectedServices.filter(i => i !== index)) // Clear selection if deleted
    }
  }

  const handleBulkDeleteServices = () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedServices.length} dịch vụ đã chọn?`)) {
      setServices(services.filter((_, i) => !selectedServices.includes(i)))
      setSelectedServices([])
    }
  }

  const toggleServiceSelection = (index: number) => {
    setSelectedServices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const toggleAllServices = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(services.map((_, i) => i))
    }
  }

  // Xử lý Tiêu chí (Thêm/Sửa/Xóa ĐỘNG)
  const handleAddCriteria = () => {
    if (newCriteria.trim()) {
      const newId = `c${Date.now()}`
      setCriteria([...criteria, { id: newId, label: newCriteria.trim() }])
      setNewCriteria('')
    }
  }

  const handleBulkAddCriteria = () => {
    const lines = bulkCriteriaInput.split('\n').map(s => s.trim()).filter(s => s !== '')
    if (lines.length > 0) {
      const newItems = lines.map((label, idx) => ({
        id: `c${Date.now()}_${idx}`,
        label
      }))
      setCriteria([...criteria, ...newItems])
      setBulkCriteriaInput('')
      setShowBulkCriteria(false)
    }
  }

  const handleDeleteCriteria = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa tiêu chí này? Dữ liệu lịch sử có thể bị ảnh hưởng.')) {
      setCriteria(criteria.filter(c => c.id !== id))
      setSelectedCriteria(selectedCriteria.filter(sid => sid !== id))
    }
  }

  const handleBulkDeleteCriteria = () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedCriteria.length} tiêu chí đã chọn?`)) {
      setCriteria(criteria.filter(c => !selectedCriteria.includes(c.id)))
      setSelectedCriteria([])
    }
  }

  const toggleCriteriaSelection = (id: string) => {
    setSelectedCriteria(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  const toggleAllCriteria = () => {
    if (selectedCriteria.length === criteria.length) {
      setSelectedCriteria([])
    } else {
      setSelectedCriteria(criteria.map(c => c.id))
    }
  }

  const handleLabelChange = (id: string, newLabel: string) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, label: newLabel } : c))
  }

  const handleSave = () => {
    // Lưu vào localStorage để trang Feedback đọc được (Demo mode)
    localStorage.setItem('clinic_services', JSON.stringify(services))
    localStorage.setItem('clinic_criteria', JSON.stringify(criteria))
    localStorage.setItem('clinic_roles', JSON.stringify(roles))
    localStorage.setItem('clinic_specialties', JSON.stringify(specialties))
    alert('Đã lưu cấu hình thành công! Thay đổi đã được cập nhật sang trang Đánh giá và Nhân viên.')
  }

  // Generate Demo Data
  const generateDemoData = () => {
    if (!confirm('Hành động này sẽ tạo 5000 đánh giá mẫu ngẫu nhiên. Bạn có chắc chắn không?')) return

    const savedBranches = localStorage.getItem('clinic_branches') || '[]'
    const savedStaff = localStorage.getItem('clinic_staff') || '[]'

    const branchesList = JSON.parse(savedBranches)
    const staffList = JSON.parse(savedStaff)

    if (branchesList.length === 0) {
      alert('Vui lòng tạo ít nhất 1 chi nhánh trước!')
      return
    }

    const demoReviews = []
    const now = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    const randomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    // Sample Data Source
    const coms = ['Dịch vụ rất tốt', 'Bác sĩ tận tâm', 'Sẽ quay lại', 'Hơi đông khách', 'Tuyệt vời', 'Cần cải thiện quy trình', '10 điểm', 'Không gian sạch sẽ']
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Vũ Thị F']

    for (let i = 0; i < 5000; i++) {
      // Pick Branch
      const branch = branchesList[Math.floor(Math.random() * branchesList.length)]
      // Pick Staff (filter by branch if possible, else random)
      const branchStaff = staffList.filter((s: any) => s.branch === branch.name)
      const staffName = branchStaff.length > 0
        ? branchStaff[Math.floor(Math.random() * branchStaff.length)].name
        : 'Nhân viên mẫu'

      // Date
      const rDate = randomDate(oneYearAgo, now)
      const dateStr = rDate.toISOString().split('T')[0]

      // Score (Weighted)
      const rand = Math.random()
      let score = 5
      if (rand < 0.1) score = 1
      else if (rand < 0.2) score = 2
      else if (rand < 0.3) score = 3
      else if (rand < 0.5) score = 4

      // Create Review
      demoReviews.push({
        id: Date.now() + i,
        customerCode: `KH${10000 + i}`,
        customerName: names[Math.floor(Math.random() * names.length)],
        customerPhone: '090xxxxxxx',
        branch: branch.name,
        staff: staffName,
        services: [services[Math.floor(Math.random() * services.length)]],
        serviceDate: dateStr,
        averageScore: score,
        comment: coms[Math.floor(Math.random() * coms.length)],
        ratings: {
          'c1': { score: score },
          'c2': { score: score },
          'c3': { score: score }
        },
        createdAt: rDate.toISOString()
      })
    }

    // Append or Overwrite? Let's just append to existing to be safe, or user can clear first (we don't have clear button yet but can use Bulk Delete :D)
    // Actually appending 5000 might be huge if done multiple times. 
    // Let's just prepend.
    const current = JSON.parse(localStorage.getItem('clinic_reviews') || '[]')
    const combined = [...demoReviews, ...current]
    localStorage.setItem('clinic_reviews', JSON.stringify(combined))

    alert(`Đã tạo thành công ${demoReviews.length} đánh giá mẫu!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Settings className="w-6 h-6 text-medical-blue" />
              Cấu hình Hệ thống
            </h1>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={generateDemoData}
              className="flex-1 md:flex-none justify-center bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all"
            >
              ⚡ Tạo 5000 Data Demo
            </button>
            <button
              onClick={handleSave}
              className="flex-1 md:flex-none justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'services'
                ? 'bg-blue-50 text-medical-blue border border-blue-100 shadow-sm'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
            >
              <List className="w-5 h-5" /> Danh sách Dịch vụ
            </button>
            <button
              onClick={() => setActiveTab('criteria')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'criteria'
                ? 'bg-blue-50 text-medical-blue border border-blue-100 shadow-sm'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
            >
              <Star className="w-5 h-5" /> Tiêu chí Đánh giá
            </button>
            <button
              onClick={() => setActiveTab('hr')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'hr'
                ? 'bg-blue-50 text-medical-blue border border-blue-100 shadow-sm'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
            >
              <Users className="w-5 h-5 text-gray-500" /> Cấu hình Nhân sự
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">

            {/* TAB: SERVICES */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-right-2">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Quản lý Dịch vụ</h2>
                  <p className="text-sm text-gray-500">Các dịch vụ này sẽ hiển thị để khách hàng chọn trong form đánh giá.</p>
                </div>

                {/* Bulk Actions Bar */}
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={services.length > 0 && selectedServices.length === services.length}
                      onChange={toggleAllServices}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-600">Chọn tất cả</span>
                  </div>

                  <div className="flex gap-2">
                    {selectedServices.length > 0 && (
                      <button
                        onClick={handleBulkDeleteServices}
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa ({selectedServices.length})
                      </button>
                    )}
                    <button
                      onClick={() => setShowBulkService(!showBulkService)}
                      className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      {showBulkService ? 'Đóng thêm nhanh' : '✨ Thêm nhanh nhiều dòng'}
                    </button>
                  </div>
                </div>

                {/* Bulk Add Box */}
                {showBulkService && (
                  <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-blue-700 mb-2 uppercase">Nhập danh sách dịch vụ (mỗi dòng 1 dịch vụ):</label>
                    <textarea
                      value={bulkServiceInput}
                      onChange={(e) => setBulkServiceInput(e.target.value)}
                      className="w-full p-3 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none h-32"
                      placeholder={"Lấy cao răng\nNhổ răng số 8\n..."}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleBulkAddServices}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                      >
                        Xác nhận thêm
                      </button>
                    </div>
                  </div>
                )}

                {/* Single Add */}
                {!showBulkService && (
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                      placeholder="Nhập tên dịch vụ mới..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none"
                    />
                    <button
                      onClick={handleAddService}
                      className="bg-medical-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>
                )}

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {services.map((service, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedServices.includes(index) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(index)}
                          onChange={() => toggleServiceSelection(index)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">{service}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteService(index)}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CRITERIA */}
            {activeTab === 'criteria' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-right-2">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Tiêu chí Đánh giá Chất lượng</h2>
                  <p className="text-sm text-gray-500">Bạn có thể thêm, sửa tên hoặc xóa các tiêu chí đánh giá.</p>
                </div>

                {/* Bulk Actions Bar */}
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={criteria.length > 0 && selectedCriteria.length === criteria.length}
                      onChange={toggleAllCriteria}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-600">Chọn tất cả</span>
                  </div>

                  <div className="flex gap-2">
                    {selectedCriteria.length > 0 && (
                      <button
                        onClick={handleBulkDeleteCriteria}
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa ({selectedCriteria.length})
                      </button>
                    )}
                    <button
                      onClick={() => setShowBulkCriteria(!showBulkCriteria)}
                      className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      {showBulkCriteria ? 'Đóng thêm nhanh' : '✨ Thêm nhanh nhiều dòng'}
                    </button>
                  </div>
                </div>

                {/* Bulk Add Box - Criteria */}
                {showBulkCriteria && (
                  <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase">Nhập danh sách tiêu chí (mỗi dòng 1 tiêu chí):</label>
                    <textarea
                      value={bulkCriteriaInput}
                      onChange={(e) => setBulkCriteriaInput(e.target.value)}
                      className="w-full p-3 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none h-32"
                      placeholder={"Tiếp đón niềm nở\nTư vấn rõ ràng\n..."}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleBulkAddCriteria}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Xác nhận thêm
                      </button>
                    </div>
                  </div>
                )}

                {/* Add New Criteria - Single */}
                {!showBulkCriteria && (
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newCriteria}
                      onChange={(e) => setNewCriteria(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCriteria()}
                      placeholder="Nhập tên tiêu chí mới (Vd: Thời gian chờ)..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none"
                    />
                    <button
                      onClick={handleAddCriteria}
                      className="bg-medical-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {criteria.map((item, index) => (
                    <div key={item.id} className={`p-4 rounded-xl border transition-all ${selectedCriteria.includes(item.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200 hover:border-indigo-300'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedCriteria.includes(item.id)}
                          onChange={() => toggleCriteriaSelection(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-medical-blue text-sm font-bold">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Tiêu chí {index + 1}</h3>
                      </div>

                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleLabelChange(item.id, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none font-bold text-gray-800 bg-white"
                        />
                        <button
                          onClick={() => handleDeleteCriteria(item.id)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa tiêu chí này"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {criteria.length === 0 && (
                  <div className="text-center py-8 text-gray-400 italic border-2 border-dashed border-gray-200 rounded-xl mt-4">
                    Chưa có tiêu chí nào. Hãy thêm mới!
                  </div>
                )}
              </div>
            )}

            {/* TAB: HR CONFIG (Roles & Specialties) */}
            {activeTab === 'hr' && (
              <div className="space-y-8 animate-in slide-in-from-right-2">

                {/* 1. ROLES MANAGEMENT */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Vị trí / Chức danh</h2>
                    <p className="text-sm text-gray-500">Quản lý danh sách chức danh nhân viên (VD: Bác sĩ, Kỹ thuật viên...).</p>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newRole.trim()) {
                          setRoles([...roles, newRole.trim()])
                          setNewRole('')
                        }
                      }}
                      placeholder="Nhập tên chức danh..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newRole.trim()) {
                          setRoles([...roles, newRole.trim()])
                          setNewRole('')
                        }
                      }}
                      className="bg-medical-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {roles.map((role, idx) => (
                      <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 group border border-blue-100">
                        {role}
                        <button
                          onClick={() => setRoles(roles.filter((_, i) => i !== idx))}
                          className="text-blue-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. SPECIALTIES MANAGEMENT */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Chuyên môn / Dịch vụ</h2>
                    <p className="text-sm text-gray-500">Quản lý danh sách chuyên môn (VD: Niềng răng, Nha khoa tổng quát...).</p>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSpecialty.trim()) {
                          setSpecialties([...specialties, newSpecialty.trim()])
                          setNewSpecialty('')
                        }
                      }}
                      placeholder="Nhập tên chuyên môn..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newSpecialty.trim()) {
                          setSpecialties([...specialties, newSpecialty.trim()])
                          setNewSpecialty('')
                        }
                      }}
                      className="bg-medical-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec, idx) => (
                      <div key={idx} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 group border border-teal-100">
                        {spec}
                        <button
                          onClick={() => setSpecialties(specialties.filter((_, i) => i !== idx))}
                          className="text-teal-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
