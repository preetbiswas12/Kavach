---
name: kavach
description: "Kavach project conventions guide. Use when: implementing features, writing code, designing APIs, organizing components, reviewing code, or debugging. Enforces naming conventions, architectural patterns, code organization, testing standards, and git workflows across the entire Kavach emergency response system."
---

# Kavach Project Conventions & Guidelines

**Project**: Kavach - AI-powered proactive emergency response system for India  
**Status**: Pre-development (specification phase)  
**Scope**: Applies to entire project (mobile, backend, ML, DevOps)  
**Target**: Personal use; grounded in documented architecture from README

---

## 🎯 Project Context & Goals

Kavach is an intelligent emergency response system with three core objectives:

1. **Crash Detection**: Detect vehicle accidents within 2 seconds, call ambulance within 30 seconds
2. **Theft Protection**: Track stolen phones even when powered off
3. **Family Alerts**: Notify emergency contacts instantly, select optimal hospital based on traffic

The system spans multiple platforms (Flutter mobile, Node.js backend, Python ML, PostgreSQL/MongoDB databases) working together to provide zero-touch emergency response.

---

## 📝 NAMING CONVENTIONS

### Dart / Flutter (Mobile)
- **Classes**: PascalCase (e.g., `CrashDetector`, `EmergencyContactWidget`, `LocationService`)
- **Functions/Methods**: camelCase (e.g., `detectCrash()`, `notifyEmergencyContacts()`, `calculateAmbulanceETA()`)
- **Variables/Properties**: camelCase (e.g., `crashScore`, `userLocation`, `ambulanceEta`)
- **Files**: snake_case (e.g., `crash_detector.dart`, `emergency_contact_widget.dart`, `location_service.dart`)
- **Widgets**: Suffix with `Widget` or `Screen` (e.g., `CrashAlertWidget`, `HospitalSelectionScreen`)
- **Providers (Riverpod)**: Suffix with `Provider` (e.g., `userProvider`, `incidentProvider`, `locationProvider`)
- **Enums**: PascalCase (e.g., `EmergencyType`, `IncidentSeverity`, `NotificationChannel`)

### JavaScript / Node.js (Backend)
- **Classes**: PascalCase (e.g., `CrashDetectionService`, `EmergencyNotifier`, `HospitalSearchService`)
- **Functions**: camelCase (e.g., `detectCrash()`, `notifyContacts()`, `selectOptimalHospital()`)
- **Variables**: camelCase (e.g., `crashScore`, `incidentCount`, `maxRetryAttempts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_CRASH_FORCE`, `AMBULANCE_RESPONSE_TIME`, `LOCATION_ACCURACY_THRESHOLD`)
- **Files**: camelCase (e.g., `crashDetectionService.js`, `emergencyNotifier.js`)
- **API Routes**: kebab-case with resource-oriented naming (e.g., `GET /api/v1/incidents`, `POST /api/v1/emergency-responses`, `PUT /api/v1/users/:userId/profile`)

### Kotlin (Android Native Modules)
- **Classes**: PascalCase (e.g., `SensorFusionManager`, `CrashAlgorithm`)
- **Functions**: camelCase (e.g., `detectCrash()`, `fuseSensorData()`)
- **Constants**: UPPER_SNAKE_CASE in `companion object` (e.g., `const val MAX_ACCELEROMETER_FORCE = 50F`)
- **Files**: PascalCase matching class name (e.g., `SensorFusionManager.kt`)

### Swift (iOS Native Modules)
- **Classes**: PascalCase (e.g., `CrashDetector`, `LocationTracker`)
- **Functions**: camelCase (e.g., `detectCrash()`, `getDeviceLocation()`)
- **Constants**: lowerCamelCase with `let` (e.g., `let maxCrashForce = 50.0`)
- **Files**: PascalCase matching class name (e.g., `CrashDetector.swift`)

