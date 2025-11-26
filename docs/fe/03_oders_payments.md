# 03 - Orders & Payments (Đặt hàng & Thanh toán)

## Mục tiêu
Xây dựng quy trình đặt hàng và thanh toán hoàn chỉnh từ giỏ hàng → checkout → payment → lịch sử đơn hàng.

---

## Task 1: Tạo Trang Checkout (Đặt hàng)

### 1.1. Tạo Checkout Page
**File:** `src/pages/Checkout.tsx`

**Chức năng:**
- Hiển thị sản phẩm trong giỏ hàng (readonly)
- Form nhập thông tin khách hàng
- Chọn phương thức thanh toán
- Tính tổng tiền
- Xác nhận đặt hàng

### 1.2. Form thông tin khách hàng

**Fields required:**
```typescript
interface ShippingInfo {
  name: string;           // Họ và tên
  phone: string;          // Số điện thoại
  address: string;        // Địa chỉ nhận hàng
}
```

**Validation:**
- [ ] Tên: không được rỗng, min 2 ký tự
- [ ] Số điện thoại: format 10-11 số, bắt đầu bằng 0
- [ ] Địa chỉ: không được rỗng, min 10 ký tự

**Implementation:**
```typescript
const [shippingInfo, setShippingInfo] = useState({
  name: '',
  phone: '',
  address: ''
});

const validateForm = () => {
  if (!shippingInfo.name.trim()) {
    addToast('Vui lòng nhập tên người nhận', { type: 'error' });
    return false;
  }
  if (!/^0\d{9,10}$/.test(shippingInfo.phone)) {
    addToast('Số điện thoại không hợp lệ', { type: 'error' });
    return false;
  }
  if (shippingInfo.address.length < 10) {
    addToast('Địa chỉ quá ngắn', { type: 'error' });
    return false;
  }
  return true;
};
```

**Checklist Task 1.2:**
- [ ] Form hiển thị 3 fields: Tên, SĐT, Địa chỉ
- [ ] Validation hoạt động khi submit
- [ ] Error messages hiển thị rõ ràng
- [ ] Auto-fill từ user profile (nếu đã đăng nhập)

### 1.3. Hiển thị giỏ hàng trong Checkout

**Data từ CartContext:**
```typescript
const { items, total } = useCart();

// items = [
//   {
//     id, productId, name, price, quantity, image
//   }
// ]
```

**UI:**
- Table/List hiển thị: Ảnh | Tên | Giá | Số lượng | Thành tiền
- Tổng cộng (sum của tất cả items)
- Readonly (không thể thay đổi số lượng ở đây)

**Checklist Task 1.3:**
- [ ] Hiển thị đầy đủ items trong cart
- [ ] Tính tổng tiền chính xác
- [ ] Format giá tiền VNĐ đúng
- [ ] Hiển thị ảnh sản phẩm

### 1.4. Chọn phương thức thanh toán

**Payment Methods:**
1. **COD** (Cash on Delivery) - Thanh toán khi nhận hàng
2. **Bank Transfer** - Chuyển khoản ngân hàng

```typescript
const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');

<div className="space-y-3">
  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
    <input
      type="radio"
      name="paymentMethod"
      value="cod"
      checked={paymentMethod === 'cod'}
      onChange={() => setPaymentMethod('cod')}
    />
    <div>
      <p className="font-semibold">Thanh toán khi nhận hàng (COD)</p>
      <p className="text-sm text-gray-500">
        Thanh toán bằng tiền mặt khi nhận hàng
      </p>
    </div>
  </label>

  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
    <input
      type="radio"
      name="paymentMethod"
      value="bank"
      checked={paymentMethod === 'bank'}
      onChange={() => setPaymentMethod('bank')}
    />
    <div>
      <p className="font-semibold">Chuyển khoản ngân hàng</p>
      <p className="text-sm text-gray-500">
        Thanh toán qua chuyển khoản
      </p>
    </div>
  </label>
</div>
```

