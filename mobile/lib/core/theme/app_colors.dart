import 'package:flutter/material.dart';

/// Brand + surface palette. Dark values come from the mobile mock; light values
/// mirror the web's slate palette so web and app read as one product.
class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF007AFF);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);

  // Dark (mobile mock)
  static const Color darkBg = Color(0xFF0A0D13);
  static const Color darkSurface = Color(0xFF11151C);
  static const Color darkSurface2 = Color(0xFF1A1F29);
  static const Color darkBorder = Color(0xFF232935);
  static const Color darkText = Color(0xFFE8EBF1);
  static const Color darkMuted = Color(0xFF8A93A3);

  // Light (web slate)
  static const Color lightBg = Color(0xFFF1F5F9);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurface2 = Color(0xFFF8FAFC);
  static const Color lightBorder = Color(0xFFE2E8F0);
  static const Color lightText = Color(0xFF0F172A);
  static const Color lightMuted = Color(0xFF64748B);
}
