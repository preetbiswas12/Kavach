# Kavach - Installation & Prerequisites Guide

**Last Updated**: April 5, 2026  
**Status**: Pre-implementation (Development Setup)  
**Kotlin Usage**: ❌ **NOT USED** - Pure Flutter + Swift only

---

## 🎯 Architecture Overview

Kavach uses a **pure cross-platform approach** avoiding native Android (Kotlin) complexity:

```
┌──────────────────────────────────────────────────────────────┐
│              CROSS-PLATFORM MOBILE (FLUTTER)                 │
│  • Native iOS via Swift (minimal, via platform channels)     │
│  • No Android native code (Kotlin completely avoided!)       │
│  • 95%+ shared Dart code for iOS & Android                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────┴──────────────────┐
        │                                      │
   ┌────▼─────┐                        ┌─────▼────┐
   │ BACKEND  │                        │    ML    │
   │Node.js   │                        │ Python   │
   └──────────┘                        └──────────┘
```

---

## 📋 System Requirements

### Minimum Specifications
- **OS**: Windows 10+, macOS 12+, or Ubuntu 20.04+
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 50GB free (for SDKs, emulators, dependencies)
- **Connection**: Stable internet (for downloading SDKs)

### Development Machine Checklist
- ✅ Administrator access (for installing software)
- ✅ Android emulator OR physical Android device
- ✅ macOS (if developing for iOS) OR iPhone device
- ✅ Git installed and configured
- ✅ Terminal/PowerShell proficiency

---

## 🛠️ Installation Steps by Platform

### **SECTION A: For All Developers**

#### **1. Install Git**

**Windows:**
```powershell
# Using Chocolatey (if installed)
choco install git -y

# OR download from https://git-scm.com/download/win
# Run installer and accept defaults
```

**macOS:**
```bash
# Using Homebrew
brew install git

# OR install Xcode command line tools
xcode-select --install
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install git -y
```

#### **2. Clone Repository**
```bash
git clone https://github.com/preetbiswas12/Kavach.git
cd Kavach
```

#### **3. Install Node.js & npm** (For Backend & Build Tools)

**Windows:**
```powershell
# Using Chocolatey
choco install nodejs -y

# Verify installation
node --version    # Should be 16.0.0 or higher
npm --version     # Should be 8.0.0 or higher
```

**macOS:**
```bash
# Using Homebrew
brew install node@18

# Verify installation
node --version
npm --version
```

**Linux:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### **4. Install Flutter SDK**

**Official Flutter Installation**: [flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)

**Windows:**
```powershell
# Option A: Using Chocolatey (recommended)
choco install flutter -y

# Option B: Manual installation
# 1. Download from https://flutter.dev/docs/development/tools/sdk/releases
# 2. Extract to C:\src\flutter (or any location)
# 3. Add to PATH: C:\src\flutter\bin

# Verify installation
flutter --version   # Should be 3.0.0 or higher
flutter doctor      # Check for issues
```

**macOS:**
```bash
# Using Homebrew (easiest)
brew install flutter

# OR download and add to PATH manually
# Add to ~/.zshrc or ~/.bash_profile:
# export PATH="$PATH:$HOME/flutter/bin"

# Verify
flutter --version
flutter doctor
```

**Linux:**
```bash
# 1. Download from https://flutter.dev/docs/development/tools/sdk/releases
# 2. Extract:
cd ~
tar xf flutter_linux_*.tar.xz

# 3. Add to PATH in ~/.bashrc:
export PATH="$PATH:$HOME/flutter/bin"

# 4. Reload shell
source ~/.bashrc

# Verify
flutter --version
flutter doctor
```

#### **5. Install Android Studio** (For Android Emulator & SDK)

**Windows/macOS/Linux**: https://developer.android.com/studio

```bash
# After installing Android Studio:
flutter doctor --android-licenses  # Accept licenses
flutter doctor                      # Verify setup
```

#### **6. Install VS Code** (Recommended IDE)

https://code.visualstudio.com/

**Essential Extensions**:
- Flutter (Dart Code)
- Dart (Dart Code)
- C++ (Microsoft) - optional
- REST Client - optional

```bash
# Install Flutter extension from VS Code marketplace
code --install-extension Dart-Code.flutter
code --install-extension Dart-Code.dart-code
```

---

### **SECTION B: Backend Setup (Node.js)**

#### **1. Navigate to Backend**
```bash
cd backend
```

#### **2. Install Dependencies**
```bash
npm install

# If using npm 7+ and getting peer dependency warnings:
npm install --legacy-peer-deps
```

#### **3. Environment Configuration**
```bash
# Copy example to actual .env file
cp .env.example .env

# Edit .env with your actual values:
# - Database credentials
# - API keys (Google Maps, Firebase, Twilio)
# - JWT secrets (CHANGE THESE!)
# - Port settings
```

#### **4. Database Setup**

**Install PostgreSQL**:
- **Windows**: https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

