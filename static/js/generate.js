let allPasswords = [];

document.getElementById('generateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lowercase = document.getElementById('lowercase').checked;
    const uppercase = document.getElementById('uppercase').checked;
    const digits = document.getElementById('digits').checked;
    const special = document.getElementById('special').checked;
    const length = parseInt(document.getElementById('length').value);
    const mask = document.getElementById('mask').value.trim();
    const customWords = document.getElementById('customWords').value.trim().split('\n').filter(word => word.trim());

    let chars = '';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (digits) chars += '0123456789';
    if (special) chars += '!@#$%^&*()';

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    allPasswords = [];

    if (!chars && !mask && !customWords.length) {
        resultDiv.innerHTML = '<p class="text-danger">Iltimos, kamida bitta belgi to‘plami, maska yoki maxsus so‘z kiriting!</p>';
        document.getElementById('exportBtn').disabled = true;
        return;
    }

    let description = '';
    let type = '';
    if (mask) {
        description = `Maska: ${mask}`;
        type = 'mask';
    } else if (customWords.length) {
        description = `Maxsus so‘zlar: ${customWords.slice(0, 3).join(', ')}${customWords.length > 3 ? '...' : ''}`;
        type = 'custom';
    } else {
        let types = [];
        if (lowercase) types.push('kichik harflar');
        if (uppercase) types.push('katta harflar');
        if (digits) types.push('raqamlar');
        if (special) types.push('maxsus belgilar');
        description = `${length} belgili, ${types.join(', ')}`;
        type = 'standard';
    }

    if (mask) {
        allPasswords = generateByMask(mask);
    } else {
        if (customWords.length) {
            allPasswords = allPasswords.concat(customWords);
            if (chars) {
                customWords.forEach(word => {
                    for (let i = 1; i <= 3; i++) {
                        allPasswords.push(word + generateRandomString(chars, i));
                    }
                });
            }
        }
        if (chars && length <= 5) {
            allPasswords = allPasswords.concat(generateCombinations(chars, length));
        } else if (chars) {
            for (let i = 0; i < 10; i++) {
                allPasswords.push(generateRandomString(chars, length));
            }
        }
    }

    displayPasswords(allPasswords);
    document.getElementById('exportBtn').disabled = allPasswords.length === 0;

    if (allPasswords.length) {
        await apiRequest('/history/api/history', 'POST', {
            description,
            type,
            passwords: allPasswords
        });
    }
});

// Qidiruv/Filtrlash
document.getElementById('search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    displayPasswords(allPasswords, query);
});

// Eksport qilish
document.getElementById('exportBtn')?.addEventListener('click', () => {
    if (allPasswords.length) {
        exportToTxt(allPasswords, 'passwords.txt');
    }
});

// Generatsiya funksiyalari
function generateRandomString(chars, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function generateCombinations(chars, length) {
    let result = [''];
    for (let i = 0; i < length; i++) {
        let newResult = [];
        for (let prefix of result) {
            for (let char of chars) {
                newResult.push(prefix + char);
            }
        }
        result = newResult;
    }
    return result;
}

function generateByMask(mask) {
    const charSets = {
        '?l': 'abcdefghijklmnopqrstuvwxyz',
        '?u': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '?d': '0123456789',
        '?s': '!@#$%^&*()'
    };

    let parts = [];
    let current = '';
    for (let char of mask) {
        if (char === '?' && current === '') {
            current = char;
        } else if (current === '?' && ['l', 'u', 'd', 's'].includes(char)) {
            parts.push(charSets['?' + char] || '');
            current = '';
        } else {
            parts.push(char);
            current = '';
        }
    }

    let result = [''];
    for (let part of parts) {
        let newResult = [];
        for (let prefix of result) {
            if (part.length === 1) {
                newResult.push(prefix + part);
            } else {
                for (let char of part) {
                    newResult.push(prefix + char);
                }
            }
        }
        result = newResult;
    }
    return result;
}

function displayPasswords(passwords, query = '') {
    const resultDiv = document.getElementById('result');
    let filtered = passwords;
    if (query) {
        filtered = passwords.filter(pwd => pwd.toLowerCase().includes(query));
    }

    if (filtered.length) {
        resultDiv.innerHTML = filtered.map(pwd => `<div>${pwd}</div>`).join('');
    } else {
        resultDiv.innerHTML = '<p class="text-muted">Parollar topilmadi.</p>';
    }
}