**Checklist Task 1.4:**
- [ ] 2 radio options hiển thị
- [ ] Chọn 1 trong 2 phương thức
- [ ] Default: COD
- [ ] Highlight option đang chọn

---

## Task 2: Xử lý Thanh toán

### 2.1. Create Order API
**File:** `src/api/orderApi.ts`

```typescript
import axiosInstance from './axiosConfig';

export const orderApi = {
  // Tạo đơn hàng mới
  createOrder: (data: {
    items: { productId: string; quantity: number; price: number }[];
    total: number;
    shippingAddress: { name: string; phone: string; address: string };
    paymentMethod: 'cod' | 'bank';
  }) => axiosInstance.post('/orders', data),

  // Lấy lịch sử đơn hàng
  getMyOrders: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get('/orders/my-orders', { params }),

  // Lấy chi tiết đơn hàng
  getOrderById: (id: string) => axiosInstance.get(`/orders/${id}`),
};
```

### 2.2. Handle Order Submission

**Flow:**
```
1. User click "Đặt hàng"
2. Validate form thông tin khách hàng
3. POST /api/orders {
     items: [...],
     total: 10000000,
     shippingAddress: { name, phone, address },
     paymentMethod: 'cod'
   }
4. Backend tạo Order + OrderItems + Payment records
5. Response: { orderId, orderNumber, message }
6. Nếu paymentMethod === 'bank' → redirect sang trang payment
7. Nếu paymentMethod === 'cod' → redirect sang OrderSuccess page
8. Clear cart
```

**Implementation:**
```typescript
const handleSubmitOrder = async () => {
  // Validate
  if (!validateForm()) return;
  if (items.length === 0) {
    addToast('Giỏ hàng trống', { type: 'error' });
    return;
  }

  setLoading(true);
  try {
    // Prepare data
    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: total,
      shippingAddress: {
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        address: shippingInfo.address
      },
      paymentMethod: paymentMethod
    };

    // Create order
    const response = await orderApi.createOrder(orderData);
    const { orderId, orderNumber } = response.data;

    // Clear cart
    clearCart();

    // Redirect
    if (paymentMethod === 'bank') {
      navigate(`/payment/${orderId}`);
    } else {
      navigate(`/order-success/${orderId}`);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    addToast('Đặt hàng thất bại', { type: 'error' });
  } finally {
    setLoading(false);
  }
};
```

**Checklist Task 2.2:**
- [ ] Validate form trước khi submit
- [ ] API call POST /orders thành công
- [ ] Backend tạo Order + OrderItems + Payment
- [ ] Redirect đúng dựa vào paymentMethod
- [ ] Clear cart sau khi đặt hàng thành công
- [ ] Toast notification cho success/error

---

## Task 3: Trang Payment (Chuyển khoản ngân hàng)

### 3.1. Tạo Payment Page
**File:** `src/pages/Payment.tsx`

**Chức năng:**
- Hiển thị thông tin đơn hàng
- Hiển thị thông tin chuyển khoản
- Form nhập thông tin thẻ (fake - chỉ UI demo)
- Chọn ngân hàng
- Xác nhận thanh toán

**Route:** `/payment/:orderId`

