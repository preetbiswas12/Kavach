# Kavach Project Context Mapping - Session Memory

**Session Start**: April 5, 2026  
**Purpose**: Maintain persistent session memory for all Kavach development work  
**Master Location**: Project root (updated after each generation)  
**Session Backup**: `/memories/session/context_mapping.md`

---

## Generation 1: Initial Instructions & Context Setup

Created comprehensive workspace instructions file (`.github/instructions/kavach.instructions.md`) to establish consistent coding conventions and prevent Copilot hallucination across the entire Kavach emergency response system. This generation involved exploration of the project specification from README.md to identify the tech stack (Flutter mobile, Node.js backend, Python ML, PostgreSQL/MongoDB) and architectural patterns.

The instructions document codifies naming conventions for all five languages used in the project (Dart, JavaScript, Python, Kotlin, Swift), establishes layered architecture for backend, MVVM+Riverpod pattern for mobile, and provides comprehensive API design guidelines using REST with `/api/v1/` versioning. Key patterns include feature-based organization for mobile, layered controller-service-model for backend, and TensorFlow Lite for ML components.

Testing standards were documented with Jest for backend (unit/integration/E2E at 80%+ coverage) and Flutter testing for mobile (unit/widget/integration). Git workflow follows conventional commits with feature/bugfix/docs branch naming. A critical "anti-hallucination" section was added to ground Copilot in concrete facts from the project specification, preventing invention of non-existent APIs, files, or features.

Files created:
- `.github/instructions/kavach.instructions.md` (comprehensive, 400+ line conventions guide)

Key decisions: Workspace-scoped instructions (not user-profile) to keep conventions centralized in the repo; comprehensive coverage of all five languages despite early project stage to establish patterns before implementation begins; explicit anti-hallucination section to address user's concern about Copilot inventing features.

Project is currently in pre-development specification phase with only README.md content. Architecture specifies flutter + node.js + python + databases but no code implementation yet.

---

## Generation 2: App Scaffold & Installation Guide

Scaffolded the entire Kavach project structure with complete directory hierarchy and created a comprehensive installation guide, **eliminating Kotlin entirely as requested by user** due to Gradle collision concerns. The user explicitly stated "I don't want to use kotlin personally because it has so much collisions with gradle", so the project now uses pure Flutter (95% Dart code) for both Android and iOS, with minimal Swift for iOS platform channels if needed. This eliminates the Gradle/Kotlin complexity entirely while maintaining full cross-platform functionality.

**Mobile App Structure** (`mobile/` directory) - 17 new directories created:
- Feature modules: crash_detection, theft_protection, emergency_response, user_management (each with presentation/data/domain layers)
- Core modules: theme, config, constants, errors, utils
- Test directories: unit, widget tests
- pubspec.yaml with complete production dependencies: Riverpod 2.4.0 (state management), Dio 5.3.0 (HTTP), location & sensors packages, Firebase integration (auth, messaging, analytics), camera/image picker, local notifications, Google Maps, Hive (local database), Sentry (error tracking)
- main.dart entry point with MaterialApp, Riverpod ProviderScope, and home screen scaffold with three action buttons
- app_theme.dart implementing Material Design 3 with light/dark themes, custom AppBar, button styles, input decoration, card themes
- app_config.dart for centralized configuration with environment variables and get methods for API URLs
- logger.dart with structured logging using Logger package with PrettyPrinter, including specialized log methods for events, exceptions, API calls, sensor data, crash detection, theft protection

**Backend Structure** (`backend/` directory) - 7 new directories created:
- Express.js server with Socket.io integration
- Directory structure: routes, controllers, services, models, middleware, config, utils
- package.json with 30+ dependencies: Express 4.18.2, Socket.io 4.6.1, Mongoose (MongoDB), Sequelize (PostgreSQL), Redis, Firebase Admin, Twilio, Axios, UUID, Winston, Joi validation, bcryptjs, JWT
- src/index.js featuring: Helmet security, CORS with environment variable origin control, rate limiting, health check endpoint, test endpoint, Socket.io event handlers (incident:fire, location:update, disconnect), comprehensive error handling middleware with proper status codes and consistent JSON response format
- .env.example with 40+ configuration options for databases, APIs, JWT, AWS, email, monitoring

