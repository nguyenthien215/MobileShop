# Fix Bug: Không đánh giá được sản phẩm đã mua

**Ngày:** 25/11/2025  
**Version:** 1.0  
**Tác giả:** GitHub Copilot

---

## Mô tả Bug

### Triệu chứng:
- User đã đặt hàng và thanh toán bằng ngân hàng (payment.status = 'paid')
- Đơn hàng hiển thị trong lịch sử với nút "Đánh giá"
- Khi click vào nút đánh giá → không cho phép đánh giá (hiển thị thông báo "Chưa đủ điều kiện")
- COD chưa completed thì đúng là không cho đánh giá

### Nguyên nhân:
Hàm `canReview()` trong `server/src/controllers/review.controller.js` có logic sai:

```javascript
// CODE CŨ (SAI)
async function canReview(userId, productId) {
    const orderItem = await OrderItem.findOne({  // ❌ CHỈ LẤY 1 ĐƠN HÀNG
        where: { productId },
        include: [{
            model: Order,
            where: { userId, status: { [Op.not]: 'cancelled' } },
            include: [{ model: Payment, as: 'payment', required: false }]
        }]
    });
    
    if (!orderItem) return false;
    const order = orderItem.Order;
    if (!order) return false;

    if (order.paymentMethod === 'bank') {
        if (!order.payment) return true;
        return order.payment.status === 'paid';
    }
    if (order.paymentMethod === 'COD') {
        return order.status === 'completed';
    }
    return false;
}
```

**Vấn đề:**
- `findOne()` chỉ lấy **MỘT** OrderItem đầu tiên tìm thấy
- Nếu user mua cùng sản phẩm nhiều lần:
  - Đơn 1: COD, status = pending → Không eligible
  - Đơn 2: Bank, payment.status = paid → **ĐÚNG RA PHẢI ELIGIBLE**
- Nhưng `findOne()` có thể trả về Đơn 1 → kết quả sai!

### Ví dụ thực tế:

**Kịch bản:**
1. User mua iPhone 14 Pro Max lần 1: COD, đơn đang pending
2. User mua iPhone 14 Pro Max lần 2: Bank transfer, đã paid
3. User vào lịch sử đơn hàng → thấy nút "Đánh giá" ở đơn 2
4. Click vào → **Lỗi: "Chưa đủ điều kiện"** ❌

**Database:**
```
OrderItems:
- OrderItem 1: orderId=100, productId='abc', Order { paymentMethod: 'COD', status: 'pending' }
- OrderItem 2: orderId=101, productId='abc', Order { paymentMethod: 'bank', payment: { status: 'paid' } }

findOne() → Có thể trả về OrderItem 1 → check COD + pending → return false
```

---

## Giải pháp

### Thay đổi logic:
Đổi từ `findOne()` → `findAll()` và kiểm tra **TẤT CẢ** đơn hàng. Chỉ cần **BẤT KỲ** đơn nào đủ điều kiện là cho phép đánh giá.

### Code mới:

```javascript
// CODE MỚI (ĐÚNG) ✅
async function canReview(userId, productId) {
    // Lấy TẤT CẢ OrderItem của sản phẩm này từ user
    const orderItems = await OrderItem.findAll({  // ✅ LẤY TẤT CẢ
        where: { productId },
        include: [{
            model: Order,
            where: { userId, status: { [Op.not]: 'cancelled' } },
            include: [{ model: Payment, as: 'payment', required: false }]
        }]
    });
    
    if (!orderItems || orderItems.length === 0) return false;

    // Kiểm tra từng đơn hàng, chỉ cần 1 đơn đủ điều kiện là return true
    for (const orderItem of orderItems) {
        const order = orderItem.Order;
        if (!order) continue;

        // Trường hợp thanh toán ngân hàng
        if (order.paymentMethod === 'bank') {
            // Nếu có payment record và status = 'paid' → eligible
            if (order.payment && order.payment.status === 'paid') {
                return true;  // ✅ Tìm thấy đơn bank đã paid
            }
            // Fallback: đơn cũ chưa có payment record nhưng paymentMethod là bank → cho phép
            if (!order.payment) {
                return true;  // ✅ Đơn cũ chưa có payment (backward compatibility)
            }
        }
        
        // Trường hợp COD: chỉ khi đơn hàng completed
        if (order.paymentMethod === 'COD' && order.status === 'completed') {
            return true;  // ✅ Tìm thấy đơn COD đã completed
        }
    }

    return false;  // Không có đơn nào đủ điều kiện
}
```

---

## Logic mới

### Quy tắc kiểm tra:

**Thanh toán ngân hàng (bank):**
- ✅ **Eligible** nếu: `payment.status === 'paid'`
- ✅ **Eligible** nếu: Đơn cũ không có payment record (fallback)
- ❌ **Not eligible** nếu: `payment.status === 'pending'` hoặc 'unpaid'

**Thanh toán khi nhận hàng (COD):**
- ✅ **Eligible** nếu: `order.status === 'completed'`
- ❌ **Not eligible** nếu: `order.status === 'pending'`, 'shipped', hoặc 'cancelled'

### Flowchart:

```
User click "Đánh giá"
    ↓
Backend: canReview(userId, productId)
    ↓
Tìm TẤT CẢ OrderItem của sản phẩm này
    ↓
Loop qua từng OrderItem:
    ├─ paymentMethod = 'bank'?
    │   ├─ payment.status = 'paid'? → ✅ return true
    │   └─ !payment? → ✅ return true (fallback)
    │
    └─ paymentMethod = 'COD'?
        └─ order.status = 'completed'? → ✅ return true
    ↓
Không có đơn nào đủ điều kiện → ❌ return false
```

