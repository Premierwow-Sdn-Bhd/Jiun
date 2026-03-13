export const identityService = {
  getUserId(): string {
    let uid = localStorage.getItem('zen_user_id');
    if (!uid) {
      const randomStr = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      uid = 'guest_' + randomStr;
      localStorage.setItem('zen_user_id', uid);
    }
    return uid;
  },
  
  setUserId(id: string) {
    localStorage.setItem('zen_user_id', id);
  },

  logout() {
    localStorage.removeItem('zen_user_id');
    localStorage.removeItem('zen_user_profile'); // Also clear profile
    this.getUserId(); // Generate new guest ID
  },

  isGuest(): boolean {
    return this.getUserId().startsWith('guest_');
  },

  isEmailUser(): boolean {
    return this.getUserId().startsWith('email_');
  }
};
