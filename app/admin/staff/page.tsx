'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Building2, Star, ArrowLeft, UserCircle, Camera, FileText } from 'lucide-react'
import Link from 'next/link'

export default function StaffPage() {
  const [staff, setStaff] = useState<{ id: number, name: string, role: string, branch: string, specialty: string, rating: number, avatar?: string }[]>([
    { id: 1, name: 'BS. Nguyễn Văn A', role: 'Bác sĩ', branch: 'Chi nhánh Quận 5', specialty: 'Nha khoa thẩm mỹ', rating: 4.95, avatar: '' },
    { id: 2, name: 'KTV. Trần Thị B', role: 'Kỹ thuật viên', branch: 'Chi nhánh Thanh Xuân, Hà Nội', specialty: 'Chăm sóc khách hàng', rating: 4.92, avatar: '' },
    { id: 3, name: 'BS. Lê Minh C', role: 'Bác sĩ', branch: 'Chi nhánh Quận 5', specialty: 'Điều trị nha chu', rating: 4.89, avatar: '' },
    { id: 4, name: 'KTV. Phạm Thu D', role: 'Kỹ thuật viên', branch: 'Chi nhánh Vinh Nghệ An', specialty: 'Hỗ trợ phẫu thuật', rating: 4.76, avatar: '' },
    { id: 5, name: 'BS. Hoàng Văn E', role: 'Bác sĩ', branch: 'Chi nhánh Quận 6', specialty: 'Niềng răng', rating: 4.82, avatar: '' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', role: 'Bác sĩ', branch: '', specialty: '', avatar: '' })

  // Bulk Add State
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [bulkText, setBulkText] = useState('')

  const branches = [
    'Chi nhánh Thanh Xuân, Hà Nội',
    'Chi nhánh Vinh Nghệ An',
    'Chi nhánh Quận 5',
    'Chi nhánh Phổ Quang',
    'Chi nhánh Quận 6',
    'Chi nhánh Quận Thủ Đức',
  ]

  // Load from LocalStorage
  // Dynamic Data
  const [dynamicBranches, setDynamicBranches] = useState<string[]>([])
  const [dynamicRoles, setDynamicRoles] = useState<string[]>([])
  const [dynamicSpecialties, setDynamicSpecialties] = useState<string[]>([])

  useEffect(() => {
    const savedStaff = localStorage.getItem('clinic_staff')
    if (savedStaff) setStaff(JSON.parse(savedStaff))

    const savedBranches = localStorage.getItem('clinic_branches')
    if (savedBranches) {
      setDynamicBranches(JSON.parse(savedBranches).map((b: any) => b.name))
    } else {
      setDynamicBranches(branches)
    }

    const savedRoles = localStorage.getItem('clinic_roles')
    if (savedRoles) {
      setDynamicRoles(JSON.parse(savedRoles))
    } else {
      setDynamicRoles(['Bác sĩ', 'Kỹ thuật viên', 'Lễ tân', 'Quản lý'])
    }

    const savedSpecialties = localStorage.getItem('clinic_specialties')
    if (savedSpecialties) {
      setDynamicSpecialties(JSON.parse(savedSpecialties))
    } else {
      setDynamicSpecialties(['Nha khoa tổng quát', 'Nha khoa thẩm mỹ', 'Niềng răng'])
    }
  }, [])

  const saveToStorage = (newStaff: any[]) => {
    localStorage.setItem('clinic_staff', JSON.stringify(newStaff))
  }

  const handleAdd = () => {
    setEditingStaff(null)
    setFormData({ name: '', role: 'Bác sĩ', branch: dynamicBranches[0] || branches[0], specialty: '', avatar: '' })
    setAddMode('single')
    setBulkText('')
    setShowModal(true)
  }

  const handleEdit = (member: any) => {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      role: member.role,
      branch: member.branch,
      specialty: member.specialty,
      avatar: member.avatar || ''
    })
    setShowModal(true)
  }

  const handleAvatarChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      const newStaff = staff.filter(s => s.id !== id)
      setStaff(newStaff)
      saveToStorage(newStaff)
    }
  }

  const handleSave = () => {
    let newStaffList = [...staff]

    if (addMode === 'bulk') {
      if (!bulkText.trim()) {
        alert('Vui lòng nhập danh sách nhân viên!')
        return
      }

      const lines = bulkText.split('\n')
      const newMembers: any[] = []

      lines.forEach((line, idx) => {
        if (!line.trim()) return
        // Expected: Name, Role, Branch, Specialty
        const parts = line.split(',').map(p => p.trim())
        if (parts.length >= 1) {
          newMembers.push({
            id: Date.now() + idx, // Simple ID gen
            name: parts[0],
            role: parts[1] || 'Bác sĩ',
            branch: parts[2] || (dynamicBranches[0] || branches[0]),
            specialty: parts[3] || '',
            rating: 0,
            avatar: ''
          })
        }
      })

      if (newMembers.length > 0) {
        newStaffList = [...staff, ...newMembers]
        setStaff(newStaffList)
        saveToStorage(newStaffList)
        setShowModal(false)
        setBulkText('')
        alert(`Đã thêm thành công ${newMembers.length} nhân viên!`)
      } else {
        alert('Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại định dạng.')
      }
      return
    }

    // Existing Single Save Logic
    if (editingStaff) {
      newStaffList = staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s)
    } else {
      const newStaff = {
        id: Date.now(),
        ...formData,
        rating: 0
      }
      newStaffList = [...staff, newStaff]
    }
    setStaff(newStaffList)
    saveToStorage(newStaffList)
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
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
              <p className="text-sm text-gray-600">Bác sĩ & Kỹ thuật viên</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-medical-blue to-soft-teal text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Thêm Nhân viên
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-teal-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nhân viên</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Vị trí</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Chi nhánh</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Chuyên môn</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Đánh giá</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-blue-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-medical-blue to-soft-teal flex items-center justify-center text-white font-bold">
                            {member.name.charAt(3)}
                          </div>
                        )}
                        <span className="font-semibold text-gray-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${member.role === 'Bác sĩ'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-teal-100 text-teal-700'
                        }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {member.branch}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.specialty}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-medical-blue">{member.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-all text-medical-blue"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingStaff ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên Mới'}
            </h2>
            {/* Tabs (Only when adding new) */}
            {!editingStaff && (
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setAddMode('single')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${addMode === 'single' ? 'bg-white shadow-sm text-medical-blue' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  Nhập thủ công
                </button>
                <button
                  onClick={() => setAddMode('bulk')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${addMode === 'bulk' ? 'bg-white shadow-sm text-medical-blue' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  Nhập theo Danh sách
                </button>
              </div>
            )}

            {addMode === 'single' ? (
              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm relative bg-gray-50 flex items-center justify-center">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                    placeholder="BS. Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                  >
                    {dynamicRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chi nhánh</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                  >
                    {dynamicBranches.length > 0 ? dynamicBranches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    )) : branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chuyên môn</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all"
                  >
                    <option value="">-- Chọn chuyên môn --</option>
                    {dynamicSpecialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Hướng dẫn nhập liệu:</p>
                    <p>Nhập mỗi nhân viên trên một dòng theo định dạng:</p>
                    <p className="font-mono bg-white px-2 py-1 rounded border border-blue-100 mt-1 inline-block">
                      Tên, Vị trí, Chi nhánh, Chuyên môn
                    </p>
                    <p className="mt-2 text-xs opacity-75">Ví dụ: BS. Nguyễn Văn A, Bác sĩ, Chi nhánh Quận 1, Nha khoa thẩm mỹ</p>
                  </div>
                </div>
                <div>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-medical-blue focus:outline-none transition-all font-mono text-sm"
                    placeholder={`Nguyễn Văn A, Bác sĩ, Chi nhánh 1, Nha khoa\nTrần Thị B, KTV, Chi nhánh 2, Chăm sóc da...`}
                  />
                </div>
              </div>
            )}
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