### Python (ML & Backend Utilities)
- **Classes**: PascalCase (e.g., `CrashDetectionModel`, `LocationPredictor`)
- **Functions**: snake_case (e.g., `detect_crash()`, `predict_location()`, `calculate_confidence()`)
- **Variables**: snake_case (e.g., `crash_score`, `location_accuracy`, `model_version`)
- **Files**: snake_case (e.g., `crash_detection_model.py`, `location_predictor.py`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_MODEL_INFERENCE_TIME`, `MIN_CONFIDENCE_THRESHOLD`)

### Database Schema
- **Collections/Tables**: snake_case, plural (e.g., `users`, `incidents`, `location_history`, `emergency_contacts`, `hospital_data`)
- **Fields**: snake_case (e.g., `user_id`, `crash_score`, `created_at`, `ambulance_called`)
- **Indexes**: `idx_<table>_<field>` (e.g., `idx_incidents_user_id`, `idx_location_history_created_at`)
- **Foreign Keys**: `fk_<table>_<column>` (e.g., `fk_incidents_user_id`, `fk_emergency_contacts_user_id`)
- **Enums/Status Fields**: lowercase with underscores (e.g., `severity: 'low'|'medium'|'high'|'critical'`, `incident_type: 'crash'|'theft'|'sos'`)

---

## 🏛️ ARCHITECTURAL PATTERNS

### Mobile (Flutter) - MVVM with Riverpod
**Directory Structure**:
```
lib/
├── features/              # Feature-based modules
│   ├── crash_detection/
│   │   ├── presentation/  # UI, screens, widgets
│   │   ├── data/         # Repositories, models, datasources
│   │   └── domain/       # Entities, usecases, abstract repos
│   ├── theft_protection/
│   ├── emergency_response/
│   └── user_management/
├── core/                  # Shared cross-feature code
│   ├── theme/            # Material Design 3 theme
│   ├── constants/        # App-wide constants
│   ├── config/           # Configuration (API endpoints, etc.)
│   ├── errors/           # Custom exceptions, error handling
│   └── utils/            # Shared utilities & extensions
└── main.dart             # App entry point
```

**Key Patterns**:
- **Separation of Concerns**: Presentation → Domain → Data layers (clean architecture)
- **State Management**: Use Riverpod providers for all state; avoid BLoC where Riverpod can do it
- **Repositories**: Abstract data access; mobile code operates through repositories, never direct API calls
- **Models**: Immutable (use `copyWith()` for modifications)
- **Error Handling**: Define custom exceptions in `core/errors/`; use `.when()` for Riverpod consumer error states

**Example File Naming**:
- `crash_detection_provider.dart` - Riverpod provider definition
- `crash_detector_screen.dart` - Top-level screen widget
- `crash_severity_widget.dart` - Reusable widget component
- `crash_detection_repository.dart` - Data access abstraction
- `crash_incident_model.dart` - Data model with JSON serialization
- `crash_incident_entity.dart` - Domain entity (clean architecture)

### Backend (Node.js/Express) - Layered Architecture
**Directory Structure**:
```
src/
├── routes/        # Express route definitions (HTTP endpoints)
├── controllers/   # Request handling & orchestration (call services)
├── services/      # Business logic, algorithms, external integrations
├── models/        # Data schemas, validation (Mongoose, Sequelize)
├── middleware/    # Authentication, validation, error handling
├── config/        # Environment variables, database connections
├── utils/         # Helper functions, formatters, validators
└── index.js       # Express app setup & startup
```

**Request Flow**: Route → Controller → Service → Model → Database

**Key Patterns**:
- **Services Encapsulate Logic**: Each business domain has a service (e.g., `CrashDetectionService`, `HospitalSearchService`, `NotificationService`)
- **Error Middleware**: Centralized error handling; services throw errors, middleware catches & formats responses
- **Status Codes**: Use correct HTTP status codes (200 success, 201 created, 400 bad request, 401 unauthorized, 404 not found, 500 server error)
- **Async/Await**: Prefer async/await over callbacks; use try/catch consistently
- **Response Format**: All responses should be consistent JSON: `{ data, status, message, error }`

**Example File Naming**:
- `routes/crashDetection.js` - Route definitions
- `controllers/crashDetectionController.js` - Request handling
- `services/crashDetectionService.js` - Core business logic
- `models/Incident.js` - Data schema (Mongoose or Sequelize)
- `middleware/authMiddleware.js` - Auth enforcement

### Python (ML Training & Utilities)
**Directory Structure**:
```
ml/
├── models/           # Trained TensorFlow Lite models (.tflite)
│   ├── crash_detection_v1.tflite
│   └── location_prediction_v1.tflite
├── training/         # Training scripts
│   ├── crash_training.py
│   ├── location_training.py
│   └── requirements.txt
├── inference/        # Inference wrappers (used by backend/mobile)
│   ├── crash_detector.py
│   └── location_predictor.py
└── README.md         # Model documentation
```

**Key Patterns**:
- **TensorFlow Lite**: Export models as `.tflite` for mobile/edge deployment
- **Versioning**: Name trained models with version (e.g., `crash_detection_v1.tflite`)
- **Inference Wrappers**: Python classes that wrap model inference for backend/mobile integration

---

## 📐 API DESIGN CONVENTIONS

### Versioning & Base URL
- **Base URL**: All endpoints prefixed with `/api/v1/`
- **Example**: `https://kavach-backend.com/api/v1/incidents`

### HTTP Methods & Resource-Oriented Design
```javascript
// Incidents
GET    /api/v1/incidents           // List all incidents for user
GET    /api/v1/incidents/:id       // Get specific incident details
POST   /api/v1/incidents           // Create new incident (crash/theft/SOS)
PUT    /api/v1/incidents/:id       // Update incident status
DELETE /api/v1/incidents/:id       // Archive/delete incident

// Emergency Contacts
GET    /api/v1/users/:userId/emergency-contacts           // List emergency contacts
POST   /api/v1/users/:userId/emergency-contacts           // Add contact
PUT    /api/v1/users/:userId/emergency-contacts/:contactId // Update contact
DELETE /api/v1/users/:userId/emergency-contacts/:contactId // Remove contact

// Hospital Search & Selection
GET    /api/v1/hospitals?lat=:lat&lng=:lng&radius=:radius // Find nearby hospitals
GET    /api/v1/hospitals/:hospitalId                      // Hospital details
POST   /api/v1/incidents/:incidentId/select-hospital      // Select for incident

// User Profile
GET    /api/v1/users/:userId/profile        // Get user profile
PUT    /api/v1/users/:userId/profile        // Update profile
POST   /api/v1/users/:userId/settings       // Update settings (enable/disable features)
GET    /api/v1/users/:userId/settings       // Get settings
```

### Request Format
**All requests use JSON**:
```javascript
// POST /api/v1/incidents
{
  "incidentType": "crash",        // 'crash', 'theft', 'sos'
  "location": {
    "latitude": 28.7041,
    "longitude": 77.1025
  },
  "crashData": {
    "accelerationForce": 85.5,
    "direction": "forward"
  }
}
```

### Response Format
**All responses must follow this structure**:
```javascript
{
  "status": "success",              // 'success', 'error'
  "message": "Incident created successfully",
  "data": {
    "incidentId": "uuid-string",
    "ambulanceETA": 5,              // minutes
    "hospitalSelected": {...}
  },
  "error": null                     // null on success, error object on failure
}
```

**Error Response**:
```javascript
{
  "status": "error",
  "message": "Invalid incident type",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "incidentType",
      "reason": "Must be one of: crash, theft, sos"
    }
  }
}
```

### Status Codes
- **200 OK**: Successful GET, PUT
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Invalid input, validation failure
- **401 Unauthorized**: Missing/invalid authentication token
- **403 Forbidden**: Authenticated but not authorized for resource
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side error

### Real-Time Communication (Socket.io)
- **Event: `incident:alert`** - Broadcast emergency alert to dispatchers
- **Event: `location:update`** - Push location updates during active incident
- **Event: `ambulance:arrival-time`** - Update ETA to ambulance arrival
- **Event: `incident:resolved`** - Mark incident as resolved
- **Authentication**: Verify socket connection with JWT token

---

## 🧪 TESTING & QUALITY STANDARDS

### Backend Testing (Jest)
**File Naming & Location**:
- Unit tests: `src/__tests__/unit/<module>.test.js`
- Integration tests: `src/__tests__/integration/<module>.integration.test.js`
- E2E tests: `e2e/<feature>.e2e.test.js`

**Test Structure**:
```javascript
describe('CrashDetectionService', () => {
  describe('detectCrash', () => {
    it('should detect crash when acceleration exceeds threshold', () => {
      // Arrange, Act, Assert (AAA pattern)
    });

    it('should not detect false positive on sudden braking', () => {
      // Test false negative prevention
    });
  });
});
```

**Coverage Requirements**:
- **Unit Tests**: 80%+ code coverage; cover happy path, edge cases, error cases
- **Integration Tests**: Key workflows (user registration → incident creation → notification)
- **E2E Tests**: Critical user journeys (crash detection → ambulance dispatch → hospital selection)

**Mocking Strategy**:
- Mock external services (Twilio, Firebase, Google Maps, Ambulance API)
- Use real database during integration tests (sqlite in-memory or test database)
- Mock geolocation and sensor data for crash detection tests

### Mobile Testing (Flutter)
**File Naming & Location**:
- Unit tests: `test/<feature>_test.dart`
- Widget tests: `test/<feature>_widget_test.dart`
- Integration tests: `integration_test/<feature>_integration_test.dart`

**Test Structure**:
```dart
void main() {
  group('CrashDetector', () {
    test('should detect crash with high acceleration', () {
      // Test logic
    });

    testWidgets('CrashAlertWidget shows danger level', (WidgetTester tester) async {
      // Widget test
    });
  });
}
```

**Coverage Requirements**:
- **Unit Tests**: 70%+ for business logic, algorithms, utilities
- **Widget Tests**: Critical UI components (alerts, notifications, forms)
- **Integration Tests**: Full user flows from splash screen to incident reporting

**Mocking**:
- Mock API services using Mockito
- Mock Riverpod providers in widget tests
- Mock device sensors (accelerometer, gyroscope) with test data

### Code Quality Standards
- **Linting**: Follow language-specific linters (Dart: `dart analyze`, JavaScript: `ESLint`, Python: `pylint`)
- **Formatting**: Automatic formatting (Dart: `dart format`, JavaScript: `Prettier`)
- **Type Safety**: Enforce strict typing (Dart: strict mode, TypeScript for backend if possible)
- **Documentation**: JSDoc for backend, dartdoc for mobile, docstrings for Python
- **No Hallucination**: Tests must use concrete, project-specific data; never mock generic or invented scenarios

---

## 🔄 GIT WORKFLOW & COMMIT CONVENTIONS

### Branch Naming
```
feature/<kebab-case-feature>      # New features (e.g., feature/crash-detection-service)
bugfix/<kebab-case-bug>           # Bug fixes (e.g., bugfix/false-positive-detection)
docs/<description>                # Documentation updates (e.g., docs/api-reference)
refactor/<kebab-case-refactor>    # Code refactoring (e.g., refactor/db-connection-pooling)
chore/<kebab-case-chore>          # Maintenance (e.g., chore/update-dependencies)
hotfix/<kebab-case-hotfix>        # Critical production fixes (e.g., hotfix/notification-crash)
```

### Commit Message Format (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring without changing behavior
- `test`: Adding or updating tests
- `chore`: Build, dependencies, tooling
- `perf`: Performance improvement

**Scope** (optional): Component or module affected
- `crash-detection`, `notification-service`, `hospital-search`, `mobile-ui`, `backend-api`, etc.

**Subject**:
- Use imperative mood ("add feature" not "added feature")
- Lowercase first letter
- No period at end
- Max 50 characters

**Examples**:
```
feat(crash-detection): add multi-sensor fusion algorithm
fix(notification): prevent duplicate emergency alerts
docs(api): update incident response format
refactor(hospital-search): improve geolocation accuracy
test(crash-detector): add edge case for low-speed collisions
```

### Pull Request Workflow
1. Create feature branch from `main`
2. Commit regularly with meaningful messages
3. Push to remote
4. Create PR with description of changes
5. Request review from team members
6. Ensure all checks pass (tests, linting, coverage)
7. Merge after approval; delete feature branch

### Pre-Commit Checks
Run locally before pushing:
- **Linting**: `npm run lint` (backend), `dart analyze` (mobile)
- **Tests**: `npm test` (backend), `flutter test` (mobile)
- **Formatting**: `npm run format` (backend), `dart format` (mobile)

---

## ⚠️ CRITICAL GROUNDING RULES (Anti-Hallucination)

To prevent Copilot from inventing non-existent code, files, or patterns:

1. **API Endpoints**: Only suggest endpoints defined in API Design section above
2. **Directory Structures**: Follow exact paths in Architectural Patterns section
3. **File Names**: Use exact naming conventions specified for each language
4. **Error Handling**: Reference only error types and codes documented in backend
5. **Third-Party Services**: Only reference services documented (Firebase, Twilio, Google Maps, SendGrid)
6. **Database**: Only reference tables/collections from planned schema in README
7. **No Invented Features**: Don't suggest features not in core objectives (crash detection, theft tracking, family alerts)
8. **Configuration Variables**: Only reference `.env` variables documented in config section
9. **Constants**: Define constants explicitly before use; don't invent magic numbers
10. **Test Data**: Use realistic, project-specific test data; avoid generic or invented scenarios

---

## 📚 Quick Reference by Language

| Language | Classes | Functions | Variables | Files | Key Pattern |
|----------|---------|-----------|-----------|-------|-------------|
| **Dart** | `PascalCase` | `camelCase` | `camelCase` | `snake_case` | MVVM + Riverpod |
| **JavaScript** | `PascalCase` | `camelCase` | `camelCase` | `camelCase` | Layered Architecture |
| **Python** | `PascalCase` | `snake_case` | `snake_case` | `snake_case` | TensorFlow Lite |
| **Kotlin** | `PascalCase` | `camelCase` | `camelCase` | `PascalCase` | Native Android |
| **Swift** | `PascalCase` | `camelCase` | `camelCase` | `PascalCase` | Native iOS |
| **SQL** | — | — | `snake_case` | `snake_case` | Relational Schema |

---

## 🔗 References

- **README.md**: Project vision, problem statement, core features
- **Tech Stack**: Flutter, Node.js/Express, MongoDB/PostgreSQL, TensorFlow Lite, Firebase, AWS
- **Core Services**: Crash detection, hospital search, emergency notifications, location tracking
- **Team**: Personal project (conventions enforced for consistency and preventing AI hallucination)
