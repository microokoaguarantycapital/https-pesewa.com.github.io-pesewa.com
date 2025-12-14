'use strict';

/**
 * Pesewa.com Main Application
 * Revolutionary Peer-to-Peer Emergency Micro-Lending Platform
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForDevelopmentReplaceInProduction",
    authDomain: "pesewa-dev.firebaseapp.com",
    projectId: "pesewa-dev",
    storageBucket: "pesewa-dev.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const realtimeDb = firebase.database();

// Application State
const AppState = {
    currentUser: null,
    userData: null,
    activePage: 'home',
    countries: [
        { code: 'KE', name: 'Kenya', currency: 'KSh', phone: '+254 709 219 000' },
        { code: 'UG', name: 'Uganda', currency: 'UGX', phone: '+256 392 175 546' },
        { code: 'TZ', name: 'Tanzania', currency: 'TZS', phone: '+255 659 073 010' },
        { code: 'RW', name: 'Rwanda', currency: 'RWF', phone: '+250 791 590 801' },
        { code: 'CD', name: 'Congo', currency: 'CDF/USD', phone: '+243 81 000 0000' },
        { code: 'BI', name: 'Burundi', currency: 'BIF', phone: '+257 79 000 000' },
        { code: 'NG', name: 'Nigeria', currency: 'NGN', phone: '+234 800 000 0000' },
        { code: 'GH', name: 'Ghana', currency: 'GHS', phone: '+233 24 000 0000' },
        { code: 'ZA', name: 'South Africa', currency: 'ZAR', phone: '+27 11 000 0000' },
        { code: 'ET', name: 'Ethiopia', currency: 'ETB', phone: '+251 91 000 000' },
        { code: 'SO', name: 'Somalia', currency: 'SOS', phone: '+252 63 0000000' }
    ],
    categories: [
        {
            id: 'fare',
            name: 'PesewaFare',
            icon: 'fas fa-bus',
            tagline: 'Move on, don\'t stall—borrow for your journey.',
            color: '#FFC600',
            maxAmount: 20000
        },
        {
            id: 'data',
            name: 'PesewaData',
            icon: 'fas fa-wifi',
            tagline: 'Stay connected, stay informed—borrow when your bundle runs out.',
            color: '#17A2B8',
            maxAmount: 5000
        },
        {
            id: 'cooking-gas',
            name: 'PesewaCookingGas',
            icon: 'fas fa-fire',
            tagline: 'Cook with confidence—borrow when your gas is low.',
            color: '#FD7E14',
            maxAmount: 10000
        },
        {
            id: 'food',
            name: 'PesewaFood',
            icon: 'fas fa-utensils',
            tagline: 'Don\'t sleep hungry when paycheck is delayed—borrow and eat today.',
            color: '#28A745',
            maxAmount: 8000
        },
        {
            id: 'credo',
            name: 'Pesewacredo',
            icon: 'fas fa-tools',
            tagline: 'Fix it fast—borrow for urgent repairs or tools.',
            color: '#6C757D',
            maxAmount: 15000
        },
        {
            id: 'water',
            name: 'PesewaWaterBill',
            icon: 'fas fa-tint',
            tagline: 'Stay hydrated—borrow for water needs or bills.',
            color: '#1E90FF',
            maxAmount: 7000
        },
        {
            id: 'fuel',
            name: 'PesewaBikeCarTuktukFuel',
            icon: 'fas fa-gas-pump',
            tagline: 'Keep moving—borrow for fuel, no matter your ride.',
            color: '#DC3545',
            maxAmount: 12000
        },
        {
            id: 'repair',
            name: 'PesewaBikeCarTuktukRepair',
            icon: 'fas fa-car-crash',
            tagline: 'Fix it quick—borrow for minor repairs and keep going.',
            color: '#FF6B6B',
            maxAmount: 18000
        },
        {
            id: 'medicine',
            name: 'PesewaMedicine',
            icon: 'fas fa-first-aid',
            tagline: 'Health first—borrow for urgent medicines.',
            color: '#20C997',
            maxAmount: 10000
        },
        {
            id: 'electricity',
            name: 'PesewaElectricityTokens',
            icon: 'fas fa-bolt',
            tagline: 'Stay lit, stay powered—borrow tokens when you need it.',
            color: '#FFC107',
            maxAmount: 15000
        }
    ],
    tiers: {
        basic: {
            name: 'Basic',
            weeklyLimit: 1500,
            borrowerSubscription: 0,
            lenderSubscription: {
                monthly: 50,
                biAnnual: 250,
                annual: 500
            },
            crbCheck: false,
            color: '#28A745'
        },
        premium: {
            name: 'Premium',
            weeklyLimit: 5000,
            borrowerSubscription: 500,
            lenderSubscription: {
                monthly: 250,
                biAnnual: 1500,
                annual: 2500
            },
            crbCheck: false,
            color: '#FD7E14'
        },
        super: {
            name: 'Super',
            weeklyLimit: 20000,
            borrowerSubscription: 1000,
            lenderSubscription: {
                monthly: 1000,
                biAnnual: 5000,
                annual: 8500
            },
            crbCheck: true,
            color: '#DC3545'
        }
    }
};

// DOM Elements
const elements = {
    // Navigation
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userMenu: document.getElementById('userMenu'),
    userAvatar: document.getElementById('userAvatar'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    
    // Calculator
    tierSelect: document.getElementById('tierSelect'),
    loanAmount: document.getElementById('loanAmount'),
    amountRange: document.getElementById('amountRange'),
    loanDuration: document.getElementById('loanDuration'),
    principalAmount: document.getElementById('principalAmount'),
    interestAmount: document.getElementById('interestAmount'),
    totalRepayment: document.getElementById('totalRepayment'),
    dailyPayment: document.getElementById('dailyPayment'),
    
    // Hero Actions
    heroBorrowBtn: document.getElementById('heroBorrowBtn'),
    heroLendBtn: document.getElementById('heroLendBtn'),
    
    // Containers
    categoryGrid: document.getElementById('categoryGrid'),
    floatingCards: document.getElementById('floatingCards'),
    pageContainer: document.getElementById('pageContainer'),
    
    // Country Selector
    countrySelect: document.getElementById('countrySelect'),
    
    // Stats
    activeLoans: document.getElementById('activeLoans'),
    totalLenders: document.getElementById('totalLenders'),
    successRate: document.getElementById('successRate')
};

/**
 * Utility Functions
 */
