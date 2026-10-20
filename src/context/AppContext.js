import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseRepository } from '../repositories/CourseRepository';
import { categoryRepository } from '../repositories/CategoryRepository';

import initialMockData from '../data/mockData.json';

const AppContext = createContext();

/**
 * AppProvider: Cung cấp Reactive State Management cho toàn bộ ứng dụng.
 * Tích hợp chặt chẽ với CourseRepository và CategoryRepository.
 */
export const AppProvider = ({ children }) => {
  // Khởi tạo sẵn dữ liệu mẫu để render tức thì 100% không bị màn hình trắng
  const [courses, setCourses] = useState(initialMockData.courses || []);
  const [categories, setCategories] = useState(initialMockData.categories || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tải & đồng bộ dữ liệu với MockAPI ngầm (non-blocking)
  const loadInitialData = useCallback(async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        courseRepository.getAll(),
        categoryRepository.getAll(),
      ]);
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        setCourses(coursesData);
      }
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (err) {
      console.warn('[AppContext] Chưa kết nối được MockAPI URL, tiếp tục dùng dữ liệu offline:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ==================== REACTIVE ACTIONS CHO COURSES ====================

  const addCourse = async (courseData) => {
    const created = await courseRepository.create(courseData);
    setCourses((prev) => [created, ...prev]);
    return created;
  };

  const updateCourse = async (id, courseData) => {
    const updated = await courseRepository.update(id, courseData);
    setCourses((prev) =>
      prev.map((c) => (String(c.id) === String(id) ? updated : c))
    );
    return updated;
  };

  const deleteCourse = async (id) => {
    await courseRepository.delete(id);
    setCourses((prev) => prev.filter((c) => String(c.id) !== String(id)));
    return true;
  };

  // ==================== REACTIVE ACTIONS CHO CATEGORIES ====================

  const addCategory = async (categoryData) => {
    const created = await categoryRepository.create(categoryData);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const updateCategory = async (id, categoryData) => {
    const updated = await categoryRepository.update(id, categoryData);
    setCategories((prev) =>
      prev.map((c) => (String(c.id) === String(id) ? updated : c))
    );
    return updated;
  };

  const deleteCategory = async (id, cascade = false) => {
    // Kiểm tra ràng buộc khóa ngoại trước khi xóa
    const check = categoryRepository.canDelete(id, courses);
    if (!check.canDelete && !cascade) {
      throw new Error(
        `Không thể xóa danh mục này! Hiện có ${check.linkedCount} khóa học đang thuộc danh mục.`
      );
    }
    await categoryRepository.delete(id);
    if (cascade) {
      // Nếu người dùng chọn xóa kèm giải phóng: chuyển các khóa học về 'Chưa phân loại'
      setCourses((prev) =>
        prev.map((c) =>
          String(c.categoryId) === String(id) ? { ...c, categoryId: '' } : c
        )
      );
    }
    setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
    return true;
  };

  const syncStandardCategories = async () => {
    try {
      setLoading(true);
      const synced = await categoryRepository.syncStandardNames();
      setCategories(synced);
      return synced;
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const found = categories.find((c) => String(c.id) === String(categoryId));
    return found ? found.name : 'Chưa phân loại';
  };

  return (
    <AppContext.Provider
      value={{
        courses,
        categories,
        loading,
        error,
        refreshData: loadInitialData,
        addCourse,
        updateCourse,
        deleteCourse,
        addCategory,
        updateCategory,
        deleteCategory,
        syncStandardCategories,
        getCategoryName,
        courseRepository,
        categoryRepository,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook tiện lợi
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp phải được sử dụng bên trong AppProvider');
  }
  return context;
};
