'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BranchesPage() {
  const [branches, setBranches] = useState([
    { id: 1, name: 'Chi nhánh Thanh Xuân, Hà Nội', address: '95 P. Tô Vĩnh Diện, Khương Trung, Thanh Xuân, Hà Nội', phone: '1900.299.269', staff: 12 },
    { id: 2, name: 'Chi nhánh Vinh Nghệ An', address: 'Số 296 Nguyễn Văn Cừ, Thành phố Vinh, Nghệ An, Vinh', phone: '1900.299.269', staff: 9 },
    { id: 3, name: 'Chi nhánh Quận 5', address: '232-234 Lê Hồng Phong, Phường 4, Quận 5, TP. Hồ Chí Minh', phone: '1900.299.269', staff: 15 },
    { id: 4, name: 'Chi nhánh Phổ Quang', address: 'Số 1C Đường Phổ Quang Phường 2, Tân Bình, Hồ Chí Minh', phone: '1900.299.269', staff: 8 },
    { id: 5, name: 'Chi nhánh Quận 6', address: '382 Nguyễn Văn Luông, Phường 12, Quận 6, Tp.Hồ Chí Minh', phone: '1900.299.269', staff: 13 },
    { id: 6, name: 'Chi nhánh Quận Thủ Đức', address: '157 Đặng Văn Bi, Trường Thọ, TP Thủ Đức, Thủ Đức, Thành phố Hồ Chí Minh', phone: '0866 666 985', staff: 10 },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' })

  // Load from LocalStorage
  useEffect(() => {
    const savedBranches = localStorage.getItem('clinic_branches')
    const savedStaff = localStorage.getItem('clinic_staff')

    if (savedBranches) {
      let parsedBranches = JSON.parse(savedBranches)

      // Calculate real-time staff count
      if (savedStaff) {
        const staffList = JSON.parse(savedStaff)
        parsedBranches = parsedBranches.map((b: any) => ({
          ...b,
          staff: staffList.filter((s: any) => s.branch === b.name).length
        }))
      }
      setBranches(parsedBranches)
    }
  }, [])

  const saveToStorage = (newBranches: any[]) => {
    localStorage.setItem('clinic_branches', JSON.stringify(newBranches))
  }

  const handleAdd = () => {
    setEditingBranch(null)
    setFormData({ name: '', address: '', phone: '' })
    setShowModal(true)
  }

  const handleEdit = (branch: any) => {
    setEditingBranch(branch)
    setFormData({ name: branch.name, address: branch.address, phone: branch.phone })
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
      const newBranches = branches.filter(b => b.id !== id)
      setBranches(newBranches)
      saveToStorage(newBranches)
    }
  }

  const handleSave = () => {
    let newBranches
    let updatedStaffList = null

    if (editingBranch) {
      // Logic xử lý đổi tên chi nhánh -> Cập nhật luôn cho nhân viên thuộc chi nhánh đó
      if (editingBranch.name !== formData.name) {
        const savedStaff = localStorage.getItem('clinic_staff')
        if (savedStaff) {
          const staffList = JSON.parse(savedStaff)
          updatedStaffList = staffList.map((s: any) => s.branch === editingBranch.name ? { ...s, branch: formData.name } : s)
          localStorage.setItem('clinic_staff', JSON.stringify(updatedStaffList))
        }
      }

      newBranches = branches.map(b => b.id === editingBranch.id ? { ...b, ...formData } : b)
    } else {
      const newBranch = {
        id: Date.now(),
        ...formData,
        staff: 0
      }
      newBranches = [...branches, newBranch]
    }

    // Re-calculate staff counts immediately to reflect changes in UI
    const currentStaffList = updatedStaffList || (localStorage.getItem('clinic_staff') ? JSON.parse(localStorage.getItem('clinic_staff')!) : [])

    if (currentStaffList.length > 0) {
      newBranches = newBranches.map(b => ({
        ...b,
        staff: currentStaffList.filter((s: any) => s.branch === b.name).length
      }))
    }

    setBranches(newBranches)
    saveToStorage(newBranches)
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="glass-effect shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-white/50 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-medical-blue" />
            </Link>
            <div className="bg-gradient-to-br from-medical-blue to-soft-teal p-3 rounded-xl shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Chi nhánh</h1>
              <p className="text-sm text-gray-600">Quản lý danh sách cơ sở</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-medical-blue to-soft-teal text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Thêm Chi nhánh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white rounded-2xl shadow-xl p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-blue to-soft-teal flex items-center justify-center text-white font-bold text-lg">
                    {branch.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{branch.name}</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-all text-medical-blue"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-soft-teal" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-soft-teal" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-medical-blue" />
                  <span className="font-semibold text-medical-blue">{branch.staff} nhân viên</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingBranch ? 'Chỉnh sửa Chi nhánh' : 'Thêm Chi nhánh Mới'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên chi nhánh</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                  placeholder="Cơ Sở 1 - Quận 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                  placeholder="123 Đường ABC, Quận XYZ"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                  placeholder="028 1234 5678"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-medical-blue to-soft-teal text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
