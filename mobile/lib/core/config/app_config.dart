/// Application configuration loaded from environment variables
class AppConfig {
  static late String backendUrl;
  static late String backendSocketUrl;
  static late String apiVersion;
  static late String googleMapsApiKey;
  static late String firebaseProjectId;
  static late bool crashDetectionEnabled;
  static late double crashAccelerationThreshold;
  static late int crashDetectionTimeoutSeconds;
  static late int ambulanceCountdownSeconds;
  static late bool theftProtectionEnabled;
  static late double theftGpsAccuracyThreshold;
  static late int theftLocationUpdateIntervalSeconds;
  static late int theftPhotoCaptureIntervalSeconds;
  static late bool enableCrashReporting;
  static late bool enableAnalytics;
  static late String appEnv;
  static late String logLevel;

  /// Initialize configuration from environment
  static Future<void> initialize() async {
    // TODO: Load from .env file using dotenv package
    // For now, using defaults

    backendUrl = 'http://localhost:3000';
    backendSocketUrl = 'http://localhost:3000';
    apiVersion = 'v1';
    googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    firebaseProjectId = 'YOUR_FIREBASE_PROJECT_ID';
    
    crashDetectionEnabled = true;
    crashAccelerationThreshold = 4.0;
    crashDetectionTimeoutSeconds = 10;
    ambulanceCountdownSeconds = 30;
    
    theftProtectionEnabled = true;
    theftGpsAccuracyThreshold = 10.0;
    theftLocationUpdateIntervalSeconds = 10;
    theftPhotoCaptureIntervalSeconds = 30;
    
    enableCrashReporting = true;
    enableAnalytics = true;
    appEnv = 'development';
    logLevel = 'debug';
  }

  /// Check if running in production
  static bool get isProduction => appEnv == 'production';

  /// Check if running in development
  static bool get isDevelopment => appEnv == 'development';

  /// Get full API URL with version
  static String getApiUrl(String endpoint) {
    return '$backendUrl/api/$apiVersion$endpoint';
  }
}
