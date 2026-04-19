
export const navigate = (to: string): void => {
  window.dispatchEvent(new CustomEvent("hotel:navigate", { detail: to }));
};