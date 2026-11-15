# Hướng dẫn tích hợp API cho React Components

Để chuyển từ mock data sang API, hãy cập nhật các component theo pattern sau:

## Pattern chung cho tất cả components:

1. **Import các API functions và utilities:**
```typescript
import { useState, useEffect } from 'react';
import { propertyApi, Property } from '../../utils/api';
import { transformProperties } from '../../utils/dataTransform';
import { Property as MockProperty } from '../../data/mockData';
```

2. **Thay thế mock data bằng API calls:**
```typescript
// Trước đây:
import { properties } from '../../data/mockData';
const featuredProperties = properties.filter(p => p.featured);

// Sau khi update:
const [properties, setProperties] = useState<MockProperty[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await propertyApi.getAvailableFeatured();
      setProperties(transformProperties(data));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

const featuredProperties = properties.filter(p => p.featured);
```

## Component cần cập nhật:

### 1. **ListingsPage.tsx**
- Thay `properties` từ mock data bằng `propertyApi.getAll()`
- Sử dụng `transformProperties()` để convert data

### 2. **PropertyDetailPage.tsx**
- Thay cách lấy property detail bằng `propertyApi.getById()`
- Sử dụng `transformProperty()` để convert single property

### 3. **BookingFormPage.tsx**
- Thay user data bằng `userApi.getById()`
- Thay property data bằng `propertyApi.getById()`

### 4. **BookingHistoryPage.tsx**
- Thay bookings bằng `bookingApi.getByUserId()`
- Sử dụng `transformBookings()` để convert data

### 5. **UserProfilePage.tsx**
- Thay user data bằng `userApi.getById()`
- Sử dụng `transformUser()` để convert data

### 6. **Admin Components:**
- **AdminDashboard.tsx**: Sử dụng `dashboardApi.getStats()`, `dashboardApi.getRevenue()`, v.v.
- **PropertyManagement.tsx**: Sử dụng `propertyApi` cho CRUD operations
- **UserManagement.tsx**: Sử dụng `userApi` cho CRUD operations  
- **BookingManagement.tsx**: Sử dụng `bookingApi` cho CRUD operations
- **FeeManagement.tsx**: Sử dụng `feeApi` cho CRUD operations

### 7. **LoginPage.tsx**
- Thay login logic bằng API call đến `userApi.getByEmail()` hoặc tạo endpoint login riêng

## Ví dụ cụ thể cho ListingsPage:

```typescript
import { useState, useEffect } from 'react';
import { View, Property as MockProperty } from '../../data/mockData';
import { propertyApi } from '../../utils/api';
import { transformProperties } from '../../utils/dataTransform';

interface ListingsPageProps {
  navigate: (view: View, data?: unknown) => void;
}

export default function ListingsPage({ navigate }: ListingsPageProps) {
  const [properties, setProperties] = useState<MockProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyApi.getAll();
        setProperties(transformProperties(data));
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Filter logic giữ nguyên như cũ
  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.resort.toLowerCase().includes(filter.toLowerCase())
  );

  // Render logic giữ nguyên như cũ
  return (
    // ... JSX giữ nguyên, chỉ thay đổi data source
  );
}
```

## Lưu ý quan trọng:

1. **Giữ nguyên giao diện**: Chỉ thay đổi cách lấy data, không thay đổi JSX
2. **Error handling**: Thêm try-catch cho tất cả API calls
3. **Loading states**: Thêm loading indicators cho UX tốt hơn
4. **Data transformation**: Luôn sử dụng các transform functions để đảm bảo data format phù hợp với UI
5. **API Base URL**: Nếu cần thay đổi URL, cập nhật trong `src/utils/api.ts`

## Testing:

Sau khi update từng component:
1. Test xem data có hiển thị đúng không
2. Test loading states
3. Test error cases (khi API fail)
4. Test filter/search functionality (nếu có)
