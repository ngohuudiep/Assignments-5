import { apiClient } from '../services/apiClient';
import initialMockData from '../data/mockData.json';

export const STANDARD_CATEGORIES = {
  '1': {
    name: 'Lập trình Mobile',
    description: 'Android, Flutter, React Native, iOS Swift',
  },
  '2': {
    name: 'Lập trình Web',
    description: 'Frontend, Backend, Fullstack NodeJS, React, Vue',
  },
  '3': {
    name: 'Trí tuệ nhân tạo',
    description: 'AI, Machine Learning, Deep Learning, Data Science',
  },
  '4': {
    name: 'Thiết kế UI/UX & Đồ họa',
    description: 'Figma, Adobe XD, Design Systems, Prototype',
  },
};

export const isDummyCategoryName = (name) => {
  if (!name || typeof name !== 'string') return true;
  return /^name\s*\d*$/i.test(name.trim());
};

/**
 * CategoryRepository: Triển khai Repository Pattern cho tài nguyên Category (Danh mục).
 * Cung cấp abstraction layer giữa UI/Business Logic và Remote API.
 */
class CategoryRepository {
  constructor() {
    this.localCache = [...initialMockData.categories];
  }

  /**
   * Lấy toàn bộ danh sách danh mục
   * Tự động phát hiện và chuẩn hóa tên mặc định của MockAPI (name 1, name 2, name 3, name 4)
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const data = await apiClient.get('/categories');
      if (Array.isArray(data)) {
        // Tự động kiểm tra và chuẩn hóa nếu MockAPI trả về "name 1", "name 2", "name 3", "name 4"
        const normalized = data.map((item) => {
          const std = STANDARD_CATEGORIES[String(item.id)];
          if (std && isDummyCategoryName(item.name)) {
            // Tự động gửi cập nhật PUT lên MockAPI để lưu vĩnh viễn
            apiClient.put(`/categories/${item.id}`, {
              ...item,
              name: std.name,
              description: !item.description || isDummyCategoryName(item.description) ? std.description : item.description,
            }).catch((err) => console.warn('[CategoryRepository] Auto PUT category error:', err.message));

            return {
              ...item,
              name: std.name,
              description: !item.description || isDummyCategoryName(item.description) ? std.description : item.description,
            };
          }
          return item;
        });

        this.localCache = normalized;
        return normalized;
      }
      return this.localCache;
    } catch (error) {
      console.warn('[CategoryRepository] Lỗi API, sử dụng local cache:', error.message);
      return this.localCache;
    }
  }

  /**
   * Đồng bộ / khôi phục toàn bộ danh mục 1, 2, 3, 4 về tên chuẩn
   */
  async syncStandardNames() {
    const updatedCategories = [];
    for (const [id, std] of Object.entries(STANDARD_CATEGORIES)) {
      try {
        const res = await apiClient.put(`/categories/${id}`, {
          name: std.name,
          description: std.description,
        });
        updatedCategories.push(res);
      } catch (err) {
        updatedCategories.push({
          id,
          name: std.name,
          description: std.description,
        });
      }
    }
    this.localCache = updatedCategories;
    return updatedCategories;
  }

  /**
   * Lấy chi tiết một danh mục theo ID
   * @param {string|number} id
   */
  async getById(id) {
    try {
      return await apiClient.get(`/categories/${id}`);
    } catch (error) {
      const found = this.localCache.find((c) => String(c.id) === String(id));
      if (found) return found;
      throw error;
    }
  }

  /**
   * Thêm mới một danh mục
   * @param {{ name: string, description?: string }} categoryData
   */
  async create(categoryData) {
    try {
      const created = await apiClient.post('/categories', categoryData);
      this.localCache.push(created);
      return created;
    } catch (error) {
      const fallbackItem = {
        id: String(Date.now()),
        ...categoryData,
      };
      this.localCache.push(fallbackItem);
      return fallbackItem;
    }
  }

  /**
   * Cập nhật thông tin danh mục
   * @param {string|number} id
   * @param {{ name: string, description?: string }} categoryData
   */
  async update(id, categoryData) {
    try {
      const updated = await apiClient.put(`/categories/${id}`, categoryData);
      this.localCache = this.localCache.map((c) =>
        String(c.id) === String(id) ? updated : c
      );
      return updated;
    } catch (error) {
      this.localCache = this.localCache.map((c) =>
        String(c.id) === String(id) ? { ...c, ...categoryData } : c
      );
      return this.localCache.find((c) => String(c.id) === String(id));
    }
  }

  /**
   * Xóa danh mục theo ID
   * @param {string|number} id
   */
  async delete(id) {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (error) {
      console.warn('[CategoryRepository] Lỗi delete API, xóa khỏi local cache:', error.message);
    }
    this.localCache = this.localCache.filter((c) => String(c.id) !== String(id));
    return true;
  }

  /**
   * RÀNG BUỘC THEO ĐỀ BÀI: Kiểm tra danh mục có thể xóa hay không
   * Không cho xóa nếu có bất kỳ khóa học nào đang liên kết với danh mục này.
   * @param {string|number} categoryId
   * @param {Array} courses
   * @returns {{ canDelete: boolean, linkedCount: number }}
   */
  canDelete(categoryId, courses = []) {
    const linkedCourses = courses.filter(
      (c) => String(c.categoryId) === String(categoryId)
    );
    return {
      canDelete: linkedCourses.length === 0,
      linkedCount: linkedCourses.length,
    };
  }
}

export const categoryRepository = new CategoryRepository();
