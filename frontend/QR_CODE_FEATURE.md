# QR Code Feature สำหรับระบบ Deposit

## 📱 **ภาพรวม**

เพิ่มฟีเจอร์ QR Code สำหรับการโอนเงินผ่าน PromptPay ในหน้า deposit เพื่อให้ผู้ใช้สามารถโอนเงินได้ง่ายและรวดเร็วขึ้น

## 🛠️ **Dependencies ที่ต้องติดตั้ง**

```bash
npm install promptpay-qr
# หรือ
bun add promptpay-qr
```

**Note:** `promptpay-qr` เป็น library ที่มี built-in TypeScript declarations และรองรับ EMV QRCPS Merchant Presented Mode standard

## 🎯 **Features ที่เพิ่มเข้ามา**

### **1. PromptPayQR Component**
- แสดง QR Code สำหรับ PromptPay
- รองรับการคัดลอกข้อมูล QR และเบอร์โทรศัพท์
- แสดงคำแนะนำการใช้งานที่ชัดเจน
- แสดงข้อดีของการใช้ QR Code

### **2. BankTransferInfo Component**
- แสดงข้อมูลการโอนเงินแบบธนาคารปกติ
- รองรับการคัดลอกข้อมูลแต่ละฟิลด์
- แสดงคำแนะนำการโอนเงินผ่านธนาคาร
- คัดลอกข้อมูลทั้งหมดได้ในคลิกเดียว

### **3. Enhanced Deposit Page**
- แสดง QR Code เมื่อมี PromptPay number
- แสดง Bank Transfer Info เมื่อไม่มี PromptPay
- ปรับปรุงการแสดงข้อมูลให้ไม่ซ้ำซ้อน
- เพิ่มคำแนะนำเฉพาะสำหรับแต่ละวิธีการโอน

## 📋 **การใช้งาน**

### **PromptPayQR Component**
```tsx
import PromptPayQR from '@/components/ui/PromptPayQR'

<PromptPayQR
  phoneNumber="0812345678"
  amount={1000}
  accountName="ร้านค้า ABC"
  onCopySuccess={() => {
    // Optional callback when QR data is copied
  }}
/>
```

### **BankTransferInfo Component**
```tsx
import BankTransferInfo from '@/components/ui/BankTransferInfo'

<BankTransferInfo
  bankName="ธนาคารกสิกรไทย"
  accountNumber="1234567890"
  accountName="บริษัท ABC จำกัด"
  amount={1000}
/>
```

## 🔧 **Technical Details**

### **QR Code Generation**
- ใช้ `promptpay-qr` library สำหรับสร้าง PromptPay QR payload
- ใช้ `react-qr-code` สำหรับแสดง QR Code
- รองรับการกำหนดจำนวนเงินใน QR Code
- ใช้มาตรฐาน EMV QRCPS Merchant Presented Mode
- รองรับเบอร์โทรศัพท์ในรูปแบบ PromptPay (เพิ่ม country code 66 อัตโนมัติ)

### **Error Handling**
- จัดการ error เมื่อไม่สามารถสร้าง QR Code ได้
- แสดง loading state ขณะสร้าง QR Code
- Fallback เป็น Bank Transfer Info เมื่อไม่มี PromptPay

### **Responsive Design**
- QR Code ปรับขนาดตามหน้าจอ
- Layout responsive สำหรับ mobile และ desktop
- Touch-friendly buttons สำหรับ mobile

## 🎨 **UI/UX Improvements**

### **Visual Enhancements**
- QR Code มี border และ shadow เพื่อความชัดเจน
- Color coding สำหรับข้อมูลต่างๆ (เขียวสำหรับจำนวนเงิน, น้ำเงินสำหรับข้อมูลบัญชี)
- Icons ที่เหมาะสมสำหรับแต่ละ action

