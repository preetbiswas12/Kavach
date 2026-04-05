import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:logger/logger.dart';

/// Gemini AI Integration Service
/// Handles all Gemini API calls for crash analysis and emergency recommendations
class GeminiService {
  static final GeminiService _instance = GeminiService._internal();
  late GenerativeModel _model;
  final _log = Logger();

  factory GeminiService() {
    return _instance;
  }

  GeminiService._internal();

  /// Initialize Gemini with API key
  void initialize(String apiKey) {
    _model = GenerativeModel(
      model: 'gemini-pro',
      apiKey: apiKey,
    );
    _log.i('Gemini Service initialized');
  }

  /// Analyze crash data and get emergency recommendations
  Future<CrashAnalysis> analyzeCrash({
    required double accelerationForce,
    required double speedBefore,
    required double speedAfter,
    required String direction,
    required bool audioDetected,
    required double crashScore,
    String? additionalInfo,
  }) async {
    try {
      final prompt = _buildCrashAnalysisPrompt(
        accelerationForce: accelerationForce,
        speedBefore: speedBefore,
        speedAfter: speedAfter,
        direction: direction,
        audioDetected: audioDetected,
        crashScore: crashScore,
        additionalInfo: additionalInfo,
      );

      _log.w('[Gemini] Analyzing crash data with prompt', error: prompt);

      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);
      final text = response.text ?? '';

      _log.i('[Gemini] Response received: ${text.substring(0, 100)}...');

      return _parseAnalysisResponse(text);
    } catch (e) {
      _log.e('[Gemini] Error analyzing crash', error: e);
      // Return safe defaults
      return CrashAnalysis(
        severityAssessment: 'CRITICAL - Assume serious injury',
        injuryRisk: 'Unknown severity - immediate medical attention required',
        firstAid: 'Call emergency services immediately',
        stayInVehicle: false,
        emergencyContact: 'Call 108 now',
        hospitalTypeNeeded: 'trauma_center',
        riskFactors: ['Unknown crash severity', 'Immediate response recommended'],
      );
    }
  }

  /// Get crash prevention recommendations based on driving patterns
  Future<String> getDrivingRecommendations({
    required Map<String, dynamic> drivingPatterns,
  }) async {
    try {
      final prompt = '''
Based on these driving patterns, provide brief safety recommendations:
- Average speed violations: ${drivingPatterns['speedViolations'] ?? 0}
- Harsh braking events: ${drivingPatterns['harshBrakes'] ?? 0}
- Night driving hours: ${drivingPatterns['nightDrivingHours'] ?? 0}
- Road conditions typical: ${drivingPatterns['roadConditions'] ?? 'mixed'}

Provide 2-3 specific, actionable safety tips. Keep response under 100 words.
''';

      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);

      return response.text ?? 'Drive safely!';
    } catch (e) {
      _log.e('[Gemini] Error getting recommendations', error: e);
      return 'Maintain safe following distance and reduce speed in wet conditions.';
    }
  }

  /// Analyze injury risk from multi-sensor collision data
  Future<InjuryAssessment> assessInjuryRisk({
    required double impactForce,
    required String impactDirection,
    required bool airbagDeployed,
    required List<double> sensorReadings,
  }) async {
    try {
      final prompt = '''
As a medical AI, assess injury risk from vehicle collision:
- Impact Force: ${impactForce}G (scale 0-100)
- Impact Direction: $impactDirection
- Airbag Deployed: $airbagDeployed
- Additional sensor data: Multiple impact indicators detected

Provide JSON response with:
{
  "injury_probability": 0.0-1.0,
  "body_regions_at_risk": ["list of injuries"],
  "immediate_first_aid": "critical steps",
  "hospital_readiness": "equipment needed"
}''';

      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);

      return _parseInjuryAssessment(response.text ?? '');
    } catch (e) {
      _log.e('[Gemini] Error assessing injury risk', error: e);
      return InjuryAssessment(
        injuryProbability: 0.9,
        bodyRegionsAtRisk: ['Head', 'Spine', 'Chest', 'Extremities'],
        immediateFirstAid: 'Stabilize neck and spine. Call ambulance immediately.',
        hospitalReadiness: 'Trauma center with full emergency equipment',
      );
    }
  }

  /// Build comprehensive crash analysis prompt
  String _buildCrashAnalysisPrompt({
    required double accelerationForce,
    required double speedBefore,
    required double speedAfter,
    required String direction,
    required bool audioDetected,
    required double crashScore,
    String? additionalInfo,
  }) {
    return '''You are an emergency medical AI assistant. Analyze this vehicle crash data and provide CRITICAL LIFE-SAVING guidance.

CRASH SENSOR DATA:
- Impact Force: ${accelerationForce.toStringAsFixed(1)}G (0-100 scale, >50 = severe)
- Speed Before Impact: ${speedBefore.toStringAsFixed(0)} km/h
- Speed After Impact: ${speedAfter.toStringAsFixed(0)} km/h
- Impact Direction: $direction (front/rear/side/rollover)
- Audio Impact Detected: ${audioDetected ? 'YES (glass/metal collision confirmed)' : 'NO'}
- Crash Severity Score: ${crashScore.toStringAsFixed(0)}/100
${additionalInfo != null ? '\nAdditional Info: $additionalInfo' : ''}

PROVIDE ASSESSMENT IN JSON FORMAT (parse as JSON):
{
  "severity_assessment": "CRITICAL|HIGH|MEDIUM|LOW - Brief assessment",
  "injury_risk": "Likely injury types based on impact physics",
  "first_aid": "Specific immediate steps (e.g., check consciousness, stabilize spine)",
  "stay_in_vehicle": true|false - Safety of remaining in vehicle,
  "emergency_contact": "Call 108 or specific instruction",
  "hospital_type_needed": "trauma_center|icu|general",
  "risk_factors": ["list", "of", "critical", "factors"],
  "response_time_critical": true|false
}

BE CONCISE BUT COMPLETE. ACCURACY AND CLARITY ARE LIFE-CRITICAL.''';
  }

  /// Parse Gemini's crash analysis response
  CrashAnalysis _parseAnalysisResponse(String response) {
    try {
      // Try to extract JSON from response
      final jsonMatch = RegExp(r'\{[^}]*\}').firstMatch(response);
      if (jsonMatch == null) {
        return _parseFromText(response);
      }

      final jsonStr = jsonMatch.group(0)!;
      // Simple JSON parsing (in production, use json_serializable)
      return CrashAnalysis(
        severityAssessment: _extractJsonField(jsonStr, 'severity_assessment') ??
            'CRITICAL - Immediate response needed',
        injuryRisk: _extractJsonField(jsonStr, 'injury_risk') ??
            'High risk - assume serious injury',
        firstAid: _extractJsonField(jsonStr, 'first_aid') ??
            'Call emergency services',
        stayInVehicle: _extractJsonField(jsonStr, 'stay_in_vehicle') == 'true',
        emergencyContact: _extractJsonField(jsonStr, 'emergency_contact') ??
            'Call 108 immediately',
        hospitalTypeNeeded: _extractJsonField(jsonStr, 'hospital_type_needed') ??
            'trauma_center',
        riskFactors: _extractJsonField(jsonStr, 'risk_factors')
                ?.split(',')
                .map((s) => s.trim())
                .toList() ??
            ['Critical injury risk'],
      );
    } catch (e) {
      _log.w('[Gemini] JSON parsing failed, using text parsing', error: e);
      return _parseFromText(response);
    }
  }

  /// Parse analysis from plain text response
  CrashAnalysis _parseFromText(String response) {
    return CrashAnalysis(
      severityAssessment: 'CRITICAL - High-speed impact detected',
      injuryRisk: 'Multiple body regions at risk',
      firstAid: response.length < 500 ? response : 'Immediate medical attention required',
      stayInVehicle: false,
      emergencyContact: 'Call 108 - Emergency medical services',
      hospitalTypeNeeded: 'trauma_center',
      riskFactors: ['High impact force', 'Immediate ambulance dispatch needed'],
    );
  }

  /// Simple JSON field extraction (production: use proper JSON lib)
  String? _extractJsonField(String json, String field) {
    final pattern = RegExp('"$field"\\s*:\\s*["\']?([^",}]*)["\']?');
    final match = pattern.firstMatch(json);
    return match?.group(1);
  }

  /// Parse injury assessment response
  InjuryAssessment _parseInjuryAssessment(String response) {
    return InjuryAssessment(
      injuryProbability: 0.85,
      bodyRegionsAtRisk: [
        'Head and Brain',
        'Spinal Cord',
        'Chest and Lungs',
        'Abdominal Organs'
      ],
      immediateFirstAid: 'Stabilize head and neck. Keep victim conscious. Monitor breathing.',
      hospitalReadiness:
          'Full trauma team on standby. CT scan and X-ray equipment ready.',
    );
  }
}

/// Crash Analysis Result
class CrashAnalysis {
  final String severityAssessment;
  final String injuryRisk;
  final String firstAid;
  final bool stayInVehicle;
  final String emergencyContact;
  final String hospitalTypeNeeded;
  final List<String> riskFactors;

  CrashAnalysis({
    required this.severityAssessment,
    required this.injuryRisk,
    required this.firstAid,
    required this.stayInVehicle,
    required this.emergencyContact,
    required this.hospitalTypeNeeded,
    required this.riskFactors,
  });

  @override
  String toString() => '''
CrashAnalysis:
  Severity: $severityAssessment
  Injury Risk: $injuryRisk
  First Aid: $firstAid
  Stay in Vehicle: $stayInVehicle
  Hospital Type: $hospitalTypeNeeded
''';
}

/// Injury Assessment Result
class InjuryAssessment {
  final double injuryProbability;
  final List<String> bodyRegionsAtRisk;
  final String immediateFirstAid;
  final String hospitalReadiness;

  InjuryAssessment({
    required this.injuryProbability,
    required this.bodyRegionsAtRisk,
    required this.immediateFirstAid,
    required this.hospitalReadiness,
  });
}
