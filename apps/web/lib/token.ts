export const token = {
  get() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
  set(v: string) {
    localStorage.setItem('accessToken', v);
  },
  clear() {
    localStorage.removeItem('accessToken');
  },
};
