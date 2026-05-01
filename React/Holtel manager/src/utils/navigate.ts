// FIX: sử dụng cùng event name "navigate" với AppRouter
export const navigate = (to: string): void => {
  window.dispatchEvent(new CustomEvent("navigate", { detail: to }));
};
