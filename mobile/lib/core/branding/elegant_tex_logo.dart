import 'package:flutter/material.dart';

/// Elegant Tex brand palette (from the Logo Kit design). These are fixed brand
/// colours — independent of the app's light/dark theme.
const Color kBrandPink = Color(0xFFC2186B);
const Color kBrandPinkLight = Color(0xFFCF93AC);
const Color kBrandPinkDark = Color(0xFF9C1456);

/// The Elegant Tex "ET" monogram, drawn as vector rectangles (no asset, crisp at
/// any size). Duotone by default (deep + light pink); pass [mono] for a single
/// colour, e.g. tinting to [monoColor] for a favicon/nav glyph.
class ElegantTexMark extends StatelessWidget {
  const ElegantTexMark({
    super.key,
    this.height = 40,
    this.mono = false,
    this.monoColor,
  });

  final double height;
  final bool mono;
  final Color? monoColor;

  static const double _vbW = 650;
  static const double _vbH = 520;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: height * _vbW / _vbH,
      height: height,
      child: CustomPaint(
        painter: _MarkPainter(mono: mono, monoColor: monoColor ?? kBrandPink),
      ),
    );
  }
}

class _MarkPainter extends CustomPainter {
  _MarkPainter({required this.mono, required this.monoColor});

  final bool mono;
  final Color monoColor;

  // viewBox 0 0 650 520 — rectangles forming the ET monogram.
  static const List<List<double>> _deep = [
    [300, 0, 350, 95],
    [470, 0, 85, 375],
    [0, 140, 425, 95],
    [0, 280, 95, 240],
    [0, 280, 395, 95],
    [0, 425, 395, 95],
  ];
  static const List<List<double>> _light = [
    [0, 0, 95, 95],
    [150, 0, 95, 95],
    [425, 425, 95, 95],
    [555, 425, 95, 95],
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final sx = size.width / ElegantTexMark._vbW;
    final sy = size.height / ElegantTexMark._vbH;
    final deepPaint = Paint()..color = mono ? monoColor : kBrandPink;
    final lightPaint = Paint()..color = mono ? monoColor : kBrandPinkLight;

    void draw(List<List<double>> rects, Paint p) {
      for (final r in rects) {
        canvas.drawRect(Rect.fromLTWH(r[0] * sx, r[1] * sy, r[2] * sx, r[3] * sy), p);
      }
    }

    draw(_deep, deepPaint);
    draw(_light, lightPaint);
  }

  @override
  bool shouldRepaint(_MarkPainter old) => old.mono != mono || old.monoColor != monoColor;
}

/// The "ELEGANT TEX" wordmark. "ELEGANT" adopts the theme's text colour; "TEX"
/// stays brand pink — so it reads on both light and dark surfaces.
class ElegantTexWordmark extends StatelessWidget {
  const ElegantTexWordmark({super.key, this.fontSize = 22});
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final onSurface = Theme.of(context).textTheme.titleLarge?.color;
    return Text.rich(
      TextSpan(
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w800,
          letterSpacing: fontSize * 0.03,
          height: 1.0,
        ),
        children: [
          TextSpan(text: 'ELEGANT ', style: TextStyle(color: onSurface)),
          const TextSpan(text: 'TEX', style: TextStyle(color: kBrandPink)),
        ],
      ),
    );
  }
}

/// Mark + wordmark lockup. Horizontal for header/footer bars; vertical (stacked)
/// for login/splash. [tagline] adds the "NO.1 SOFA COVER BRAND" line.
class ElegantTexLogo extends StatelessWidget {
  const ElegantTexLogo({
    super.key,
    this.direction = Axis.horizontal,
    this.markHeight = 42,
    this.wordmarkSize = 22,
    this.tagline = false,
  });

  final Axis direction;
  final double markHeight;
  final double wordmarkSize;
  final bool tagline;

  @override
  Widget build(BuildContext context) {
    final mark = ElegantTexMark(height: markHeight);
    final wordmark = ElegantTexWordmark(fontSize: wordmarkSize);
    const taglineWidget = Text(
      'NO.1 SOFA COVER BRAND',
      style: TextStyle(
        color: kBrandPink,
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.8,
      ),
    );

    if (direction == Axis.horizontal) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [mark, SizedBox(width: markHeight * 0.34), wordmark],
      );
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        SizedBox(height: markHeight * 0.28),
        wordmark,
        if (tagline) ...[const SizedBox(height: 10), taglineWidget],
      ],
    );
  }
}
