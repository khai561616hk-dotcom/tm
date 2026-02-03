'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, User, Search, Stethoscope, ArrowRight, Building2, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PatientPortal() {
    const router = useRouter()
    // Nếu null nghĩa là chưa chọn cơ sở -> Hiện danh sách cơ sở
    // Nếu có giá trị -> Hiện danh sách nhân viên
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

    // State Data (Loaded from localStorage)

    const [data, setData] = useState({
        branches: [
            { id: 1, name: 'Cơ Sở 1 - Quận 1', address: '123 Nguyễn Huệ, Q.1' },
            { id: 2, name: 'Cơ Sở 2 - Quận 3', address: '456 CMT8, Q.3' },
            { id: 3, name: 'Cơ Sở 3 - Quận 7', address: '789 Nguyễn Thị Thập, Q.7' },
            { id: 4, name: 'Cơ Sở 4 - Thủ Đức', address: '101 Võ Văn Ngân, TP. Thủ Đức' },
            { id: 5, name: 'Cơ Sở 5 - Bình Thạnh', address: '202 Điện Biên Phủ, Q.BT' }
        ] as any[],
        staff: [] as any[]
    })

    useEffect(() => {
        const savedBranches = localStorage.getItem('clinic_branches')
        const savedStaff = localStorage.getItem('clinic_staff')

        setData(prev => ({
            branches: savedBranches ? JSON.parse(savedBranches) : prev.branches,
            staff: savedStaff ? JSON.parse(savedStaff) : []
        }))
    }, [])

    // Mock data for fallback if staff list is empty, but we prioritize localStorage
    const mockStaff = [
        { id: 1, name: 'BS. Nguyễn Văn A', role: 'Bác sĩ', branch: 'Cơ Sở 3 - Quận 7', specialty: 'Nha khoa thẩm mỹ', image: 'bg-blue-100', reviews: 156, rating: 4.9 },
        { id: 3, name: 'BS. Lê Minh C', role: 'Bác sĩ', branch: 'Cơ Sở 3 - Quận 7', specialty: 'Điều trị nha chu', image: 'bg-green-100', reviews: 138, rating: 4.8 },
        { id: 2, name: 'KTV. Trần Thị B', role: 'Kỹ thuật viên', branch: 'Cơ Sở 1 - Quận 1', specialty: 'Chăm sóc da', image: 'bg-pink-100', reviews: 142, rating: 4.9 },
        { id: 4, name: 'KTV. Phạm Thu D', role: 'Kỹ thuật viên', branch: 'Cơ Sở 2 - Quận 3', specialty: 'Phụ tá', image: 'bg-purple-100', reviews: 98, rating: 4.7 },
    ]

    const staffListToUse = data.staff.length > 0 ? data.staff : mockStaff

    // Lọc nhân viên theo cơ sở đã chọn
    const filteredStaff = selectedBranch
        ? staffListToUse.filter(s => s.branch === selectedBranch)
        : []

    const handleRateClick = (staffName: string) => {
        router.push(`/feedback?staff=${encodeURIComponent(staffName)}&branch=${encodeURIComponent(selectedBranch || '')}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pb-20">

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {selectedBranch ? (
                            <button onClick={() => setSelectedBranch(null)} className="p-1 -ml-2 rounded-full hover:bg-gray-100">
                                <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
                            </button>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-medical-blue to-soft-teal flex items-center justify-center text-white font-bold">
                                H
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">
                                {selectedBranch ? 'Chọn Nhân viên' : 'Chào mừng quý khách!'}
                            </h1>
                            <p className="text-xs text-gray-500">Hệ thống Đánh giá Chất lượng</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-6 animate-in fade-in duration-500">

                {/* CASE 1: CHƯA CHỌN CƠ SỞ -> HIỆN LIST CƠ SỞ */}
                {!selectedBranch && (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                            Bạn đang ở cơ sở nào?
                        </h2>
                        <div className="space-y-3">
                            {data.branches.map(branch => (
                                <button
                                    key={branch.id}
                                    onClick={() => setSelectedBranch(branch.name)}
                                    className="w-full bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 hover:shadow-lg hover:border-blue-200 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-medical-blue group-hover:bg-blue-100 transition-colors">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-medical-blue transition-colors">{branch.name}</h3>
                                        <p className="text-sm text-gray-500">{branch.address}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-medical-blue group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* CASE 2: ĐÃ CHỌN CƠ SỞ -> HIỆN LIST NHÂN VIÊN */}
                {selectedBranch && (
                    <>
                        {/* Branch Info Card */}
                        <div className="bg-gradient-to-r from-medical-blue to-soft-teal p-5 rounded-2xl shadow-lg mb-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="opacity-80 text-sm mb-1">Đang xem nhân sự tại:</p>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {selectedBranch}
                                </h2>
                            </div>
                            {/* Filter Dropdown (Optional change) */}
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full bg-white/20 text-white border border-white/30 rounded-lg py-2 px-3 text-sm focus:bg-white focus:text-gray-800 transition-colors appearance-none outline-none cursor-poitner"
                                >
                                    {data.branches.map(b => <option key={b.id} value={b.name} className="text-gray-800">{b.name}</option>)}
                                </select>
                            </div>
                            <CirclePattern />
                        </div>

                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-soft-teal" />
                            Đội ngũ Bác sĩ & KTV
                        </h2>

                        <div className="space-y-4">
                            {filteredStaff.length > 0 ? filteredStaff.map(staff => (
                                <div key={staff.id} className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex gap-4 transition-all hover:scale-[1.02]">
                                    <div className={`w-20 h-20 rounded-2xl ${staff.image || 'bg-gray-100'} flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden relative group-hover:shadow-md transition-all`}>
                                        {staff.avatar ? (
                                            <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className={`w-10 h-10 text-gray-400 ${staff.image ? 'opacity-50' : ''}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 truncate">{staff.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${staff.role === 'Bác sĩ' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {staff.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-amber-700">{staff.rating}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 mt-1 mb-3 truncate">{staff.specialty}</p>

                                        <button
                                            onClick={() => handleRateClick(staff.name)}
                                            className="w-full py-2.5 bg-gradient-to-r from-medical-blue to-soft-teal text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group mt-2"
                                        >
                                            Đánh giá ngay
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">Chưa có nhân sự nào tại cơ sở này.</p>
                                    <button onClick={() => setSelectedBranch(null)} className="mt-4 text-medical-blue font-bold hover:underline">
                                        Quay lại chọn cơ sở khác
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// Decorative decoration
const CirclePattern = () => (
    <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-20 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="white" />
            <circle cx="100" cy="100" r="60" fill="white" />
            <circle cx="100" cy="100" r="40" fill="white" />
        </svg>
    </div>
)
