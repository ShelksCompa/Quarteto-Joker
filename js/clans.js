// Clan Management System

const clanManager = {
    // Get all clans
    getClans: function() {
        const clans = localStorage.getItem('quartetsClans');
        return clans ? JSON.parse(clans) : [];
    },

    // Save clans
    saveClans: function(clans) {
        localStorage.setItem('quartetsClans', JSON.stringify(clans));
    },

    // Create new clan
    createClan: function(clanData) {
        const clans = this.getClans();
        const newClan = {
            id: Date.now(),
            name: clanData.name,
            tag: clanData.tag,
            description: clanData.description,
            leader: clanData.leaderId,
            members: [clanData.leaderId],
            memberCount: 1,
            level: 1,
            score: 0,
            wins: 0,
            losses: 0,
            createdAt: new Date().toISOString(),
            avatar: '🏰'
        };
        clans.push(newClan);
        this.saveClans(clans);
        return newClan;
    },

    // Get clan by ID
    getClanById: function(clanId) {
        const clans = this.getClans();
        return clans.find(c => c.id === clanId);
    },

    // Get user's clan
    getUserClan: function(userId) {
        const clans = this.getClans();
        return clans.find(c => c.members.includes(userId));
    },

    // Add member to clan
    addMember: function(clanId, userId) {
        const clans = this.getClans();
        const clanIndex = clans.findIndex(c => c.id === clanId);
        if (clanIndex !== -1 && !clans[clanIndex].members.includes(userId)) {
            clans[clanIndex].members.push(userId);
            clans[clanIndex].memberCount = clans[clanIndex].members.length;
            this.saveClans(clans);
            return true;
        }
        return false;
    },

    // Remove member from clan
    removeMember: function(clanId, userId) {
        const clans = this.getClans();
        const clanIndex = clans.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            clans[clanIndex].members = clans[clanIndex].members.filter(m => m !== userId);
            clans[clanIndex].memberCount = clans[clanIndex].members.length;
            this.saveClans(clans);
            return true;
        }
        return false;
    },

    // Update clan stats
    updateClanStats: function(clanId, stats) {
        const clans = this.getClans();
        const clanIndex = clans.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            clans[clanIndex] = { ...clans[clanIndex], ...stats };
            this.saveClans(clans);
            return true;
        }
        return false;
    },

    // Get clan ranking
    getClanRanking: function() {
        const clans = this.getClans();
        return clans.sort((a, b) => {
            const aScore = b.score - a.score;
            if (aScore !== 0) return aScore;
            return b.wins - a.wins;
        });
    }
};

// Challenge Management System

const challengeManager = {
    // Get all challenges
    getChallenges: function() {
        const challenges = localStorage.getItem('quartetssChallenges');
        return challenges ? JSON.parse(challenges) : [];
    },

    // Save challenges
    saveChallenges: function(challenges) {
        localStorage.setItem('quartetssChallenges', JSON.stringify(challenges));
    },

    // Create new challenge
    issueChallenge: function(challengeData) {
        const challenges = this.getChallenges();
        const newChallenge = {
            id: Date.now(),
            fromClan: challengeData.fromClanId,
            toClan: challengeData.toClanId,
            type: challengeData.type, // 1v1, 3v3, 5v5
            prize: challengeData.prize,
            status: 'pending', // pending, accepted, rejected, in_progress, completed
            createdAt: new Date().toISOString(),
            acceptedAt: null,
            completedAt: null,
            winner: null,
            fromClanScore: 0,
            toClanScore: 0
        };
        challenges.push(newChallenge);
        this.saveChallenges(challenges);
        return newChallenge;
    },

    // Get challenges by clan
    getClanChallenges: function(clanId) {
        const challenges = this.getChallenges();
        return challenges.filter(c => c.fromClan === clanId || c.toClan === clanId);
    },

    // Accept challenge
    acceptChallenge: function(challengeId) {
        const challenges = this.getChallenges();
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        if (challengeIndex !== -1) {
            challenges[challengeIndex].status = 'accepted';
            challenges[challengeIndex].acceptedAt = new Date().toISOString();
            this.saveChallenges(challenges);
            return true;
        }
        return false;
    },

    // Reject challenge
    rejectChallenge: function(challengeId) {
        const challenges = this.getChallenges();
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        if (challengeIndex !== -1) {
            challenges[challengeIndex].status = 'rejected';
            this.saveChallenges(challenges);
            return true;
        }
        return false;
    },

    // Complete challenge
    completeChallenge: function(challengeId, winner) {
        const challenges = this.getChallenges();
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        if (challengeIndex !== -1) {
            challenges[challengeIndex].status = 'completed';
            challenges[challengeIndex].winner = winner;
            challenges[challengeIndex].completedAt = new Date().toISOString();
            this.saveChallenges(challenges);
            return true;
        }
        return false;
    },

    // Get challenge by ID
    getChallengeById: function(challengeId) {
        const challenges = this.getChallenges();
        return challenges.find(c => c.id === challengeId);
    }
};