**Install MongoDB**:
- **Windows**: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- **macOS**: `brew tap mongodb/brew && brew install mongodb-community`
- **Linux**: https://docs.mongodb.com/manual/installation/

**Initialize Databases**:
```bash
# PostgreSQL (create kavach database)
createdb kavach

# Run migrations
npm run migrate

# MongoDB (connection string in .env)
# Automatically creates database on first connection
```

#### **5. Install Redis** (For Caching & Real-time)

**Windows** (using Windows Subsystem for Linux):
```powershell
wsl --install
wsl sudo apt-get install redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### **6. Start Backend Server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start

# Should show: "🛡️ Kavach Backend - DEVELOPMENT Server running on port 3000"
```

**Test Backend**:
```bash
# In another terminal
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-05T...","environment":"development","version":"1.0.0"}
```

---

### **SECTION C: Mobile Setup (Flutter)**

#### **1. Navigate to Mobile**
```bash
cd mobile
```

#### **2. Install Flutter Dependencies**
```bash
flutter pub get
```

#### **3. Environment Configuration**
```bash
# Copy example to actual .env file
cp .env.example .env

# Edit .env with your actual values:
# - BACKEND_URL=http://localhost:3000
# - Google Maps API key
# - Firebase configuration
# - Feature flags
```

#### **4. Generate Code** (For Riverpod, JSON serialization, etc.)
```bash
# Build code generation
flutter pub run build_runner build

# Watch mode (auto-rebuild on changes)
flutter pub run build_runner watch
```

#### **5. Choose Your Platform**

**Option A: Android (Recommended for Testing)**

```bash
# Start emulator
emulator -avd Pixel_5_API_34 &

# Or use physical device
adb devices

# Run app
flutter run -d android

# OR specific device
flutter run -d emulator-5554
```

**Option B: iOS** (macOS only)

```bash
# You need CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd ios
pod install
cd ..

# Start iOS simulator
open -a Simulator

# Run app
flutter run -d ios

# OR physical device (requires Apple Developer account)
flutter run -d <device-id>
```

**Option C: Web** (For Quick Testing)

```bash
# Run web version (uses Chrome)
flutter run -d web-javascript

# Or Chrome directly
flutter run -w -d chrome
```

#### **6. Run Tests**
```bash
# All tests
flutter test

# Specific test
flutter test test/unit/crash_detection_test.dart

# With coverage
flutter test --coverage
```

---

### **SECTION D: ML Setup (Optional, For Training)**

#### **1. Install Python 3.9+**

**Windows:**
https://www.python.org/downloads/

**macOS:**
```bash
brew install python@3.11
```

**Linux:**
```bash
sudo apt-get install python3.11 python3.11-venv
```

#### **2. Create Virtual Environment**
```bash
cd ml

# Create venv
python3.11 -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### **3. Install ML Dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt

# Key packages:
# - tensorflow (2.13+)
# - tensorflow-lite-support
# - numpy, pandas, scikit-learn
# - matplotlib, jupyter
```

#### **4. Run ML Scripts**
```bash
# Train crash detection model
python training/crash_training.py

# Test model inference
python inference/crash_detector.py test_data.csv

# Export to TensorFlow Lite
python training/export_to_tflite.py
```

---

## 🗂️ Project Structure After Setup

```
kavach/
├── mobile/                           # Flutter app
│   ├── lib/                          # Source code
│   │   ├── features/                 # Feature modules
│   │   │   ├── crash_detection/
│   │   │   ├── theft_protection/
│   │   │   ├── emergency_response/
│   │   │   └── user_management/
│   │   ├── core/                     # Shared code
│   │   │   ├── theme/
│   │   │   ├── config/
│   │   │   ├── errors/
│   │   │   └── utils/
│   │   └── main.dart                 # Entry point
│   ├── test/                         # Tests
│   ├── pubspec.yaml                  # Dependencies
│   ├── .env.example                  # Config template
│   └── README.md
│
├── backend/                          # Node.js/Express
│   ├── src/
│   │   ├── routes/                   # API routes
│   │   ├── controllers/              # Request handlers
│   │   ├── services/                 # Business logic
│   │   ├── models/                   # Data schemas
│   │   ├── middleware/               # Auth, validation
│   │   ├── config/                   # Configuration
│   │   ├── utils/                    # Helpers
│   │   └── index.js                  # Server entry
│   ├── src/__tests__/               # Tests
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Config template
│   └── README.md
│
├── ml/                               # Python ML
│   ├── models/                       # Trained .tflite models
│   ├── training/                     # Training scripts
│   ├── inference/                    # Inference wrappers
│   ├── requirements.txt              # Python dependencies
│   └── README.md
│
├── .github/
│   ├── instructions/
│   │   └── kavach.instructions.md    # Conventions guide
│   └── workflows/                    # CI/CD pipelines
│
├── docs/                             # Documentation
├── docker-compose.yml                # Local dev environment
├── .gitignore
├── README.md                         # Project overview
├── context_mapping.md                # Session memory
└── installation_and_prerequisites.md # This file
```

