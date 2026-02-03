'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Star, Camera, X, Upload, CheckCircle, User, MapPin, ChevronRight, Calendar, Phone, Hash, Mail, Sparkles, AlertCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

function FeedbackFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialBranch = searchParams.get('branch') || 'Cơ Sở 3 - Quận 7'
  const initialStaff = searchParams.get('staff') || ''

  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // State Config (Load from localStorage)
  const [config, setConfig] = useState({
    services: [
      'Lấy cao răng', 'Nhổ răng', 'Trám răng', 'Tẩy trắng răng',
      'Niềng răng', 'Cấy ghép Implant', 'Tiểu phẫu', 'Chăm sóc da', 'Massage trị liệu'
    ],
    criteria: [
      { id: 'c1', label: 'Kỹ năng & Tay nghề' },
      { id: 'c2', label: 'Thái độ phục vụ' },
      { id: 'c3', label: 'Vệ sinh & Không gian' }
    ],
    branches: [
      'Chi nhánh Thanh Xuân, Hà Nội',
      'Chi nhánh Vinh Nghệ An',
      'Chi nhánh Quận 5',
      'Chi nhánh Phổ Quang',
      'Chi nhánh Quận 6',
      'Chi nhánh Quận Thủ Đức'
    ],
    staff: [] as any[]
  })

  // Load config from localStorage on mount
  useEffect(() => {
    const savedServices = localStorage.getItem('clinic_services')
    const savedCriteria = localStorage.getItem('clinic_criteria')
    const savedBranches = localStorage.getItem('clinic_branches')
    const savedStaff = localStorage.getItem('clinic_staff')

    setConfig(prev => ({
      services: savedServices ? JSON.parse(savedServices) : prev.services,
      criteria: savedCriteria ? JSON.parse(savedCriteria) : prev.criteria,
      // Ensure we extract names if branches are objects, or use strings directly
      branches: savedBranches ? JSON.parse(savedBranches).map((b: any) => b.name || b) : prev.branches,
      staff: savedStaff ? JSON.parse(savedStaff) : []
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [formData, setFormData] = useState({
    customerCode: '',
    customerPhone: '',
    customerName: '',
    customerEmail: '',
    serviceDate: new Date().toISOString().split('T')[0],
    selectedServices: [] as string[],
    branch: initialBranch,
    staff: initialStaff,
    comment: '',
    files: [] as { url: string, file: File }[]
  })

  // State Ratings & Detail Comments
  const [ratingData, setRatingData] = useState<Record<string, { score: number, comment: string }>>({})

  // Derived Staff List based on selected branch
  const filteredStaffList = config.staff.length > 0
    ? config.staff.filter(s => s.branch === formData.branch).map(s => s.name)
    : ['BS. Nguyễn Văn A', 'BS. Lê Minh C', 'KTV. Trần Thị B', 'KTV. Phạm Thu D'] // Fallback mock

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.includes(service)
      const newServices = isSelected
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
      if (newServices.length > 0) setErrors(e => ({ ...e, selectedServices: '' }))
      return { ...prev, selectedServices: newServices }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (value && value.trim() !== '') {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRatingChange = (id: string, score: number) => {
    setRatingData(prev => ({
      ...prev,
      [id]: { ...prev[id], score }
    }))
  }

  const handleRatingCommentChange = (id: string, comment: string) => {
    setRatingData(prev => ({
      ...prev,
      [id]: { ...prev[id], comment }
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        url: URL.createObjectURL(file),
        file
      }))
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }))
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }))
  }

  // Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.branch) newErrors.branch = 'Vui lòng chọn chi nhánh'
    if (!formData.staff) newErrors.staff = 'Vui lòng chọn nhân viên'
    if (!formData.customerCode.trim()) newErrors.customerCode = 'Vui lòng nhập mã KH'
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Vui lòng nhập SĐT'
    if (!formData.customerName.trim()) newErrors.customerName = 'Vui lòng nhập họ tên'
    if (formData.selectedServices.length === 0) newErrors.selectedServices = 'Chọn ít nhất 1 dịch vụ'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.comment.trim()) newErrors.comment = 'Vui lòng nhập lời nhắn nhủ'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Helper: Convert files to Base64
  const processFiles = async (files: any[]) => {
    const promises = files.map(fileObj => {
      // If fileObj.file is missing, skip
      if (!fileObj.file) return Promise.resolve(null);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileObj.file);
        reader.onload = () => resolve(reader.result); // Base64 string
        reader.onerror = error => reject(error);
      });
    });
    return Promise.all(promises);
  }

  // Submit review to localStorage
  const submitReview = async () => {
    // Calculate average score
    const scores = Object.values(ratingData).map(r => r.score || 0).filter(s => s > 0)
    const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0

    const newReview = {
      id: Date.now(),
      customerCode: formData.customerCode,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      branch: formData.branch,
      staff: formData.staff,
      services: formData.selectedServices,
      serviceDate: formData.serviceDate,
      ratings: ratingData,
      averageScore: avgScore,
      comment: formData.comment,
      files: await processFiles(formData.files), // Lưu ảnh dạng Base64
      createdAt: new Date().toISOString()
    }

    // Get existing reviews from localStorage
    const existingReviews = JSON.parse(localStorage.getItem('clinic_reviews') || '[]')
    existingReviews.unshift(newReview) // Add to beginning
    localStorage.setItem('clinic_reviews', JSON.stringify(existingReviews))

    console.log('Review saved:', newReview)
  }

  // Validate Step 2: All criteria must be rated
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    // Check if all criteria have been rated (score > 0)
    const unratedCriteria = config.criteria.filter(c => !ratingData[c.id] || ratingData[c.id].score === 0)

    if (unratedCriteria.length > 0) {
      newErrors.ratings = `Vui lòng đánh giá tất cả ${config.criteria.length} tiêu chí`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (step === 1) {
      if (validateStep1()) setStep(2)
    } else if (step === 2) {
      if (validateStep2()) setStep(3)
    } else if (step === 3) {
      if (validateStep3()) {
        await submitReview() // Save review before showing success
        setStep(4)
      }
    }
  }

  // UI Components
  const ErrorMsg = ({ id }: { id: string }) => errors[id] ? (
    <span className="text-red-500 text-xs font-medium ml-2 flex items-center gap-1 animate-in fade-in">
      <AlertCircle className="w-3 h-3" /> {errors[id]}
    </span>
  ) : null

  const StarRating = ({
    id, label, value, comment, onScoreChange, onCommentChange
  }: {
    id: string, label: string, value: number, comment: string,
    onScoreChange: (v: number) => void, onCommentChange: (v: string) => void
  }) => (
    <div className="mb-6 animate-in fade-in duration-500">
      <div className="flex justify-between mb-2">
        <label className="font-bold text-gray-700">{label}</label>
        <span className={`text-sm font-semibold ${value > 0 ? 'text-medical-blue' : 'text-gray-400'}`}>
          {value > 0 ? `${value}/5` : 'Chưa chọn'}
        </span>
      </div>
      <div className="flex justify-between gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onScoreChange(star)}
            className="flex-1 aspect-square rounded-xl bg-gray-50 hover:bg-yellow-50 flex items-center justify-center transition-all group active:scale-95"
          >
            <Star className={`w-8 h-8 transition-all ${star <= value ? 'text-amber-400 fill-amber-400 scale-110' : 'text-gray-300 group-hover:text-amber-200'}`} />
          </button>
        ))}
      </div>
      <input
        type="text"
        value={comment || ''}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Đánh giá chi tiết (Không bắt buộc)..."
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-medical-blue focus:ring-2 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-400"
      />
    </div>
  )

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cảm ơn quý khách!</h2>
        <p className="text-gray-600 mb-8">Đánh giá và hình ảnh của bạn đã được gửi thành công.</p>
        <button onClick={() => router.push('/portal')} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg">Về trang chủ</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Top Bar */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-800">Gửi Đánh Giá</h1>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Bước {step}/3</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-medical-blue transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
            <div className={`bg-white p-5 rounded-2xl shadow-sm ${errors.staff ? 'border-2 border-red-100' : ''}`}>
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Nhân viên thực hiện</h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={formData.branch} onChange={(e) => handleInputChange('branch', e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:border-medical-blue font-medium">
                    {config.branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Staff Select + Avatar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select value={formData.staff} onChange={(e) => handleInputChange('staff', e.target.value)} className={`w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg text-sm appearance-none outline-none focus:border-medical-blue font-medium ${errors.staff ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                      <option value="">-- Chọn nhân viên --</option>
                      {filteredStaffList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Display Selected Avatar */}
                  {formData.staff && (
                    <div className="w-10 h-10 flex-shrink-0 animate-in fade-in zoom-in">
                      {(() => {
                        const s = config.staff.find(st => st.name === formData.staff)
                        if (s?.avatar) {
                          return <img src={s.avatar} alt={s.name} className="w-full h-full rounded-full object-cover border border-gray-200 shadow-sm" />
                        }
                        return <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm border border-blue-200">{s?.name?.charAt(0) || <User className="w-5 h-5" />}</div>
                      })()}
                    </div>
                  )}
                </div>

                {errors.staff && <p className="text-xs text-red-500 mt-1">{errors.staff}</p>}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-medical-blue">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Thông tin Khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-1">Mã khách hàng <span className="text-red-500 ml-1">*</span><ErrorMsg id="customerCode" /></label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formData.customerCode} onChange={e => handleInputChange('customerCode', e.target.value)} placeholder="Vd: KH001" className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.customerCode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  </div>
                </div>
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-1">Số điện thoại <span className="text-red-500 ml-1">*</span><ErrorMsg id="customerPhone" /></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" value={formData.customerPhone} onChange={e => handleInputChange('customerPhone', e.target.value)} placeholder="09xx..." className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.customerPhone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-1">Họ tên <span className="text-red-500 ml-1">*</span><ErrorMsg id="customerName" /></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formData.customerName} onChange={e => handleInputChange('customerName', e.target.value)} placeholder="Nhập họ tên..." className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all ${errors.customerName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email (Tùy chọn)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={formData.customerEmail} onChange={e => handleInputChange('customerEmail', e.target.value)} placeholder="email@example.com" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-white p-5 rounded-2xl shadow-sm ${errors.selectedServices ? 'border-2 border-red-100' : ''}`}>
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Dịch vụ đã sử dụng</h2>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày thực hiện</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={formData.serviceDate} onChange={e => handleInputChange('serviceDate', e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {config.services.map(srv => (
                  <button key={srv} onClick={() => handleServiceToggle(srv)} className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${formData.selectedServices.includes(srv) ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {formData.selectedServices.includes(srv) ? '✅ ' : '+ '}{srv}
                  </button>
                ))}
              </div>
              {errors.selectedServices && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.selectedServices}</p>}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className={`animate-in slide-in-from-right-4 duration-300 bg-white p-6 rounded-2xl shadow-sm ${errors.ratings ? 'border-2 border-red-100' : ''}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Chất lượng dịch vụ</h2>
            <div className="space-y-2">
              {config.criteria.map((item) => (
                <div key={item.id}>
                  <StarRating
                    id={item.id}
                    label={item.label}
                    value={ratingData[item.id]?.score || 0}
                    comment={ratingData[item.id]?.comment || ''}
                    onScoreChange={(v) => handleRatingChange(item.id, v)}
                    onCommentChange={(v) => handleRatingCommentChange(item.id, v)}
                  />
                  <div className="h-px bg-gray-100 mb-6 last:hidden" />
                </div>
              ))}
            </div>
            {errors.ratings && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4" /> {errors.ratings}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 duration-300 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-medical-blue" /> Hình ảnh thực tế (Nếu có)</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {formData.files.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-medical-blue hover:text-medical-blue hover:bg-blue-50 transition-all">
                  <Upload className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Tải ảnh</span>
                </button>
              </div>
              <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>

            <div className={`bg-white p-5 rounded-2xl shadow-sm ${errors.comment ? 'border-2 border-red-100' : ''}`}>
              <label className="flex items-center text-lg font-bold text-gray-800 mb-4">
                Lời nhắn nhủ <span className="text-red-500 ml-1">*</span>
                <ErrorMsg id="comment" />
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                className={`w-full p-4 bg-gray-50 border rounded-xl h-32 focus:ring-2 focus:ring-medical-blue outline-none resize-none ${errors.comment ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                placeholder="Chia sẻ thêm về trải nghiệm..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Quay lại</button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-700 active:scale-95"
          >
            {step === 3 ? 'Gửi đánh giá' : 'Tiếp tục'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10">Loading...</div>}>
      <FeedbackFormContent />
    </Suspense>
  )
}