### 3.2. Hiển thị thông tin thanh toán

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  Thông tin đơn hàng                     │
│  - Mã đơn: ORD-123456                   │
│  - Tổng tiền: 10,000,000 VNĐ            │
│  - Người nhận: Nguyễn Văn A            │
│  - SĐT: 0912345678                      │
│  - Địa chỉ: 123 ABC, Hà Nội            │
├─────────────────────────────────────────┤
│  Thông tin chuyển khoản                 │
│  - Ngân hàng: Vietcombank              │
│  - Số TK: 1234567890                    │
│  - Chủ TK: CONG TY ABC                  │
│  - Nội dung: ORD-123456                 │
├─────────────────────────────────────────┤
│  Nhập thông tin thẻ (Demo)             │
│  - Số thẻ: ________________            │
│  - Tên chủ thẻ: ____________           │
│  - Ngày hết hạn: __/__                  │
│  - CVV: ___                             │
├─────────────────────────────────────────┤
│  Chọn ngân hàng:                       │
│  [x] Vietcombank                        │
│  [ ] VietinBank                         │
│  [ ] BIDV                               │
│  [ ] Techcombank                        │
├─────────────────────────────────────────┤
│  [Xác nhận thanh toán]                 │
└─────────────────────────────────────────┘
```

### 3.3. Handle Payment Confirmation

**Flow:**
```
1. User nhập thông tin thẻ (fake)
2. Chọn ngân hàng
3. Click "Xác nhận thanh toán"
4. PUT /api/payments/:paymentId {
     status: 'paid',
     bankName: 'Vietcombank',
     cardNumber: '1234****5678'
   }
5. Backend update Payment.status = 'paid'
6. Redirect to OrderSuccess page
```

**Implementation:**
```typescript
const [cardInfo, setCardInfo] = useState({
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: ''
});
const [selectedBank, setSelectedBank] = useState('Vietcombank');

const handlePayment = async () => {
  // Validate card info (basic)
  if (!cardInfo.cardNumber || cardInfo.cardNumber.length < 16) {
    addToast('Số thẻ không hợp lệ', { type: 'error' });
    return;
  }

  setLoading(true);
  try {
    // Giả lập thanh toán (vì đây chỉ là demo)
    const response = await orderApi.confirmPayment(orderId, {
      bankName: selectedBank,
      cardNumber: cardInfo.cardNumber.slice(-4) // Chỉ lưu 4 số cuối
    });

    addToast('Thanh toán thành công!', { type: 'success' });
    navigate(`/order-success/${orderId}`);
  } catch (error) {
    addToast('Thanh toán thất bại', { type: 'error' });
  } finally {
    setLoading(false);
  }
};
```

**Checklist Task 3:**
- [ ] Hiển thị thông tin đơn hàng từ API
- [ ] Form nhập thẻ với validation
- [ ] Chọn ngân hàng (radio buttons)
- [ ] Button "Xác nhận thanh toán"
- [ ] API call update payment status
- [ ] Redirect sang OrderSuccess page
- [ ] Toast notifications

---

## Task 4: Trang Order Success

### 4.1. Tạo OrderSuccess Page
**File:** `src/pages/OrderSuccess.tsx`

**Route:** `/order-success/:orderId`

**UI:**
```
┌─────────────────────────────────────────┐
│          ✓ Đặt hàng thành công!         │
│                                         │
│  Mã đơn hàng: ORD-123456               │
│  Tổng tiền: 10,000,000 VNĐ              │
│                                         │
│  Cảm ơn bạn đã mua hàng tại MobiStore! │
│  Chúng tôi sẽ liên hệ với bạn sớm nhất. │
│                                         │
│  [Xem chi tiết đơn hàng]               │
│  [Tiếp tục mua sắm]                    │
└─────────────────────────────────────────┘
```

**Implementation:**
```typescript
export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await orderApi.getOrderById(orderId!);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error loading order:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-4">Đặt hàng thành công!</h1>
        
        {order && (
          <>
            <p className="text-gray-600 mb-2">
              Mã đơn hàng: <span className="font-semibold">{order.orderNumber}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Tổng tiền: <span className="font-semibold text-green-600">
                {formatPrice(order.total)}
              </span>
            </p>
          </>
        )}

        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã mua hàng tại MobiStore!<br />
          Chúng tôi sẽ liên hệ với bạn sớm nhất.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Checklist Task 4:**
- [ ] Success icon hiển thị (FaCheckCircle)
- [ ] Hiển thị mã đơn hàng và tổng tiền
- [ ] 2 buttons: "Xem đơn hàng" và "Tiếp tục mua sắm"
- [ ] Navigate đúng khi click buttons

---

## Task 5: Trang Orders History

### 5.1. Tạo Orders Page
**File:** `src/pages/Orders.tsx`

