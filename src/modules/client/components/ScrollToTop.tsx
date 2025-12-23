import { useEffect } from "react";

/**
 * ScrollToTop component
 * Scroll lên đầu trang mỗi khi component được render hoặc dependency thay đổi.
 * Phiên bản này không cần react-router, có thể dùng trong bất kỳ trang nào.
 * Hỗ trợ smooth scroll.
 *
 * @param {number} props.delay - thời gian delay trước khi scroll (ms), mặc định 0
 */
const ScrollToTop = ({ delay = 0 }) => {
  useEffect(() => {
    // Nếu muốn delay trước khi scroll
    const timer = setTimeout(() => {
      // Scroll lên đầu trang với behavior mượt
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, delay);

    // Cleanup khi component unmount
    return () => clearTimeout(timer);
  }, [delay]); // Dependency: delay, nếu thay đổi thì effect chạy lại

  // Component này không render gì ra UI
  return null;
};

export default ScrollToTop;
