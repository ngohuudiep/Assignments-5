import { apiClient } from '../services/apiClient';
import initialMockData from '../data/mockData.json';

/**
 * CourseRepository: Triển khai Repository Pattern cho tài nguyên Course (Khóa học).
 * Quản lý dữ liệu khóa học, lọc, tìm kiếm và kiểm tra validation.
 */
class CourseRepository {
  constructor() {
    this.localCache = [...initialMockData.courses];
  }

  /**
   * Lấy toàn bộ danh sách khóa học
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const data = await apiClient.get('/courses');
      if (Array.isArray(data)) {
        this.localCache = data;
        return data;
      }
      return this.localCache;
    } catch (error) {
      console.warn('[CourseRepository] Lỗi API, sử dụng local cache:', error.message);
      return this.localCache;
    }
  }

  /**
   * Lấy chi tiết một khóa học theo ID
   * @param {string|number} id
   */
  async getById(id) {
    try {
      return await apiClient.get(`/courses/${id}`);
    } catch (error) {
      const found = this.localCache.find((c) => String(c.id) === String(id));
      if (found) return found;
      throw error;
    }
  }

  /**
   * Thêm mới một khóa học
   * @param {Object} courseData
   */
  async create(courseData) {
    this.validate(courseData);

    const payload = {
      ...courseData,
      createdAt: courseData.createdAt || new Date().toISOString().split('T')[0],
    };

    try {
      const created = await apiClient.post('/courses', payload);
      this.localCache.unshift(created);
      return created;
    } catch (error) {
      const fallbackItem = {
        id: String(Date.now()),
        ...payload,
      };
      this.localCache.unshift(fallbackItem);
      return fallbackItem;
    }
  }

  /**
   * Cập nhật thông tin khóa học
   * @param {string|number} id
   * @param {Object} courseData
   */
  async update(id, courseData) {
    this.validate(courseData);

    try {
      const updated = await apiClient.put(`/courses/${id}`, courseData);
      this.localCache = this.localCache.map((c) =>
        String(c.id) === String(id) ? updated : c
      );
      return updated;
    } catch (error) {
      this.localCache = this.localCache.map((c) =>
        String(c.id) === String(id) ? { ...c, ...courseData } : c
      );
      return this.localCache.find((c) => String(c.id) === String(id));
    }
  }

  /**
   * Xóa khóa học theo ID
   * @param {string|number} id
   */
  async delete(id) {
    try {
      await apiClient.delete(`/courses/${id}`);
    } catch (error) {
      console.warn('[CourseRepository] Lỗi delete API, xóa khỏi local cache:', error.message);
    }
    this.localCache = this.localCache.filter((c) => String(c.id) !== String(id));
    return true;
  }

  /**
   * Kiểm tra dữ liệu khóa học trước khi lưu
   * @param {Object} courseData
   */
  validate(courseData) {
    if (!courseData.title || !courseData.title.trim()) {
      throw new Error('Tên khóa học không được để trống.');
    }
    if (!courseData.categoryId) {
      throw new Error('Vui lòng chọn danh mục cho khóa học.');
    }
    if (!courseData.instructor || !courseData.instructor.trim()) {
      throw new Error('Tên giảng viên không được để trống.');
    }

    const price = Number(courseData.price);
    if (isNaN(price) || price < 0) {
      throw new Error('Học phí phải là một số không âm (>= 0 VNĐ).');
    }

    const duration = Number(courseData.duration);
    if (isNaN(duration) || duration <= 0) {
      throw new Error('Thời lượng phải là một số dương (> 0 giờ).');
    }

    if (!courseData.thumbnail || !courseData.thumbnail.trim()) {
      throw new Error('Vui lòng nhập URL ảnh bìa cho khóa học.');
    }
  }

  /**
   * Tìm kiếm và lọc danh sách khóa học theo reactive query & category
   * @param {Array} courses
   * @param {string} searchQuery
   * @param {string|number|null} categoryId
   */
  filterAndSearch(courses = [], searchQuery = '', categoryId = null) {
    const term = (searchQuery || '').trim().toLowerCase();

    return courses.filter((course) => {
      const matchSearch = term === '' || (course.title && course.title.toLowerCase().includes(term));
      const matchCat = categoryId === null || String(course.categoryId) === String(categoryId);
      return matchSearch && matchCat;
    });
  }
}

export const courseRepository = new CourseRepository();