class Utils {
    static formatCurrency(amount, currency = 'KSh') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'USD' ? 'USD' : 'XXX',
            currencyDisplay: 'code',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace('XXX', currency);
    }
    
    static calculateLoan(amount, durationDays = 7) {
        const interestRate = 0.10; // 10% per week
        const weeks = durationDays / 7;
        const interest = amount * interestRate * weeks;
        const total = amount + interest;
        const daily = total / durationDays;
        
        return {
            principal: amount,
            interest,
            total,
            daily,
            weeks
        };
    }
    
    static validatePhone(phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }
    
    static validateEmail(email) {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF6B6B';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        // Remove any existing error
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        element.parentNode.appendChild(errorDiv);
        element.style.borderColor = '#FF6B6B';
    }
    
    static clearError(element) {
        const error = element.parentNode.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        element.style.borderColor = '#FFC600';
    }
    
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '8px';
        notification.style.color = '#FFFFFF';
        notification.style.zIndex = '3000';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.animation = 'slideIn 0.3s ease';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#20C997';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#DC3545';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#FD7E14';
        } else {
            notification.style.backgroundColor = '#17A2B8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('on')) {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
}

/**
 * Authentication Service
 */
class AuthService {
    static async register(userData) {
        try {
            // Validate inputs
            if (!userData.name || !userData.phone || !userData.country || !userData.role || !userData.tier) {
                throw new Error('All required fields must be filled');
            }
            
            if (!Utils.validatePhone(userData.phone)) {
                throw new Error('Invalid phone number format');
            }
            
            if (userData.email && !Utils.validateEmail(userData.email)) {
                throw new Error('Invalid email format');
            }
            
            // Create user with email/password (using phone as fallback)
            const email = userData.email || `${userData.phone.replace('+', '')}@pesewa.com`;
            const userCredential = await auth.createUserWithEmailAndPassword(
                email,
                userData.password
            );
            
            // Create user document in Firestore
            const userDoc = {
                uid: userCredential.user.uid,
                name: userData.name,
                email: userData.email || '',
                phone: userData.phone,
                country: userData.country,
                role: userData.role,
                tier: userData.tier,
                referrers: [
                    { name: userData.ref1Name, phone: userData.ref1Phone },
                    { name: userData.ref2Name, phone: userData.ref2Phone }
                ],
                groups: [],
                blacklisted: false,
                rating: 5.0,
                totalLoans: 0,
                totalLent: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc(userCredential.user.uid).set(userDoc);
            
            // Update app state
            AppState.currentUser = userCredential.user;
            AppState.userData = userDoc;
            
            Utils.showNotification('Registration successful!', 'success');
            
            // Redirect to dashboard
            window.location.hash = '#dashboard';
            
            return userCredential.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    
    static async login(emailOrPhone, password) {
        try {
            let email = emailOrPhone;
            
            // Check if input is phone number
            if (Utils.validatePhone(emailOrPhone)) {
                // Try to find user by phone
                const usersSnapshot = await db.collection('users')
                    .where('phone', '==', emailOrPhone)
                    .limit(1)
                    .get();
                
                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0].data();
                    email = userDoc.email || `${emailOrPhone.replace('+', '')}@pesewa.com`;
                }
            }
            
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            
            if (userDoc.exists) {
                AppState.currentUser = userCredential.user;
                AppState.userData = userDoc.data();
                
                Utils.showNotification('Login successful!', 'success');
                
                // Redirect to dashboard
                window.location.hash = '#dashboard';
            }
            
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    static async logout() {
        try {
            await auth.signOut();
            AppState.currentUser = null;
            AppState.userData = null;
            
            Utils.showNotification('Logged out successfully', 'info');
            
            // Redirect to home
            window.location.hash = '#home';
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
    
    static async sendOTP(phoneNumber) {
        // Mock OTP sending for development
        return new Promise((resolve) => {
            setTimeout(() => {
                Utils.showNotification(`OTP sent to ${phoneNumber} (Mock)`, 'info');
                resolve(true);
            }, 1000);
        });
    }
}

/**
 * Loan Service
 */
class LoanService {
    static async requestLoan(loanData) {
        try {
            if (!AppState.currentUser) {
                throw new Error('You must be logged in to request a loan');
            }
            
            const validation = this.validateLoanRequest(loanData);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            const loanDoc = {
                uid: AppState.currentUser.uid,
                borrowerId: AppState.currentUser.uid,
                borrowerName: AppState.userData.name,
                lenderId: loanData.lenderId,
                category: loanData.category,
                amount: loanData.amount,
                currency: AppState.userData.country ? 
                    AppState.countries.find(c => c.name === AppState.userData.country)?.currency || 'KSh' : 'KSh',
                interestRate: 0.10,
                durationDays: loanData.durationDays || 7,
                status: 'pending',
                disbursed: false,
                repaid: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                dueDate: new Date(Date.now() + (loanData.durationDays || 7) * 24 * 60 * 60 * 1000)
            };
            
            const result = await db.collection('loans').add(loanDoc);
            
            // Update user's total loans
            await db.collection('users').doc(AppState.currentUser.uid).update({
                totalLoans: firebase.firestore.FieldValue.increment(loanData.amount),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Send notification to lender
            await this.notifyLender(loanData.lenderId, loanDoc);
            
            Utils.showNotification('Loan request submitted successfully!', 'success');
            
            return result.id;
        } catch (error) {
            console.error('Loan request error:', error);
            throw error;
        }
    }
    
    static validateLoanRequest(loanData) {
        const userTier = AppState.userData?.tier || 'basic';
        const tierLimit = AppState.tiers[userTier]?.weeklyLimit || 1500;
        
        if (!loanData.amount || loanData.amount < 5) {
            return { valid: false, message: 'Minimum loan amount is 5 units' };
        }
        
        if (loanData.amount > tierLimit) {
            return { valid: false, message: `Amount exceeds ${userTier} tier limit of ${tierLimit}` };
        }
        
        if (!loanData.category) {
            return { valid: false, message: 'Please select a category' };
        }
        
        if (!loanData.lenderId) {
            return { valid: false, message: 'Please select a lender' };
        }
        
        return { valid: true, message: 'Loan request is valid' };
    }
    
    static async notifyLender(lenderId, loanData) {
        // In production, this would send push notification/email/SMS
        console.log('Notifying lender:', lenderId, loanData);
        
        // For now, create a notification document
        await db.collection('notifications').add({
            userId: lenderId,
            type: 'loan_request',
            title: 'New Loan Request',
            message: `${loanData.borrowerName} has requested a loan of ${loanData.amount} for ${loanData.category}`,
            data: { loanId: loanData.id },
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    static async updateRepayment(loanId, amount) {
        try {
            const loanRef = db.collection('loans').doc(loanId);
            const loanDoc = await loanRef.get();
            
            if (!loanDoc.exists) {
                throw new Error('Loan not found');
            }
            
            const loanData = loanDoc.data();
            const remaining = loanData.amount - (loanData.repaidAmount || 0);
            
            if (amount > remaining) {
                throw new Error(`Amount exceeds remaining balance of ${remaining}`);
            }
            
            const newRepaidAmount = (loanData.repaidAmount || 0) + amount;
            const fullyRepaid = newRepaidAmount >= loanData.amount;
            
            await loanRef.update({
                repaidAmount: newRepaidAmount,
                repaid: fullyRepaid,
                status: fullyRepaid ? 'repaid' : 'partially_repaid',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Record repayment in ledger
            await db.collection('ledgers').add({
                loanId,
                borrowerId: loanData.borrowerId,
                lenderId: loanData.lenderId,
                amount,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'repayment'
            });
            
            if (fullyRepaid) {
                // Update borrower rating
                await this.updateBorrowerRating(loanData.borrowerId, 1); // Positive rating for repayment
            }
            
            Utils.showNotification('Repayment recorded successfully!', 'success');
            
            return true;
        } catch (error) {
            console.error('Repayment update error:', error);
            throw error;
        }
    }
    
    static async updateBorrowerRating(borrowerId, ratingChange) {
        const userRef = db.collection('users').doc(borrowerId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const currentRating = userDoc.data().rating || 5.0;
            const newRating = Math.min(5.0, Math.max(1.0, currentRating + ratingChange * 0.1));
            
            await userRef.update({
                rating: newRating,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

/**
 * Group Service
 */
class GroupService {
    static async createGroup(groupData) {
        try {
            if (!AppState.currentUser) {
                throw new Error('You must be logged in to create a group');
            }
            
            // Check if user has reached group limit
            const userGroups = AppState.userData?.groups || [];
            if (userGroups.length >= 4) {
                throw new Error('Maximum of 4 groups per user reached');
            }
            
            const groupDoc = {
                name: groupData.name,
                description: groupData.description,
                creatorId: AppState.currentUser.uid,
                creatorName: AppState.userData.name,
                members: [{
                    userId: AppState.currentUser.uid,
                    name: AppState.userData.name,
                    role: 'admin',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                }],
                maxMembers: 1000,
                isPrivate: true,
                referralRequired: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const result = await db.collection('groups').add(groupDoc);
            
            // Add group to user's groups
            await db.collection('users').doc(AppState.currentUser.uid).update({
                groups: firebase.firestore.FieldValue.arrayUnion(result.id),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update app state
            if (AppState.userData) {
                AppState.userData.groups = [...userGroups, result.id];
            }
            
            Utils.showNotification('Group created successfully!', 'success');
            
            return result.id;
        } catch (error) {
            console.error('Group creation error:', error);
            throw error;
        }
    }
    
    static async joinGroup(groupId, referrerId) {
        try {
            if (!AppState.currentUser) {
                throw new Error('You must be logged in to join a group');
            }
            
            // Check if user has reached group limit
            const userGroups = AppState.userData?.groups || [];
            if (userGroups.length >= 4) {
                throw new Error('Maximum of 4 groups per user reached');
            }
            
            // Check if user is already in group
            if (userGroups.includes(groupId)) {
                throw new Error('You are already a member of this group');
            }
            
            const groupRef = db.collection('groups').doc(groupId);
            const groupDoc = await groupRef.get();
            
            if (!groupDoc.exists) {
                throw new Error('Group not found');
            }
            
            const groupData = groupDoc.data();
            
            // Check if group is full
            if (groupData.members.length >= groupData.maxMembers) {
                throw new Error('Group is full');
            }
            
            // Check if user has good repayment record (in production)
            const hasGoodRecord = await this.checkRepaymentRecord();
            if (!hasGoodRecord) {
                throw new Error('Cannot join: Poor repayment record');
            }
            
            // Add user to group members
            await groupRef.update({
                members: firebase.firestore.FieldValue.arrayUnion({
                    userId: AppState.currentUser.uid,
                    name: AppState.userData.name,
                    role: 'member',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                }),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Add group to user's groups
            await db.collection('users').doc(AppState.currentUser.uid).update({
                groups: firebase.firestore.FieldValue.arrayUnion(groupId),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update app state
            if (AppState.userData) {
                AppState.userData.groups = [...userGroups, groupId];
            }
            
            Utils.showNotification('Successfully joined group!', 'success');
            
            return true;
        } catch (error) {
            console.error('Join group error:', error);
            throw error;
        }
    }
    
    static async checkRepaymentRecord() {
        // In production, this would check the user's repayment history
        // For now, return true for demonstration
        return true;
    }
}

/**
 * UI Components
 */
class UIComponents {
    static renderCategoryCards() {
        if (!elements.categoryGrid) return;
        
        elements.categoryGrid.innerHTML = '';
        
        AppState.categories.forEach(category => {
            const card = Utils.createElement('div', {
                className: 'category-card',
                onclick: () => this.handleCategoryClick(category.id)
            }, [
                Utils.createElement('div', {
                    className: 'category-icon',
                    style: `background-color: ${category.color};`
                }, [
                    Utils.createElement('i', { className: category.icon })
                ]),
                Utils.createElement('h3', { className: 'category-title' }, [category.name]),
                Utils.createElement('p', { className: 'category-tagline' }, [category.tagline]),
                Utils.createElement('div', { className: 'category-limits' }, [
                    `Up to ${Utils.formatCurrency(category.maxAmount)}`
                ])
            ]);
            
            elements.categoryGrid.appendChild(card);
        });
    }
    
    static renderFloatingCards() {
        if (!elements.floatingCards) return;
        
        elements.floatingCards.innerHTML = '';
        
        // Position cards in a circle
        const radius = 150;
        const centerX = 250;
        const centerY = 250;
        const totalCards = AppState.categories.length;
        
        AppState.categories.forEach((category, index) => {
            const angle = (index / totalCards) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            const card = Utils.createElement('div', {
                className: 'floating-card',
                style: `left: ${x}px; top: ${y}px; animation-delay: ${index * 0.2}s;`,
                onclick: () => this.handleCategoryClick(category.id)
            }, [
                Utils.createElement('i', { className: category.icon }),
                Utils.createElement('h4', {}, [category.name]),
                Utils.createElement('p', { style: 'font-size: 0.8rem; opacity: 0.8;' }, [
                    category.tagline.split('—')[0]
                ])
            ]);
            
            elements.floatingCards.appendChild(card);
        });
    }
    
    static handleCategoryClick(categoryId) {
        if (!AppState.currentUser) {
            Utils.showNotification('Please login to borrow', 'warning');
            elements.loginBtn.click();
            return;
        }
        
        window.location.hash = `#borrow?category=${categoryId}`;
    }
    
    static updateCalculator() {
        if (!elements.loanAmount || !elements.principalAmount) return;
        
        const amount = parseFloat(elements.loanAmount.value) || 0;
        const duration = parseInt(elements.loanDuration.value) || 7;
        const tier = elements.tierSelect.value;
        
        // Validate against tier limit
        const tierLimit = AppState.tiers[tier]?.weeklyLimit || 1500;
        if (amount > tierLimit) {
            elements.loanAmount.value = tierLimit;
            Utils.showNotification(`Amount adjusted to tier limit: ${tierLimit}`, 'warning');
        }
        
        // Update range slider
        if (elements.amountRange) {
            elements.amountRange.value = amount;
        }
        
        const calculation = Utils.calculateLoan(amount, duration);
        
        elements.principalAmount.textContent = Utils.formatCurrency(calculation.principal);
        elements.interestAmount.textContent = Utils.formatCurrency(calculation.interest);
        elements.totalRepayment.textContent = Utils.formatCurrency(calculation.total);
        elements.dailyPayment.textContent = Utils.formatCurrency(calculation.daily);
    }
    
    static updateUserInterface() {
        const isLoggedIn = !!AppState.currentUser;
        
        // Update auth buttons visibility
        if (elements.loginBtn && elements.registerBtn && elements.userMenu) {
            if (isLoggedIn) {
                elements.loginBtn.classList.add('hidden');
                elements.registerBtn.classList.add('hidden');
                elements.userMenu.classList.remove('hidden');
                
                // Update avatar with user initial
                if (AppState.userData?.name) {
                    elements.userAvatar.textContent = AppState.userData.name.charAt(0).toUpperCase();
                }
            } else {
                elements.loginBtn.classList.remove('hidden');
                elements.registerBtn.classList.remove('hidden');
                elements.userMenu.classList.add('hidden');
            }
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === 'dashboard' && !isLoggedIn) {
                link.style.display = 'none';
            } else if (link.dataset.page === 'dashboard' && isLoggedIn) {
                link.style.display = 'block';
            }
        });
    }
    
    static loadPage(page) {
        if (!elements.pageContainer) return;
        
        AppState.activePage = page;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        
        // Hide page container for home page
        if (page === 'home') {
            elements.pageContainer.classList.add('hidden');
            document.querySelector('.hero')?.classList.remove('hidden');
            document.querySelector('.categories')?.classList.remove('hidden');
            document.querySelector('.how-it-works')?.classList.remove('hidden');
            document.querySelector('.calculator')?.classList.remove('hidden');
            document.querySelector('.comparison')?.classList.remove('hidden');
            return;
        } else {
            elements.pageContainer.classList.remove('hidden');
            document.querySelector('.hero')?.classList.add('hidden');
            document.querySelector('.categories')?.classList.add('hidden');
            document.querySelector('.how-it-works')?.classList.add('hidden');
            document.querySelector('.calculator')?.classList.add('hidden');
            document.querySelector('.comparison')?.classList.add('hidden');
        }
        
        // Load page content
        fetch(`pages/${page}.html`)
            .then(response => {
                if (!response.ok) throw new Error('Page not found');
                return response.text();
            })
            .then(html => {
                elements.pageContainer.innerHTML = html;
                this.initializePage(page);
            })
            .catch(error => {
                console.error('Error loading page:', error);
                elements.pageContainer.innerHTML = `
                    <div class="error-page">
                        <h2>Page Not Found</h2>
                        <p>The requested page could not be loaded.</p>
                        <button onclick="window.location.hash = '#home'" class="btn btn-primary">
                            Return Home
                        </button>
                    </div>
                `;
            });
    }
    
    static initializePage(page) {
        switch(page) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'groups':
                this.initializeGroups();
                break;
            case 'lending':
                this.initializeLending();
                break;
            case 'borrowing':
                this.initializeBorrowing();
                break;
            case 'ledger':
                this.initializeLedger();
                break;
            case 'blacklist':
                this.initializeBlacklist();
                break;
            case 'debt-collectors':
                this.initializeDebtCollectors();
                break;
            case 'profile':
                this.initializeProfile();
                break;
        }
    }
    
    static initializeDashboard() {
        // Update user info
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement && AppState.userData) {
            userInfoElement.innerHTML = `
                <h2>Welcome, ${AppState.userData.name}!</h2>
                <p>${AppState.userData.role === 'both' ? 'Borrower & Lender' : AppState.userData.role}</p>
                <p>Tier: <span class="badge">${AppState.userData.tier}</span></p>
                <p>Rating: ${'★'.repeat(Math.floor(AppState.userData.rating || 5))} ${(AppState.userData.rating || 5).toFixed(1)}</p>
            `;
        }
        
        // Initialize dashboard calculator
        const dashCalculator = document.getElementById('dashboardCalculator');
        if (dashCalculator) {
            dashCalculator.innerHTML = `
                <div class="dashboard-calculator">
                    <h3>Quick Loan Calculator</h3>
                    <div class="input-group">
                        <input type="number" id="dashAmount" placeholder="Amount" value="1000">
                        <select id="dashDuration">
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="7" selected>7 Days</option>
                        </select>
                        <button onclick="UIComponents.calculateQuickLoan()" class="btn btn-primary">
                            Calculate
                        </button>
                    </div>
                    <div id="dashResult" class="calculator-results"></div>
                </div>
            `;
        }
        
        // Load user's active loans
        this.loadActiveLoans();
    }
    
    static async loadActiveLoans() {
        if (!AppState.currentUser) return;
        
        try {
            const loansSnapshot = await db.collection('loans')
                .where('borrowerId', '==', AppState.currentUser.uid)
                .where('status', 'in', ['pending', 'approved', 'disbursed', 'partially_repaid'])
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            
            const loansList = document.getElementById('activeLoansList');
            if (loansList) {
                if (loansSnapshot.empty) {
                    loansList.innerHTML = '<p>No active loans</p>';
                    return;
                }
                
                let html = '<h3>Active Loans</h3><div class="loans-grid">';
                
                loansSnapshot.forEach(doc => {
                    const loan = doc.data();
                    const dueDate = loan.dueDate?.toDate() || new Date();
                    const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
                    
                    html += `
                        <div class="loan-card">
                            <h4>${loan.category}</h4>
                            <p>Amount: ${Utils.formatCurrency(loan.amount, loan.currency)}</p>
                            <p>Due: ${daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}</p>
                            <p>Status: <span class="badge">${loan.status}</span></p>
                            ${loan.status !== 'repaid' ? 
                                `<button onclick="UIComponents.showRepaymentModal('${doc.id}')" class="btn btn-primary btn-sm">
                                    Repay
                                </button>` : ''}
                        </div>
                    `;
                });
                
                html += '</div>';
                loansList.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading active loans:', error);
        }
    }
    
    static calculateQuickLoan() {
        const amount = parseFloat(document.getElementById('dashAmount')?.value) || 0;
        const duration = parseInt(document.getElementById('dashDuration')?.value) || 7;
        const result = Utils.calculateLoan(amount, duration);
        
        const resultElement = document.getElementById('dashResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="result-card">
                    <h4>Total Repayment</h4>
                    <p>${Utils.formatCurrency(result.total)}</p>
                </div>
                <div class="result-card">
                    <h4>Daily Payment</h4>
                    <p>${Utils.formatCurrency(result.daily)}</p>
                </div>
            `;
        }
    }
    
    static showRepaymentModal(loanId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Make Repayment</h3>
                <div class="form-group">
                    <label for="repaymentAmount">Amount</label>
                    <input type="number" id="repaymentAmount" placeholder="Enter amount">
                </div>
                <button onclick="UIComponents.submitRepayment('${loanId}')" class="btn btn-primary">
                    Submit Repayment
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    static async submitRepayment(loanId) {
        const amountInput = document.getElementById('repaymentAmount');
        const amount = parseFloat(amountInput?.value);
        
        if (!amount || amount <= 0) {
            Utils.showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        try {
            await LoanService.updateRepayment(loanId, amount);
            
            // Close modal
            const modal = document.querySelector('.modal');
            if (modal) modal.remove();
            
            // Refresh loans list
            this.loadActiveLoans();
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        }
    }
}

/**
 * Event Listeners
 */
class EventListeners {
    static initialize() {
        // Auth buttons
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        }
        
        if (elements.registerBtn) {
            elements.registerBtn.addEventListener('click', () => this.showModal('registerModal'));
        }
        
        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', () => AuthService.logout());
        }
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
        
        // Forms
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', this.handleLoginSubmit);
        }
        
        if (elements.registerForm) {
            elements.registerForm.addEventListener('submit', this.handleRegisterSubmit);
        }
        
        // Calculator
        if (elements.loanAmount) {
            elements.loanAmount.addEventListener('input', () => UIComponents.updateCalculator());
        }
        
        if (elements.amountRange) {
            elements.amountRange.addEventListener('input', () => {
                elements.loanAmount.value = elements.amountRange.value;
                UIComponents.updateCalculator();
            });
        }
        
        if (elements.loanDuration) {
            elements.loanDuration.addEventListener('change', () => UIComponents.updateCalculator());
        }
        
        if (elements.tierSelect) {
            elements.tierSelect.addEventListener('change', () => {
                const tier = elements.tierSelect.value;
                const limit = AppState.tiers[tier]?.weeklyLimit || 1500;
                elements.loanAmount.max = limit;
                elements.amountRange.max = limit;
                UIComponents.updateCalculator();
            });
        }
        
        // Hero actions
        if (elements.heroBorrowBtn) {
            elements.heroBorrowBtn.addEventListener('click', () => {
                if (!AppState.currentUser) {
                    this.showModal('loginModal');
                } else {
                    window.location.hash = '#borrow';
                }
            });
        }
        
        if (elements.heroLendBtn) {
            elements.heroLendBtn.addEventListener('click', () => {
                if (!AppState.currentUser) {
                    this.showModal('registerModal');
                } else {
                    window.location.hash = '#lending';
                }
            });
        }
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    window.location.hash = `#${page}`;
                }
            });
        });
        
        // Apply now button
        const applyNowBtn = document.getElementById('applyNowBtn');
        if (applyNowBtn) {
            applyNowBtn.addEventListener('click', () => {
                if (!AppState.currentUser) {
                    this.showModal('loginModal');
                } else {
                    window.location.hash = '#borrow';
                }
            });
        }
        
        // OTP login button
        const otpLoginBtn = document.getElementById('otpLoginBtn');
        if (otpLoginBtn) {
            otpLoginBtn.addEventListener('click', () => {
                const phone = prompt('Enter your phone number:');
                if (phone && Utils.validatePhone(phone)) {
                    AuthService.sendOTP(phone);
                } else {
                    Utils.showNotification('Invalid phone number', 'error');
                }
            });
        }
        
        // Menu toggle for mobile
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.nav-menu').classList.toggle('active');
            });
        }
        
        // Hash change for SPA navigation
        window.addEventListener('hashchange', this.handleHashChange);
        
        // Initial hash handling
        this.handleHashChange();
    }
    
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    static async handleLoginSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            Utils.showNotification('Please fill all fields', 'error');
            return;
        }
        
        try {
            await AuthService.login(email, password);
            document.getElementById('loginModal').style.display = 'none';
            elements.loginForm.reset();
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        }
    }
    
    static async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            country: document.getElementById('regCountry').value,
            role: document.getElementById('regRole').value,
            tier: document.getElementById('regTier').value,
            ref1Name: document.getElementById('ref1Name').value,
            ref1Phone: document.getElementById('ref1Phone').value,
            ref2Name: document.getElementById('ref2Name').value,
            ref2Phone: document.getElementById('ref2Phone').value,
            password: document.getElementById('regPassword').value
        };
        
        // Validate required fields
        const requiredFields = ['name', 'phone', 'country', 'role', 'tier', 'ref1Name', 'ref1Phone', 'ref2Name', 'ref2Phone', 'password'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                Utils.showNotification(`${field.replace('ref', 'Referrer ').replace('Name', ' Name')} is required`, 'error');
                return;
            }
        }
        
        // Validate phone numbers
        if (!Utils.validatePhone(userData.phone)) {
            Utils.showNotification('Invalid phone number format', 'error');
            return;
        }
        
        if (!Utils.validatePhone(userData.ref1Phone)) {
            Utils.showNotification('Invalid referrer 1 phone number', 'error');
            return;
        }
        
        if (!Utils.validatePhone(userData.ref2Phone)) {
            Utils.showNotification('Invalid referrer 2 phone number', 'error');
            return;
        }
        
        // Validate email if provided
        if (userData.email && !Utils.validateEmail(userData.email)) {
            Utils.showNotification('Invalid email format', 'error');
            return;
        }
        
        try {
            await AuthService.register(userData);
            document.getElementById('registerModal').style.display = 'none';
            elements.registerForm.reset();
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        }
    }
    
    static handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        const [page, query] = hash.split('?');
        
        UIComponents.loadPage(page);
        
        // Handle query parameters
        if (query && page === 'borrow') {
            const params = new URLSearchParams(query);
            const category = params.get('category');
            if (category) {
                // Pre-select category in borrow form
                console.log('Pre-selected category:', category);
            }
        }
    }
}

/**
 * Initialize Application
 */
class AppInitializer {
    static async initialize() {
        try {
            // Initialize Firebase auth state listener
            auth.onAuthStateChanged(async (user) => {
                AppState.currentUser = user;
                
                if (user) {
                    // Load user data from Firestore
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        AppState.userData = userDoc.data();
                        
                        // Load real-time stats
                        this.loadStats();
                    }
                } else {
                    AppState.userData = null;
                }
                
                // Update UI
                UIComponents.updateUserInterface();
            });
            
            // Render initial components
            UIComponents.renderCategoryCards();
            UIComponents.renderFloatingCards();
            UIComponents.updateCalculator();
            
            // Setup event listeners
            EventListeners.initialize();
            
            // Load stats
            this.loadStats();
            
            console.log('Pesewa.com application initialized successfully');
        } catch (error) {
            console.error('Application initialization error:', error);
        }
    }
    
    static async loadStats() {
        try {
            // Mock stats for demonstration
            // In production, these would come from Firestore aggregates
            
            if (elements.activeLoans) {
                elements.activeLoans.textContent = '2,847';
            }
            
            if (elements.totalLenders) {
                elements.totalLenders.textContent = '15,692';
            }
            
            if (elements.successRate) {
                elements.successRate.textContent = '98.7%';
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.initialize();
});

// Expose utilities for inline handlers
window.UIComponents = UIComponents;
window.Utils = Utils;
window.LoanService = LoanService;
window.AuthService = AuthService;
window.GroupService = GroupService;

// CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: #FFFFFF;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    }
    
    .notification-success { background-color: #20C997; }
    .notification-error { background-color: #DC3545; }
    .notification-warning { background-color: #FD7E14; }
    .notification-info { background-color: #17A2B8; }
    
    .error-message {
        color: #FF6B6B;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }
    
    .loans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .loan-card {
        background: linear-gradient(135deg, #1A3A5F, rgba(255, 198, 0, 0.05));
        border: 1px solid #FFC600;
        border-radius: 8px;
        padding: 1rem;
    }
    
    .dashboard-calculator {
        background: linear-gradient(135deg, #1A3A5F, rgba(255, 198, 0, 0.05));
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    
    .dashboard-calculator .input-group {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .dashboard-calculator input,
    .dashboard-calculator select {
        flex: 1;
        padding: 0.5rem;
        background-color: #001F3F;
        border: 1px solid #FFC600;
        border-radius: 4px;
        color: #FFFFFF;
    }
    
    .error-page {
        text-align: center;
        padding: 3rem;
    }
`;
document.head.appendChild(style);