---

## ⚙️ Verification Checklist

After setup, verify everything works:

```bash
# ✅ Git
git --version

# ✅ Node.js
node --version
npm --version

# ✅ Flutter
flutter --version
flutter doctor

# ✅ Backend ready
cd backend
npm install --dry-run  # Should say "up to date"
npm run dev            # Should start on port 3000

# ✅ Mobile ready
cd ../mobile
flutter pub get        # Should finish without errors
flutter run -d web     # Test web run (don't need device)

# ✅ Android emulator
emulator -list-avds    # Should show available emulators
```

---

## 🚀 Running the Full Stack

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Wait for: "Kavach Backend - DEVELOPMENT Server running on port 3000"
```

**Terminal 2 - Mobile (Android Emulator):**
```bash
# Start emulator if not running
emulator -avd Pixel_5_API_34 &

cd mobile
flutter run -d android
# Wait for: "Launching lib/main.dart on..."
```

**Terminal 3 - Optional: Web Dashboard (Future)**
```bash
cd web
npm start
# Frontend accessible at http://localhost:3001
```

Visit in Emulator:
- App should show: "Kavach - Your Silent Guardian"
- Test buttons should be interactive

---

## 🔑 Environment Variables Reference

### Backend (.env)
```env
# MUST CHANGE
JWT_SECRET=generate_a_secure_random_string_using_uuid
POSTGRES_PASSWORD=your_secure_database_password
TWILIO_ACCOUNT_SID=from_twilio_console
TWILIO_AUTH_TOKEN=from_twilio_console

# Optional but useful
GOOGLE_MAPS_API_KEY=from_google_console
AWS_ACCESS_KEY_ID=from_aws_iam
```

### Mobile (.env)
```env
# MUST CHANGE
BACKEND_URL=http://your_server_ip:3000
GOOGLE_MAPS_API_KEY=from_google_console

# Development (default)
CRASH_DETECTION_ENABLED=true
THEFT_PROTECTION_ENABLED=true
```

---

## 🚨 Common Issues & Solutions

### **Flutter: "Command 'flutter' not found"**
```bash
# Solution: Add Flutter to PATH
# Windows: Restart after installation
# macOS/Linux: Run:
source ~/.bashrc    # or ~/.zshrc
flutter --version
```

### **Backend: "port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### **Mobile: "CocoaPods not found" (iOS)**
```bash
sudo gem install cocoapods
cd mobile/ios
pod repo update
pod install
```

### **Backend: "MongoDB connection refused"**
```bash
# Windows: Start MongoDB service
net start MongoDB

# macOS: Verify Homebrew MongoDB
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### **Flutter: "Gradle build failed"** (AVOIDED - No Kotlin!)
This error is eliminated by using pure Flutter (no Kotlin native Android code).

---

## 🔗 tech Stack Preferences (No Kotlin)

### Why No Kotlin?
- ✅ **Gradle Conflicts**: Flutter handles build config, Kotlin adds another builder
- ✅ **Maintenance**: 95% Dart code enough for our needs
- ✅ **Development Speed**: Faster without native complications
- ✅ **iOS Parity**: Works equally on iOS without native bulks

### Our Approach
| Platform | Technology | Build System | Status |
|----------|-----------|--------------|--------|
| **iOS** | Swift (minimal) | Xcode (managed by Flutter) | ✅ Preferred |
| **Android** | Pure Flutter | Gradle (Flutter wrapper) | ✅ No Kotlin |
| **Backend** | Node.js | npm | ✅ Simple |
| **ML** | Python | Conda/pip | ✅ Recommended |

---

## 📚 Documentation Links

- Flutter: https://flutter.dev/docs
- Dart: https://dart.dev/guides
- Node.js/Express: https://express.js.com
- PostgreSQL: https://www.postgresql.org/docs
- MongoDB: https://docs.mongodb.com
- Firebase: https://firebase.google.com/docs
- Riverpod: https://riverpod.dev
- Socket.io: https://socket.io/docs

---

## ✅ Next Steps After Setup

1. **Verify all installations**: Run checklist above
2. **Start backend server**: `npm run dev`
3. **Run mobile app**: `flutter run`
4. **Review conventions**: Read `.github/instructions/kavach.instructions.md`
5. **Begin development**: Start with crash detection feature

---

## 📞 Support & Troubleshooting

For issues:
1. Check this guide's "Common Issues" section
2. Run `flutter doctor` for diagnostic info
3. Check backend logs: `npm run dev` output
4. Search issue on StackOverflow
5. Open GitHub issue with full error logs

---

## 🎯 Quick Start Command (Copy-Paste)

```bash
# Git clone and setup
git clone https://github.com/preetbiswas12/Kavach.git
cd Kavach

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev &

# Mobile setup (in new terminal)
cd ../mobile
flutter pub get
flutter run -d web

# Wait for success messages ✅
```

---

**Happy Coding! 🛡️**
