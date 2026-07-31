import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Sistema de marca TuDestino: azul + blanco, tipografía liviana, sin
/// degradados.
class AppTheme {
  static const Color primaryColor = Color(0xFF034EA2); // Azul TuDestino
  static const Color primaryDark = Color(0xFF023A7A);
  static const Color secondaryColor = Color(0xFF00ADEF); // Celeste
  static const Color accentColor = Color(0xFFFFCA01); // Amarillo (acentos puntuales: badges, ratings, CTA)
  static const Color ink = Color(0xFF1C1A17);
  static const Color mute = Color(0xFF78716C);
  // Neutros fríos (azulados), NO cálidos - para no leerse amarillento junto
  // al azul de marca.
  static const Color sand = Color(0xFFF4F6F8);
  static const Color line = Color(0xFFE7EBEF);

  static const Color textPrimary = ink;
  static const Color textSecondary = mute;
  static const Color borderColor = line;

  static TextTheme get _textTheme => TextTheme(
        displayLarge: GoogleFonts.bricolageGrotesque(
          fontSize: 32,
          fontWeight: FontWeight.w500,
          letterSpacing: -0.5,
          color: ink,
        ),
        displayMedium: GoogleFonts.bricolageGrotesque(
          fontSize: 26,
          fontWeight: FontWeight.w500,
          letterSpacing: -0.3,
          color: ink,
        ),
        titleLarge: GoogleFonts.bricolageGrotesque(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: ink,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: ink,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w300,
          color: ink,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w300,
          color: mute,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: mute,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: ink,
        ),
      );

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    primaryColor: primaryColor,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      secondary: secondaryColor,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: Colors.white,
    fontFamily: GoogleFonts.inter().fontFamily,
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: ink,
      elevation: 0,
      centerTitle: false,
      surfaceTintColor: Colors.white,
      titleTextStyle: GoogleFonts.bricolageGrotesque(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: ink,
      ),
    ),
    textTheme: _textTheme,
    iconTheme: const IconThemeData(color: ink, size: 22),
    dividerTheme: const DividerThemeData(color: line, thickness: 1),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: line),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: sand,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      hintStyle: GoogleFonts.inter(fontWeight: FontWeight.w300, color: mute),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        textStyle: GoogleFonts.inter(fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(100),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: ink,
        side: const BorderSide(color: line),
        textStyle: GoogleFonts.inter(fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(100),
        ),
      ),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: primaryColor,
      unselectedItemColor: mute,
      selectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500),
      unselectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w400),
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
  );

  static ThemeData darkTheme = ThemeData.dark().copyWith(
    primaryColor: primaryColor,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      secondary: secondaryColor,
      brightness: Brightness.dark,
    ),
  );
}