**Chức năng:**
- Hiển thị tất cả đơn hàng của user
- Filter theo status (pending, shipped, completed, cancelled)
- Pagination
- Xem chi tiết từng đơn hàng

**Route:** `/orders`

### 5.2. List Orders

**API Call:**
```typescript
const [orders, setOrders] = useState([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

useEffect(() => {
  loadOrders();
}, [page]);

const loadOrders = async () => {
  try {
    const response = await orderApi.getMyOrders({ page, limit: 10 });
    setOrders(response.data.rows);
    setTotalPages(Math.ceil(response.data.count / 10));
  } catch (error) {
    console.error('Error loading orders:', error);
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  Đơn hàng của tôi                       │
├─────────────────────────────────────────┤
│  [Tất cả] [Chờ xử lý] [Đã gửi] [Hoàn thành]  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │ ORD-123456    10,000,000 VNĐ      │ │
│  │ 01/01/2024    [Chờ xử lý]         │ │
│  │ 3 sản phẩm                        │ │
│  │ [Xem chi tiết]                    │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ ORD-123455    5,000,000 VNĐ       │ │
│  │ 31/12/2023    [Đã giao]           │ │
│  │ 1 sản phẩm                        │ │
│  │ [Xem chi tiết] [Đánh giá]        │ │
│  └───────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  [<] 1 2 3 4 5 [>]                     │
└─────────────────────────────────────────┘
```

### 5.3. Order Status Badge

**Component:**
```typescript
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    shipped: { text: 'Đã gửi', color: 'bg-blue-100 text-blue-800' },
    completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
      {config.text}
    </span>
  );
}
```

**Checklist Task 5:**
- [ ] List orders hiển thị đúng
- [ ] Mỗi order card hiển thị: mã đơn, ngày, tổng tiền, status, số sản phẩm
- [ ] Status badge màu sắc đúng
- [ ] Click "Xem chi tiết" → navigate to `/orders/:id`
- [ ] Pagination hoạt động
- [ ] Filter theo status (optional)
- [ ] Empty state: "Bạn chưa có đơn hàng nào"

---

## Kết quả mong đợi

✅ **Order Flow hoàn chỉnh:**
1. Checkout page với form thông tin và payment method
2. Payment page cho bank transfer (demo UI)
3. Order success page với confirmation
4. Orders history page với filter và pagination

✅ **Database Records:**
- `orders` table: Order info + shippingAddress JSON
- `order_items` table: Chi tiết sản phẩm từng đơn
- `payments` table: Payment method + status

✅ **API Integration:**
- POST `/orders` - Tạo đơn hàng
- GET `/orders/my-orders` - Lấy lịch sử đơn hàng
- GET `/orders/:id` - Chi tiết đơn hàng
- PUT `/payments/:id` - Update payment status

✅ **UX Features:**
- Form validation với error messages
- Loading states
- Toast notifications
- Responsive design
- Clear cart after order

---

## Testing Checklist

### Checkout Flow
- [ ] Navigate từ Cart → Checkout
- [ ] Form validation hoạt động
- [ ] Chọn payment method
- [ ] Submit order thành công
- [ ] Redirect đúng dựa vào payment method

### Payment Flow (Bank Transfer)
- [ ] Payment page load order info
- [ ] Form nhập thẻ với validation
- [ ] Chọn ngân hàng
- [ ] Confirm payment → update status
- [ ] Redirect to success page

### Order Success
- [ ] Success icon và message hiển thị
- [ ] Order info chính xác
- [ ] Buttons navigate đúng

### Orders History
- [ ] List orders với pagination
- [ ] Status badges màu sắc đúng
- [ ] Click xem chi tiết → navigate
- [ ] Empty state hiển thị khi chưa có đơn

---

## Next Steps

Chuyển sang:
- **04_add_cart.md** - Shopping cart functionality
- **05_search_products.md** - Product search & filter
- **07_reviews.md** - Product reviews system