---

## Testing

### Test Case 1: User mua 1 lần, bank đã paid
**Setup:**
- Order 1: Bank, payment.status = 'paid'

**Expected:**
- ✅ Hiển thị nút "Đánh giá"
- ✅ Click vào → Cho phép đánh giá

### Test Case 2: User mua 2 lần, COD pending + Bank paid
**Setup:**
- Order 1: COD, status = 'pending'
- Order 2: Bank, payment.status = 'paid'

**Expected:**
- ✅ Hiển thị nút "Đánh giá"
- ✅ Click vào → Cho phép đánh giá (vì Order 2 eligible)

### Test Case 3: User mua 1 lần, COD pending
**Setup:**
- Order 1: COD, status = 'pending'

**Expected:**
- ❌ KHÔNG hiển thị nút "Đánh giá"
- ❌ Nếu call API trực tiếp → "Chưa đủ điều kiện"

### Test Case 4: User mua 1 lần, COD completed
**Setup:**
- Order 1: COD, status = 'completed'

**Expected:**
- ✅ Hiển thị nút "Đánh giá"
- ✅ Click vào → Cho phép đánh giá

### Test Case 5: User mua 2 lần, cả 2 đều COD pending
**Setup:**
- Order 1: COD, status = 'pending'
- Order 2: COD, status = 'pending'

**Expected:**
- ❌ KHÔNG hiển thị nút "Đánh giá"

### Test Case 6: User mua 3 lần, hỗn hợp
**Setup:**
- Order 1: COD, status = 'pending' → Not eligible
- Order 2: Bank, payment.status = 'pending' → Not eligible
- Order 3: Bank, payment.status = 'paid' → **ELIGIBLE** ✅

**Expected:**
- ✅ Hiển thị nút "Đánh giá"
- ✅ Click vào → Cho phép đánh giá (vì Order 3 eligible)

---

## Files thay đổi

### 1. `server/src/controllers/review.controller.js`

**Thay đổi:**
- Đổi `OrderItem.findOne()` → `OrderItem.findAll()`
- Thêm vòng lặp `for` để kiểm tra tất cả đơn hàng
- Return `true` ngay khi tìm thấy đơn đầu tiên eligible

**Dòng code:** 12-51

---

## Impact Analysis

### Ảnh hưởng:
- ✅ **Không ảnh hưởng** đến các đơn hàng cũ
- ✅ **Không thay đổi** database schema
- ✅ **Không thay đổi** API endpoints
- ✅ **Backward compatible:** Vẫn hỗ trợ đơn cũ không có payment record

### Cải thiện:
- ✅ User có thể đánh giá sau khi thanh toán bank thành công
- ✅ Logic chính xác khi user mua nhiều lần cùng sản phẩm
- ✅ Trải nghiệm người dùng tốt hơn

---

## Frontend Logic (Không thay đổi)

### OrderHistory.tsx
Hiển thị nút "Đánh giá" nếu:
```typescript
const canReview = (
    // Bank đã paid
    (o.paymentMethod === 'bank' && o.payment?.status === 'paid') ||
    // Bank cũ không có payment
    (o.paymentMethod === 'bank' && !o.payment) ||
    // COD completed
    (o.paymentMethod === 'COD' && o.status === 'completed')
);
```

**Note:** Frontend chỉ kiểm tra 1 đơn hàng hiện tại trong list. Backend mới sẽ kiểm tra tất cả đơn hàng → 2 layer validation.

---

## Deployment Checklist

- [x] Đã sửa code backend
- [x] Đã test logic mới
- [x] Không cần migration database
- [x] Không cần update frontend
- [x] Backward compatible với đơn hàng cũ
- [ ] Deploy server mới
- [ ] Test trên production
- [ ] Monitor error logs

---

## Monitoring

### Metrics cần theo dõi:
1. Số lượng review được submit sau fix
2. Error rate của endpoint `/reviews/eligible/:productId`
3. Error rate của endpoint `POST /reviews`
4. User feedback về việc đánh giá sản phẩm

### Expected Results:
- 📈 Tăng số lượng review (do user bank payment giờ đánh giá được)
- 📉 Giảm complaints về "không đánh giá được"
- ✅ Error rate không đổi hoặc giảm

---

## Liên quan

- **File:** `server/src/controllers/review.controller.js`
- **API Endpoints:**
  - `GET /api/reviews/eligible/:productId` - Kiểm tra điều kiện đánh giá
  - `POST /api/reviews` - Submit đánh giá
  - `GET /api/reviews/:productId` - Lấy danh sách đánh giá
- **Database Tables:**
  - `orders` - Đơn hàng
  - `order_items` - Chi tiết đơn hàng
  - `payments` - Thanh toán
  - `reviews` - Đánh giá sản phẩm

---

## Next Steps (Optional)

### Cải tiến thêm:
1. **Thông báo rõ ràng hơn:**
   - Khi user không đủ điều kiện, hiển thị lý do cụ thể
   - Ví dụ: "COD cần hoàn tất đơn hàng" hoặc "Chờ xác nhận thanh toán"

2. **Badge "Đã mua":**
   - Hiển thị badge ở product detail nếu user đã mua
   - Ngay cả khi chưa eligible đánh giá

3. **Notification khi eligible:**
   - Gửi email/notification khi đơn hàng bank được xác nhận paid
   - Nhắc nhở user đánh giá sản phẩm

4. **Admin dashboard:**
   - Thống kê tỷ lệ đánh giá theo payment method
   - Monitor số lượng đơn bank đã paid vs reviews

---

**Tác giả:** GitHub Copilot  
**Ngày tạo:** 25/11/2025  
**Version:** 1.0