### **User Experience**
- คำแนะนำที่ชัดเจนและเป็นขั้นตอน
- Copy feedback ด้วย icon และ text changes
- ข้อมูลสำคัญเน้นด้วย bold text
- Warning และ tips ที่เหมาะสม

## 📱 **Mobile Optimization**

### **Touch Interactions**
- ปุ่ม copy ขนาดเหมาะสมสำหรับการแตะ
- QR Code ขนาดที่เหมาะสมสำหรับการสแกน
- Spacing ที่เพียงพอระหว่าง elements

### **Performance**
- Dynamic import สำหรับ promptpay-qr เพื่อหลีกเลี่ยง SSR issues
- Lazy loading สำหรับ QR Code generation
- Optimized re-renders

## 🔒 **Security Considerations**

### **Data Validation**
- ตรวจสอบและทำความสะอาดเบอร์โทรศัพท์
- Validate จำนวนเงินก่อนสร้าง QR Code
- Error handling สำหรับ invalid inputs

### **Privacy**
- ไม่เก็บข้อมูล QR payload ใน state นานเกินไป
- Clear sensitive data เมื่อ component unmount
- ไม่ log sensitive information
- **⚠️ คำเตือน:** QR Code จะมีข้อมูล PromptPay ID (เบอร์โทรศัพท์) อยู่ในนั้น กรุณาปฏิบัติต่อ QR Code เหมือนข้อมูลส่วนตัว

## 🚀 **Future Enhancements**

### **Planned Features**
- รองรับ QR Code สำหรับธนาคารอื่นๆ
- QR Code expiration timer
- QR Code refresh functionality
- Analytics สำหรับการใช้งาน QR Code

### **Performance Improvements**
- QR Code caching
- Preload QR generation
- Optimize bundle size

## 📝 **Testing**

### **Test Cases**
- QR Code generation สำหรับ PromptPay numbers ต่างๆ
- Error handling เมื่อ invalid phone number
- Copy functionality บน browsers ต่างๆ
- Responsive design บน devices ต่างๆ
- Accessibility testing

### **Manual Testing**
- ทดสอบสแกน QR Code ด้วยแอปธนาคารจริง
- ทดสอบการโอนเงินผ่าน QR Code
- ทดสอบ copy functionality
- ทดสอบ UI บน mobile devices

## 🎯 **Benefits**

### **For Users**
- โอนเงินได้รวดเร็วขึ้น
- ลดความผิดพลาดในการพิมพ์เลขบัญชี
- ไม่ต้องจำเลขบัญชีหรือจำนวนเงิน
- ประสบการณ์การใช้งานที่ดีขึ้น

### **For Business**
- เพิ่มอัตราการฝากเงินสำเร็จ
- ลดเวลาในการประมวลผล
- ลด support tickets เรื่องการโอนเงินผิด
- เพิ่มความน่าเชื่อถือของระบบ
- รองรับลูกค้าจากทุกธนาคารในประเทศไทย
- ไม่มีค่าธรรมเนียมเพิ่มเติมสำหรับ PromptPay

## 📚 **ข้อมูลเพิ่มเติมเกี่ยวกับ PromptPay**

### **PromptPay คืออะไร**
- ระบบการโอนเงินแบบ Real-time ของธนาคารแห่งประเทศไทย
- ใช้เบอร์โทรศัพท์หรือเลขบัตรประชาชนแทนเลขบัญชี
- รองรับการโอนเงินข้ามธนาคารโดยไม่มีค่าธรรมเนียม
- ใช้ได้ 24/7 ไม่มีวันหยุด

### **ธนาคารที่รองรับ PromptPay**
- ธนาคารกรุงเทพ, กสิกรไทย, ไทยพาณิชย์, กรุงไทย
- ธนาคารทหารไทย, กรุงศรีอยุธยา, ธนชาต
- ธนาคารออมสิน, ธนาคารอาคารสงเคราะห์
- และธนาคารอื่นๆ ที่เข้าร่วมระบบ PromptPay
