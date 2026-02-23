/**
 * JWT ?좏겙??localStorage?????議고쉶/삭제?섎뒗 ?좏떥由ы떚
 */

const TOKEN_KEY = 'hanspoon_token';
const USER_KEY = 'hanspoon_user';

export const tokenStorage = {
    /**
     * ?좏겙 ???
     * @param {string} token - JWT ?좏겙
     */
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * ?좏겙 議고쉶
     * @returns {string|null} JWT ?좏겙 ?먮뒗 null
     */
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * ?좏겙 삭제 (濡쒓렇?꾩썐 ??
     */
    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * ?좏겙 議댁옱 ?щ? ?뺤씤
     * @returns {boolean}
     */
    hasToken: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    /**
     * ?ъ슜???뺣낫 ???
     * @param {Object} user - ?ъ슜??媛앹껜
     */
    setUser: (user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * ?ъ슜???뺣낫 議고쉶
     * @returns {Object|null}
     */
    getUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * ?ъ슜???뺣낫 삭제
     */
    removeUser: () => {
        localStorage.removeItem(USER_KEY);
    },

    /**
     * 愿由ъ옄 ?щ? ?뺤씤
     * @returns {boolean}
     */
    isAdmin: () => {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            // Backend returns role as string representation of list, e.g. "[ROLE_USER, ROLE_ADMIN]"
            return user.role && user.role.includes('ROLE_ADMIN');
        } catch {
            return false;
        }
    }
};

