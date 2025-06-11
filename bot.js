const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Input files
const PRIVATE_KEYS_FILE = 'pv.txt';
const PROXY_FILE = 'proxy.txt';
const TOKENS_FILE = 'tokens.json';

// Settings
const USE_PROXY = true; // Set to false to disable proxy
const DELAY_BETWEEN_WALLETS = 30000; // 30 seconds between each wallet
const DAILY_RUN_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Function to read files
const readFileLines = (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.error(`File ${filePath} not found.`);
        return [];
    }
    return fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
};

// Function to save tokens
const saveTokens = (tokens) => {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
};

// Function to load tokens
const loadTokens = () => {
    if (fs.existsSync(TOKENS_FILE)) {
        return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
    }
    return {};
};

// Function to create proxy agent
const getProxyAgent = (proxy) => {
    return new HttpsProxyAgent(proxy);
};

// Function to get wallet address from private key
const getWalletAddress = (privateKey) => {
    try {
        const wallet = new ethers.Wallet(privateKey);
        return wallet.address;
    } catch (error) {
        console.error(`Invalid private key: ${error.message}`);
        return null;
    }
};

// Function to get sign message from API
const getSignMessage = async (walletAddress, proxy) => {
    try {
        // Validate wallet address - compatible with both ethers versions
        try {
            // ethers v6
            if (ethers.isAddress && !ethers.isAddress(walletAddress)) {
                throw new Error('Invalid wallet address');
            }
        } catch (e) {
            // ethers v5
            if (ethers.utils && ethers.utils.isAddress && !ethers.utils.isAddress(walletAddress)) {
                throw new Error('Invalid wallet address');
            }
        }

        const config = {
            headers: {
                'Accept': 'application/json',
                'Origin': 'https://x.ink',
                'Referer': 'https://x.ink/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            }
        };

        // Add proxy only if enabled
        if (USE_PROXY && proxy) {
            config.httpsAgent = getProxyAgent(proxy);
        }

        const response = await axios.get(`https://api.x.ink/v1/get-sign-message2?walletAddress=${walletAddress}`, config);
        
        if (response.data && response.data.message) {
            return response.data.message;
        } else {
            throw new Error('Invalid response format: No message field');
        }
    } catch (error) {
        console.error(`Error fetching sign message for ${walletAddress}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            proxyUsed: USE_PROXY && proxy ? proxy : 'None'
        });
        return null;
    }
};

// Function to sign message
const signMessage = async (message, privateKey) => {
    try {
        const wallet = new ethers.Wallet(privateKey);
        const signature = await wallet.signMessage(message);
        return signature;
    } catch (error) {
        console.error(`Error signing message: ${error.message}`);
        return null;
    }
};

// Function to verify signature and get token
const verifySignature = async (walletAddress, signMessage, signature, proxy) => {
    try {
        const payload = {
            walletAddress,
            signMessage,
            signature,
            referrer: 'TJW3LR'
        };
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://x.ink',
                'Referer': 'https://x.ink/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            }
        };
        
        if (USE_PROXY && proxy) {
            config.httpsAgent = getProxyAgent(proxy);
        }
        
        const response = await axios.post('https://api.x.ink/v1/verify-signature2', payload, config);
        
        if (response.data.success) {
            return response.data.token;
        }
        
        console.error(`Signature verification failed: ${JSON.stringify(response.data)}`);
        return null;
    } catch (error) {
        console.error(`Error verifying signature for ${walletAddress}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        return null;
    }
};

// Function to get user info
const getUserInfo = async (token, proxy) => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Origin': 'https://x.ink',
                'Referer': 'https://x.ink/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            }
        };
        
        if (USE_PROXY && proxy) {
            config.httpsAgent = getProxyAgent(proxy);
        }
        
        const response = await axios.get('https://api.x.ink/v1/me', config);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching user info:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        return null;
    }
};

