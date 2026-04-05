import 'package:logger/logger.dart';

/// Centralized logging service
final log = Logger(
  printer: PrettyPrinter(
    methodCount: 2,
    errorMethodCount: 8,
    lineLength: 120,
    colors: true,
    printEmojis: true,
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceMs,
  ),
);

/// Log levels
enum LogLevel {
  verbose,
  debug,
  info,
  warning,
  error,
  fatal,
}

/// Structured logging helpers
class AppLogger {
  static void logEvent(String event, {Map<String, dynamic>? data}) {
    log.i('EVENT: $event', error: data);
  }

  static void logException(Object exception, StackTrace stackTrace) {
    log.e('EXCEPTION', error: exception, stackTrace: stackTrace);
  }

  static void logApiCall(String method, String url, {int? statusCode}) {
    log.d('API: $method $url ${statusCode != null ? '→ $statusCode' : ''}');
  }

  static void logSensorData(String sensorName, dynamic data) {
    log.v('SENSOR: $sensorName → $data');
  }

  static void logCrashDetection(String stage, Map<String, dynamic> data) {
    log.w('CRASH_DETECTION: $stage', error: data);
  }

  static void logTheftProtection(String stage, Map<String, dynamic> data) {
    log.w('THEFT_PROTECTION: $stage', error: data);
  }
}
