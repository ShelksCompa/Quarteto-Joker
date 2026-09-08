// Storage Manager for Quarteto Joker SM
const storageManager = {
    // Save game data
    saveData: function(data) {
        localStorage.setItem('quartetoGameData', JSON.stringify(data));
    },

    // Load game data
    loadData: function() {
        const data = localStorage.getItem('quartetoGameData');
        return data ? JSON.parse(data) : null;
    },

    // Clear all data
    clearData: function() {
        localStorage.removeItem('quartetoGameData');
        localStorage.removeItem('quartetoCurrentUser');
        localStorage.removeItem('quartetoUsers');
    },

    // Save current user
    setCurrentUser: function(email) {
        localStorage.setItem('quartetoCurrentUser', email);
    },

    // Get current user
    getCurrentUser: function() {
        return localStorage.getItem('quartetoCurrentUser');
    },

    // Logout
    logout: function() {
        localStorage.removeItem('quartetoCurrentUser');
    }
};

// Account Management System
const accountManager = {
    // Initialize with admin account
    init: function() {
        const users = this.getUsers();
        if (!users || users.length === 0) {
            this.createUser({
                email: 'antoni.barbozavvs@gmail.com',
                password: '@Shelks0078',
                isAdmin: true,
                createdAt: new Date().toISOString(),
                profile: {
                    username: 'Administrador',
                    avatar: '👨‍💼',
                    level: 1,
                    score: 0,
                    gamesPlayed: 0,
                    gamesWon: 0
                }
            });
        }
    },

    // Get all users
    getUsers: function() {
        const users = localStorage.getItem('quartetoUsers');
        return users ? JSON.parse(users) : [];
    },

    // Save users
    saveUsers: function(users) {
        localStorage.setItem('quartetoUsers', JSON.stringify(users));
    },

    // Create new user
    createUser: function(userData) {
        const users = this.getUsers();
        users.push(userData);
        this.saveUsers(users);
        return userData;
    },

    // Find user by email
    findUser: function(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    },

    // Login user
    login: function(email, password) {
        const user = this.findUser(email);
        if (user && user.password === password) {
            storageManager.setCurrentUser(email);
            return { success: true, user: user };
        }
        return { success: false, message: 'Email ou senha inválidos' };
    },

    // Update user profile
    updateProfile: function(email, profileData) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].profile = { ...users[userIndex].profile, ...profileData };
            this.saveUsers(users);
            return true;
        }
        return false;
    },

    // Get current logged in user
    getCurrentLoggedUser: function() {
        const email = storageManager.getCurrentUser();
        if (!email) return null;
        return this.findUser(email);
    },

    // Clear all accounts
    clearAllAccounts: function() {
        localStorage.removeItem('quartetoUsers');
        localStorage.removeItem('quartetoCurrentUser');
        this.init(); // Reinitialize with admin account
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    accountManager.init();
});