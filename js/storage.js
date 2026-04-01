class StorageManager {
    constructor() {
        this.storageKey = 'gameData';
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    loadData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    clearData() {
        localStorage.removeItem(this.storageKey);
    }

    updateData(newData) {
        const currentData = this.loadData();
        const updatedData = {...currentData, ...newData};
        this.saveData(updatedData);
    }
}

// Example usage:
const storageManager = new StorageManager();

// Save game data
storageManager.saveData({ level: 1, score: 100 });

// Load game data
const gameData = storageManager.loadData();
console.log(gameData);

// Update game data
storageManager.updateData({ score: 200 });

// Clear game data
// storageManager.clearData();