// Function to perform check-in
const performCheckIn = async (token, proxy) => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://x.ink',
                'Referer': 'https://x.ink/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            }
        };
        
        if (USE_PROXY && proxy) {
            config.httpsAgent = getProxyAgent(proxy);
        }
        
        const response = await axios.post('https://api.x.ink/v1/check-in', {}, config);
        
        if (response.data.success) {
            return response.data;
        }
        
        console.error(`Check-in failed: ${JSON.stringify(response.data)}`);
        return null;
    } catch (error) {
        console.error(`Error performing check-in:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        return null;
    }
};

// Function to test proxy
const testProxy = async (proxy) => {
    try {
        const config = {
            timeout: 10000,
            httpsAgent: getProxyAgent(proxy)
        };
        
        const response = await axios.get('https://api.ipify.org?format=json', config);
        return response.data.ip;
    } catch (error) {
        return null;
    }
};

// Function to format time
const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} days and ${hours % 24} hours`;
    if (hours > 0) return `${hours} hours and ${minutes % 60} minutes`;
    if (minutes > 0) return `${minutes} minutes and ${seconds % 60} seconds`;
    return `${seconds} seconds`;
};

// Function to process all wallets
const processAllWallets = async () => {
    const startTime = new Date();
    console.log('\n🔄 ===========================================');
    console.log(`🚀 Starting new cycle at ${startTime.toLocaleString('en-US')}`);
    console.log('===========================================\n');
    
    const privateKeys = readFileLines(PRIVATE_KEYS_FILE);
    const proxies = readFileLines(PROXY_FILE);
    let tokens = loadTokens();

    if (privateKeys.length === 0) {
        console.error('No private keys found. Exiting...');
        return;
    }

    if (USE_PROXY && proxies.length === 0) {
        console.error('Proxy mode is enabled but no proxies found. Exiting...');
        return;
    }

    console.log(`Found ${privateKeys.length} wallets to process`);
    console.log(`Proxy mode: ${USE_PROXY ? 'Enabled' : 'Disabled'}`);
    if (USE_PROXY) {
        console.log(`Found ${proxies.length} proxies\n`);
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < privateKeys.length; i++) {
        const privateKey = privateKeys[i];
        const proxy = USE_PROXY ? proxies[i % proxies.length] : null;
        const walletAddress = getWalletAddress(privateKey);

        if (!walletAddress) {
            console.log(`Skipping invalid private key at index ${i + 1}`);
            console.log('----------------------------------------\n');
            failCount++;
            continue;
        }

        console.log(`\n[${i + 1}/${privateKeys.length}] Processing wallet: ${walletAddress}`);
        
        // Test proxy
        if (USE_PROXY && proxy) {
            console.log(`Testing proxy: ${proxy}`);
            const proxyIP = await testProxy(proxy);
            if (proxyIP) {
                console.log(`✅ Proxy working - IP: ${proxyIP}`);
            } else {
                console.log(`❌ Proxy not working, skipping this wallet`);
                console.log('----------------------------------------\n');
                failCount++;
                continue;
            }
        }

        let token = tokens[walletAddress];
        let userInfo = null;

        // If no token, create one
        if (!token) {
            console.log(`No token found. Creating new token...`);
            
            // Get message to sign
            const messageToSign = await getSignMessage(walletAddress, proxy);
            if (!messageToSign) {
                console.log(`Failed to get sign message for ${walletAddress}`);
                console.log('----------------------------------------\n');
                failCount++;
                continue;
            }

            console.log(`Signing message...`);
            const signature = await signMessage(messageToSign, privateKey);
            if (!signature) {
                console.log(`Failed to sign message for ${walletAddress}`);
                console.log('----------------------------------------\n');
                failCount++;
                continue;
            }

            console.log(`Verifying signature...`);
            token = await verifySignature(walletAddress, messageToSign, signature, proxy);
            if (token) {
                tokens[walletAddress] = token;
                saveTokens(tokens);
                console.log(`✅ Token saved successfully`);
            } else {
                console.log(`❌ Failed to get token for ${walletAddress}`);
                console.log('----------------------------------------\n');
                failCount++;
                continue;
            }
        } else {
            console.log(`Using existing token`);
        }

        // Get user info
        console.log(`\nFetching user info...`);
        userInfo = await getUserInfo(token, proxy);
        if (!userInfo) {
            console.log(`❌ Invalid token. Removing from storage...`);
            delete tokens[walletAddress];
            saveTokens(tokens);
            console.log('----------------------------------------\n');
            failCount++;
            continue;
        }

        // Display user info
        console.log(`\n📊 User Info:`);
        console.log(`├─ Invite Count: ${userInfo.inviteCount}`);
        console.log(`├─ Check-in Count: ${userInfo.check_in_count}`);
        console.log(`├─ Points: ${userInfo.points}`);
        console.log(`└─ Last Check-in: ${userInfo.lastCheckIn || 'Never'}`);

        // Check if can check-in
        const lastCheckIn = userInfo.lastCheckIn ? new Date(userInfo.lastCheckIn) : null;
        const now = new Date();
        const hoursSinceLastCheckIn = lastCheckIn ? (now - lastCheckIn) / (1000 * 60 * 60) : 999;
        
        if (!lastCheckIn || hoursSinceLastCheckIn >= 24) {
            console.log(`\n🎯 Performing daily check-in...`);
            const checkInResult = await performCheckIn(token, proxy);
            
            if (checkInResult) {
                console.log(`✅ Check-in successful!`);
                console.log(`├─ Points Earned: +${checkInResult.pointsEarned}`);
                console.log(`└─ New Check-in Count: ${checkInResult.check_in_count}`);

                // Get updated info
                const updatedUserInfo = await getUserInfo(token, proxy);
                if (updatedUserInfo) {
                    console.log(`\n📊 Updated Stats:`);
                    console.log(`└─ Total Points: ${updatedUserInfo.points}`);
                }
                successCount++;
            } else {
                console.log(`❌ Check-in failed`);
                failCount++;
            }
        } else {
            const hoursUntilNextCheckIn = 24 - hoursSinceLastCheckIn;
            console.log(`\n⏰ Check-in not available yet`);
            console.log(`└─ Next check-in in: ${hoursUntilNextCheckIn.toFixed(1)} hours`);
            successCount++;
        }

        console.log('\n========================================\n');
        
        // Delay between wallets (30 seconds)
        if (i < privateKeys.length - 1) {
            console.log(`⏳ Waiting 30 seconds before next wallet...`);
            
            // Show countdown
            for (let countdown = 30; countdown > 0; countdown--) {
                process.stdout.write(`\r⏱️  ${countdown} seconds remaining...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.log('\r✅ Continuing to next wallet...          \n');
        }
    }

    const endTime = new Date();
    const processingTime = endTime - startTime;
    
    console.log('\n📊 ===========================================');
    console.log('Cycle Summary:');
    console.log(`├─ Total Wallets: ${privateKeys.length}`);
    console.log(`├─ Successful: ${successCount}`);
    console.log(`├─ Failed: ${failCount}`);
    console.log(`├─ Processing Time: ${formatTime(processingTime)}`);
    console.log(`└─ Completed at: ${endTime.toLocaleString('en-US')}`);
    console.log('===========================================\n');
};

// Main function for continuous execution
const main = async () => {
    console.log('===========================================');
    console.log('🤖 X.INK Daily Check-in Bot');
    console.log('📅 https://t.me/ostadkachal');
    console.log('===========================================\n');
    
    let cycleNumber = 1;
    
    // Continuous execution
    while (true) {
        console.log(`\n🔄 Starting Cycle #${cycleNumber}`);
        
        try {
            await processAllWallets();
        } catch (error) {
            console.error('\n❌ Cycle failed:', {
                message: error.message,
                stack: error.stack
            });
        }
        
        const nextRunTime = new Date(Date.now() + DAILY_RUN_INTERVAL);
        console.log(`\n⏰ Next cycle will start at: ${nextRunTime.toLocaleString('en-US')}`);
        console.log(`⏳ Waiting 24 hours...`);
        console.log('💡 Press Ctrl+C to stop the bot\n');
        
        // Show countdown for 24 hours
        const updateInterval = 60000; // Update every minute
        let remainingTime = DAILY_RUN_INTERVAL;
        
        while (remainingTime > 0) {
            process.stdout.write(`\r⏱️  Time until next cycle: ${formatTime(remainingTime)}`);
            await new Promise(resolve => setTimeout(resolve, Math.min(updateInterval, remainingTime)));
            remainingTime -= updateInterval;
        }
        
        console.log('\n');
        cycleNumber++;
    }
};

// Handle exit
process.on('SIGINT', () => {
    console.log('\n\n👋 Bot stopped by user');
    console.log('===========================================');
    process.exit(0);
});

// Run script
main().catch((error) => {
    console.error('\n❌ Script failed:', {
        message: error.message,
        stack: error.stack
    });
});