**ML Directory Structure** (`ml/` directory) - 3 new directories created:
- models/ - for trained TensorFlow Lite (.tflite) files
- training/ - for training scripts
- inference/ - for inference wrappers

**Installation & Prerequisites Guide** (`installation_and_prerequisites.md` at project root):
- 380+ lines comprehensive installation documentation
- Prominent note: "Kotlin Usage: ❌ NOT USED - Pure Flutter + Swift only" and commitment to avoiding Gradle
- System requirements section (8GB+ RAM, 50GB disk, Windows 10+/macOS 12+/Ubuntu 20.04+)
- Step-by-step instructions for ALL developers (Git, Node.js, Flutter, Android Studio, VS Code)
- Separate sections: Backend setup (PostgreSQL, MongoDB, Redis initialization), Mobile setup (Android emulator and iOS simulator), ML setup (Python virtual environment, TensorFlow)
- Full database initialization commands
- Environment variables reference with security warnings (JWT_SECRET, PostgreSQL passwords marked "MUST CHANGE")
- "Common Issues & Solutions" section addressing Flutter PATH setup, port conflicts, CocoaPods, MongoDB connection, explicitly mentioning "Flutter: Gradle build failed - AVOIDED (No Kotlin!)"
- Verification checklist with exact commands to test each component
- "Running the Full Stack" section showing how to start all 3 terminals (backend, mobile, web)
- Tech stack preference table showing pure Flutter, no Kotlin for Android
- Quick start copy-paste commands

Files created (25 total):
- `.github/instructions/kavach.instructions.md` - conventions (generation 1)
- `mobile/pubspec.yaml` - Flutter dependencies
- `mobile/lib/main.dart` - app entry point
- `mobile/lib/core/theme/app_theme.dart` - Material Design 3 themes
- `mobile/lib/core/config/app_config.dart` - configuration management
- `mobile/lib/core/utils/logger.dart` - structured logging
- `mobile/.env.example` - mobile configuration template
- `backend/package.json` - npm dependencies
- `backend/src/index.js` - Express server with Socket.io
- `backend/.env.example` - backend configuration template
- `installation_and_prerequisites.md` - root-level installation guide
- 16 empty feature/module directories with proper MVVM structure

Key architectural decisions made:
- **No Kotlin**: Pure Flutter handles all Android compilation, no Gradle build conflicts
- **Swift minimal**: Only used for iOS platform channels if absolutely necessary
- **State management**: Riverpod 2.4.0 (hooks_riverpod) for all state, no BLoC
- **Database dual-stack**: MongoDB for users/settings, PostgreSQL with PostGIS for geo-spatial incidents
- **Real-time**: Socket.io for live location updates, incident broadcasting, ambulance ETA
- **Material Design 3**: Out-of-the-box modern UI with light/dark themes
- **Clean Architecture**: Feature-based organization with clear separation between presentation, data, and domain layers
- **Error handling**: Consistent JSON responses with status, message, data, error fields
- **Logging**: Structured logging with severity levels for crash detection, API calls, sensor data

Project status after generation 2:
- ✅ Complete directory scaffolding ready
- ✅ Core infrastructure files in place (main.dart, app_theme, app_config, logger)
- ✅ Backend server foundation with Socket.io
- ✅ Installation guide for all platforms (Windows/macOS/Linux)
- ✅ Environment configuration templates created
- ⏳ Ready for: API endpoint implementation, feature module development, ML model training
- 📝 Next: Implement crash detection service, emergency contact management, hospital search API
