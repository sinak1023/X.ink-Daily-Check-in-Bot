# X.ink Daily Check-in Bot
An automated bot for X.ink platform that handles daily check-ins, manages multiple wallets, and tracks user statistics.

## Features
- 🔐 **Multi-wallet support** - Process multiple wallets from a single instance
- 🔄 **Automatic daily check-ins** - Performs check-ins every 24 hours
- 🌐 **Proxy support** - Route requests through HTTP/HTTPS proxies
- 💾 **Token persistence** - Saves authentication tokens to avoid re-signing
- 📊 **User statistics** - Displays invite count, check-in count, and points
- ⏰ **Smart scheduling** - Only attempts check-in when 24 hours have passed
- 🚀 **Auto-restart** - Runs continuously with 24-hour intervals

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

## Installation
Clone the repository:
```bash
git clone https://github.com/sinak1023/xink-daily-bot.git
cd xink-daily-bot
```

Install dependencies:
```bash
npm install
```

## Configuration
### 1. Private Keys (pv.txt)
Create a `pv.txt` file in the root directory and add your private keys, one per line:
```
0x1234567890abcdef…
0xabcdef1234567890…
```

### 2. Proxies (proxy.txt) - Optional
If you want to use proxies, create a `proxy.txt` file with HTTP/HTTPS proxies, one per line:
```
http://ip:port
http://username:password@ip:port
```
To disable proxy usage, set `USE_PROXY = false` in the script.

### 3. Settings
You can modify these settings in the script:
- `USE_PROXY`: Enable/disable proxy usage (default: `true`)
- `DELAY_BETWEEN_WALLETS`: Delay between processing wallets in milliseconds (default: `30000` - 30 seconds)
- `DAILY_RUN_INTERVAL`: Interval between full cycles in milliseconds (default: `86400000` - 24 hours)

## Usage
Run the bot:
```bash
node bot.js
```

The bot will:
1. Load private keys from `pv.txt`
2. Load proxies from `proxy.txt` (if enabled)
3. Process each wallet:
   - Validate the private key
   - Test the proxy connection
   - Get or create authentication token
   - Fetch user information
   - Perform check-in if eligible
   - Display statistics
4. Wait 30 seconds between each wallet
5. After processing all wallets, wait 24 hours and repeat

### Running with PM2 (Recommended)
For production use, it’s recommended to use PM2:
```bash
npm install -g pm2
pm2 start bot.js --name "xink-bot"
pm2 save
pm2 startup
```

### Running with Screen
Alternatively, you can use `screen`:
```bash
screen -S xink-bot
node bot.js
```
Press `Ctrl+A` then `D` to detach. Use `screen -r xink-bot` to reattach.

## Output
The bot provides detailed logging:
```
🤖 X.INK Daily Check-in Bot
📅 Auto-run every 24 hours
[1/5] Processing wallet: 0x123…
✅ Proxy working - IP: 123.45.67.89
Using existing token
📊 User Info:
├─ Invite Count: 10
├─ Check-in Count: 5
├─ Points: 120
└─ Last Check-in: 2024-01-15T10:30:00Z
🎯 Performing daily check-in…
✅ Check-in successful!
├─ Points Earned: +20
└─ New Check-in Count: 6
```

## File Structure
```
xink-daily-bot/
├── bot.js          # Main bot script
├── pv.txt         # Private keys (one per line)
├── proxy.txt      # Proxy list (optional)
├── tokens.json    # Saved authentication tokens (auto-generated)
├── package.json   # Node.js dependencies
├── LICENSE        # MIT License
└── README.md      # This file
```

## Troubleshooting
- **“Cannot read properties of undefined (reading ‘isAddress’)”**  
  This error occurs due to ethers.js version mismatch. The script is compatible with both v5 and v6.

- **“400 The plain HTTP request was sent to HTTPS port”**  
  Your proxy doesn’t support HTTPS. Either:
  - Use a different proxy that supports HTTPS
  - Set `USE_PROXY = false` to disable proxy usage

- **“Invalid token”**  
  The saved token has expired. The bot will automatically remove it and create a new one.

## Security Notes
- Never share your `pv.txt` file - It contains your private keys
- Add `pv.txt`, `proxy.txt`, and `tokens.json` to `.gitignore`
- Use environment variables for sensitive data in production
- Ensure your proxies are from trusted sources

## Dependencies
- `ethers` - Ethereum wallet management and signing
- `axios` - HTTP requests
- `https-proxy-agent` - HTTPS proxy support

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the `LICENSE` file for details.

**MIT License**

Copyright © 2024 sinak1023

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Disclaimer
This bot is for educational purposes only. Use at your own risk. The authors are not responsible for any losses or damages caused by the use of this bot. Always ensure you comply with the platform’s terms of service.

## Support
For issues and questions:
- Open an issue on GitHub
- Check existing issues before creating a new one

Made with ❤️ by sinak1023
