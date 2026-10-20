import { API_CONFIG } from '../constants/config';
import initialMockData from '../data/mockData.json';

// Bộ nhớ đệm cục bộ (in-memory) phục vụ trường hợp rớt mạng hoặc khi mới test chưa gắn URL MockAPI
let localCategories = [...initialMockData.categories];
let localCourses = [...initialMockData.courses];

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

// Helper thực hiện fetch với timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// ==================== CATEGORIES API ====================

export const getCategoriesApi = async () => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/categories`);
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    const mapped = Array.isArray(data)
      ? data.map((item) => {
          const stdMap = {
            '1': 'Lập trình Mobile',
            '2': 'Lập trình Web',
            '3': 'Trí tuệ nhân tạo',
            '4': 'Thiết kế UI/UX & Đồ họa',
          };
          if (/^name\s*\d*$/i.test(item.name || '') && stdMap[String(item.id)]) {
            return { ...item, name: stdMap[String(item.id)] };
          }
          return item;
        })
      : data;
    localCategories = mapped;
    return { data: mapped, isLocal: false };
  } catch (error) {
    console.warn('Lấy categories từ API thất bại, chuyển sang dữ liệu dự phòng:', error.message);
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      return { data: localCategories, isLocal: true, error: error.message };
    }
    throw error;
  }
};

export const createCategoryApi = async (categoryData) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCategories.push(data);
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      const newCategory = {
        id: String(Date.now()),
        ...categoryData,
      };
      localCategories.push(newCategory);
      return { data: newCategory, isLocal: true };
    }
    throw error;
  }
};

export const updateCategoryApi = async (id, categoryData) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCategories = localCategories.map((c) => (String(c.id) === String(id) ? data : c));
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      localCategories = localCategories.map((c) =>
        String(c.id) === String(id) ? { ...c, ...categoryData } : c
      );
      const updated = localCategories.find((c) => String(c.id) === String(id));
      return { data: updated, isLocal: true };
    }
    throw error;
  }
};

export const deleteCategoryApi = async (id) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCategories = localCategories.filter((c) => String(c.id) !== String(id));
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      localCategories = localCategories.filter((c) => String(c.id) !== String(id));
      return { data: { id }, isLocal: true };
    }
    throw error;
  }
};

// ==================== COURSES API ====================

export const getCoursesApi = async () => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/courses`);
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCourses = data;
    return { data, isLocal: false };
  } catch (error) {
    console.warn('Lấy courses từ API thất bại, chuyển sang dữ liệu dự phòng:', error.message);
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      return { data: localCourses, isLocal: true, error: error.message };
    }
    throw error;
  }
};

export const getCourseByIdApi = async (id) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/courses/${id}`);
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      const course = localCourses.find((c) => String(c.id) === String(id));
      if (course) return { data: course, isLocal: true };
    }
    throw error;
  }
};

export const createCourseApi = async (courseData) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/courses`, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCourses.unshift(data);
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      const newCourse = {
        id: String(Date.now()),
        createdAt: new Date().toISOString().split('T')[0],
        ...courseData,
      };
      localCourses.unshift(newCourse);
      return { data: newCourse, isLocal: true };
    }
    throw error;
  }
};

export const updateCourseApi = async (id, courseData) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCourses = localCourses.map((c) => (String(c.id) === String(id) ? data : c));
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      localCourses = localCourses.map((c) =>
        String(c.id) === String(id) ? { ...c, ...courseData } : c
      );
      const updated = localCourses.find((c) => String(c.id) === String(id));
      return { data: updated, isLocal: true };
    }
    throw error;
  }
};

export const deleteCourseApi = async (id) => {
  try {
    const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}/courses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    const data = await res.json();
    localCourses = localCourses.filter((c) => String(c.id) !== String(id));
    return { data, isLocal: false };
  } catch (error) {
    if (API_CONFIG.ENABLE_LOCAL_FALLBACK) {
      localCourses = localCourses.filter((c) => String(c.id) !== String(id));
      return { data: { id }, isLocal: true };
    }
    throw error;
  }
};

// ==================== HELPER UTILITIES ====================

// Format tiền tệ Việt Nam Đồng (VND)
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};
