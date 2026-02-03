# Hệ thống Đánh giá Chất lượng Dịch vụ - Demo

## ✅ Xong rồi! Dự án đã được tạo thành công.

## 📍 Vị trí dự án

```
/Users/cuong/Documents/CodeRoyal/clinic-quality-eval
```

## ⚠️ Yêu cầu trước khi chạy

Bạn cần cài đặt **Node.js** trước. Hệ thống không tìm thấy Node.js trên máy bạn.

### Cách cài Node.js (chọn 1 trong 2):

**Cách 1: Homebrew (Khuyến nghị)**

```bash
# Cài Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Sau đó cài Node.js
brew install node
```

**Cách 2: Tải trực tiếp**

- Vào: https://nodejs.org/
- Download bản LTS cho macOS
- Chạy file .pkg và làm theo hướng dẫn

## 🚀 Cách chạy Demo sau khi cài Node.js

```bash
# 1. Di chuyển vào thư mục dự án
cd /Users/cuong/Documents/CodeRoyal/clinic-quality-eval

# 2. Cài đặt thư viện
npm install

# 3. Chạy server
npm run dev
```

Sau đó mở trình duyệt và truy cập: **http://localhost:3000**

## ✨ Những gì đã được tạo

### 1. Dashboard "Quality Center"

- 📊 So sánh CSAT & NPS của **5 Cơ Sở**
- 🏆 Wall of Fame - Top 3 Nhân viên xuất sắc
- 📈 Biểu đồ so sánh chất lượng
- 🎯 Radar Chart đa chiều (Thái độ, Kỹ thuật, Vệ sinh...)

### 2. Dữ liệu Demo

- **5 Cơ sở**: Quận 1, Quận 3, Quận 7, Thủ Đức, Bình Thạnh
- Mẫu Bác sĩ & Kỹ thuật viên với điểm đánh giá
- Sentiment Analytics (Hài lòng / Trung bình / Cần cải thiện)

### 3. UI/UX Hiện đại

- ✅ Glassmorphism effects
- ✅ Smooth hover animations
- ✅ Gradient cards
- ✅ Responsive design (Mobile-friendly)
- ✅ Medical color theme (Teal, Blue, Green)

## 📁 Cấu trúc Files đã tạo

```
clinic-quality-eval/
├── app/
│   ├── layout.tsx (Layout chính + Font tiếng Việt)
│   ├── page.tsx (Dashboard chính - 5 cơ sở)
│   └── globals.css (Theme + Custom utilities)
├── package.json (Dependencies)
├── tailwind.config.ts (Color theme)
├── tsconfig.json (TypeScript config)
└── next.config.js (Next.js config)
```

## 🔮 Bước tiếp theo (sau khi demo chạy được)

1. Thêm trang Feedback Form cho khách hàng
2. Kết nối Database thực (Supabase/Firebase)
3. Thêm Authentication (Login Admin/Branch Manager)
4. Export PDFs báo cáo

---

**Ghi chú**: Tất cả files đã sẵn sàng, chỉ cần cài Node.js là có thể chạy ngay!
