import { DataService } from '../firebase';
import { User } from '../types';

export const userService = {
  /**
   * Loads all users from Firestore or LocalStorage cache fallback
   */
  async loadUsers(): Promise<User[]> {
    try {
      const dbUsers = await DataService.load('users');
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        const formattedUsers: User[] = dbUsers.map((u: any) => ({
          uid: u.uid || u.id,
          _firestoreDocId: u._firestoreDocId || u.id || u.uid,
          username: u.username,
          fullName: u.fullName,
          rank: u.rank,
          unit: u.unit,
          role: u.role || 'tro_ly_ky_thuat',
          isActive: typeof u.isActive === 'boolean' ? u.isActive : true,
          createdAt: u.createdAt || new Date().toISOString(),
          createdBy: u.createdBy || 'system',
          password: u.password || '123'
        }));

        // Sync cache to local_users
        localStorage.setItem('local_users', JSON.stringify(formattedUsers));

        // Synchronize current_user session if active
        const currentStored = localStorage.getItem('current_user');
        if (currentStored) {
          try {
            const cur = JSON.parse(currentStored);
            const updatedCur = formattedUsers.find(u => u.username === cur.username || u.uid === cur.uid);
            if (updatedCur) {
              localStorage.setItem('current_user', JSON.stringify(updatedCur));
            }
          } catch (err) {
            console.warn("Failed to synchronize current_user:", err);
          }
        }

        return formattedUsers;
      }
    } catch (err) {
      console.warn("Firestore getUsers failed, reading from localStorage cache:", err);
    }

    // Fallback read from cache
    return this.getCacheUsers();
  },

  /**
   * Gets cached users from LocalStorage without auto-seeding
   */
  getCacheUsers(): User[] {
    try {
      const stored = localStorage.getItem('local_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Saves or updates a user account
   */
  async saveUser(user: User): Promise<User> {
    if (user.username === 'admin' || user.uid === 'ADMIN-ID') {
      if (!user.isActive) {
        throw new Error("Không được phép vô hiệu hóa tài khoản quản trị hệ thống gốc (admin).");
      }
      if (user.username !== 'admin') {
        throw new Error("Không được phép thay đổi tên đăng nhập (username) của tài khoản quản trị hệ thống gốc (admin).");
      }
    }

    const dataToSave = {
      ...user,
      id: user.uid || user.username
    };

    // 1. Live Firestore save wrapper
    try {
      await DataService.save('users', dataToSave);
    } catch (err) {
      console.warn("Firestore save 'users' failed:", err);
    }

    // 2. Synchronous local cache sync
    const list = this.getCacheUsers();
    const existingIdx = list.findIndex(u => u.username === user.username);
    if (existingIdx >= 0) {
      list[existingIdx] = user;
    } else {
      list.push(user);
    }
    localStorage.setItem('local_users', JSON.stringify(list));

    // Also update current active session if it's the saved user
    const currentStored = localStorage.getItem('current_user');
    if (currentStored) {
      try {
        const cur = JSON.parse(currentStored);
        if (cur.username === user.username || cur.uid === user.uid) {
          localStorage.setItem('current_user', JSON.stringify(user));
        }
      } catch (err) {
        console.warn("Failed to update current_user in localStorage:", err);
      }
    }

    return user;
  },

  /**
   * Deletes a user by User object or identifier (uid / username)
   */
  async deleteUser(userObjOrIdentifier: User | string): Promise<void> {
    if (!userObjOrIdentifier) return;

    let targetUser: User | undefined;
    let identifier = '';

    if (typeof userObjOrIdentifier === 'string') {
      identifier = userObjOrIdentifier;
      const users = await this.loadUsers();
      targetUser = users.find(u => 
        u._firestoreDocId === identifier ||
        u.uid === identifier || 
        u.username === identifier || 
        (u.username && identifier && u.username.toLowerCase() === identifier.toLowerCase())
      );
    } else {
      targetUser = userObjOrIdentifier;
      identifier = targetUser._firestoreDocId || targetUser.uid || targetUser.username;
    }

    if (targetUser?.username === 'admin' || identifier === 'admin') {
      throw new Error("Không được phép xóa tài khoản quản trị hệ thống gốc (admin).");
    }

    const primaryDocId = targetUser?._firestoreDocId || targetUser?.uid || identifier;
    const uidDocId = targetUser?.uid;
    const usernameDocId = targetUser?.username;

    if (!primaryDocId) {
      throw new Error("Không xác định được Document ID của tài khoản.");
    }

    try {
      await DataService.delete('users', primaryDocId);
    } catch (err) {
      console.error("Firestore delete 'user' failed:", err);
      throw err;
    }

    // Secondary cleanup if uid or username differed from primaryDocId
    if (uidDocId && uidDocId !== primaryDocId) {
      await DataService.delete('users', uidDocId).catch(() => {});
    }
    if (usernameDocId && usernameDocId !== primaryDocId && usernameDocId !== uidDocId) {
      await DataService.delete('users', usernameDocId).catch(() => {});
    }

    const list = this.getCacheUsers();
    const filtered = list.filter(u => 
      u._firestoreDocId !== primaryDocId && 
      u.uid !== primaryDocId && 
      u.uid !== uidDocId && 
      u.username !== usernameDocId && 
      u.username !== identifier
    );
    localStorage.setItem('local_users', JSON.stringify(filtered));
  },

  /**
   * Performs user authentication
   */
  async authenticate(usernameInput: string, passwordInput: string): Promise<User> {
    const normalizedUsername = usernameInput.trim().toLowerCase();
    
    // Refresh user cache from both Firestore and LocalStorage
    const users = await this.loadUsers();
    const matchedUser = users.find(u => u.username.toLowerCase() === normalizedUsername);

    if (!matchedUser) {
      throw new Error("Tài khoản không tồn tại trên hệ thống");
    }

    // Check password (default is '123' if not specifically provided)
    const storedPassword = matchedUser.password || '123';
    if (storedPassword !== passwordInput) {
      throw new Error("Mật khẩu không chính xác");
    }

    // Check active status
    if (!matchedUser.isActive) {
      throw new Error("Tài khoản chưa được cấp quyền");
    }

    // Set active session in localStorage
    localStorage.setItem('current_user', JSON.stringify(matchedUser));
    return matchedUser;
  },

  /**
   * Retrieves active user session from LocalStorage
   */
  getCurrentUser(): User | null {
    const stored = localStorage.getItem('current_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Clears active session
   */
  logout(): void {
    localStorage.removeItem('current_user');
  }
};
