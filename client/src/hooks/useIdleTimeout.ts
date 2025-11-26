import { useEffect, useRef } from 'react';

/**
 * Custom hook theo dõi thời gian không hoạt động của user
 * Tự động gọi callback khi user idle quá thời gian quy định
 * 
 * @param timeout - Thời gian timeout tính bằng milliseconds (vd: 30 * 60 * 1000 = 30 phút)
 * @param onIdle - Callback function được gọi khi user idle quá lâu
 * 
 * @example
 * ```tsx
 * useIdleTimeout(30 * 60 * 1000, () => {
 *   logout();
 *   console.log('Phiên đăng nhập đã hết hạn');
 * });
 * ```
 */
export const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    /**
     * Hàm reset timer - được gọi mỗi khi phát hiện hoạt động của user
     * Clear timeout cũ và tạo timeout mới
     */
    const resetTimer = () => {
      // Clear timer cũ nếu có
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // Tạo timer mới - sau khoảng thời gian timeout sẽ gọi onIdle
      timeoutId.current = setTimeout(() => {
        onIdle();
      }, timeout);
    };

    /**
     * Danh sách các events cần theo dõi để detect user activity
     * - mousemove: User di chuyển chuột
     * - mousedown: User click giữ chuột
     * - keypress: User gõ phím
     * - scroll: User cuộn trang
     * - touchstart: User chạm màn hình (mobile)
     * - click: User click vào element
     */
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Khởi tạo timer lần đầu khi component mount
    resetTimer();

    // Thêm event listeners cho tất cả các events
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    /**
     * Cleanup function
     * Được gọi khi:
     * - Component unmount
     * - Dependencies (timeout, onIdle) thay đổi
     * 
     * Nhiệm vụ:
     * - Clear timeout để tránh gọi callback khi component đã unmount
     * - Remove tất cả event listeners để tránh memory leaks
     */
    return () => {
      // Clear timeout nếu còn tồn tại
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // Remove tất cả event listeners
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, onIdle]); // Re-run effect khi timeout hoặc onIdle thay đổi
};
