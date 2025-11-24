import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class FeedbackAnimations {
  // Animación de éxito para acciones completadas
  static Widget successAnimation({
    required Widget child,
    required VoidCallback onComplete,
    Duration duration = const Duration(milliseconds: 1500),
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: 0.8 + (value * 0.2),
          child: Opacity(
            opacity: value.clamp(0.0, 1.0),
            child: child,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.green.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.green.shade200, width: 2),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.check_circle,
              color: Colors.green.shade600,
              size: 24,
            ),
            const SizedBox(width: 12),
            Text(
              '¡Completado!',
              style: TextStyle(
                color: Colors.green.shade800,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    )
        .animate(delay: duration)
        .fadeOut(duration: 300.ms)
        .scale(end: const Offset(0.8, 0.8), duration: 300.ms)
        .then()
        .callback(callback: (_) => onComplete());
  }

  // Animación de error para acciones fallidas
  static Widget errorAnimation({
    required Widget child,
    required VoidCallback onComplete,
    Duration duration = const Duration(milliseconds: 2000),
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 500),
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: 0.9 + (value * 0.1),
          child: Opacity(
            opacity: value.clamp(0.0, 1.0),
            child: child,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.red.shade200, width: 2),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error,
              color: Colors.red.shade600,
              size: 24,
            ),
            const SizedBox(width: 12),
            Text(
              'Error',
              style: TextStyle(
                color: Colors.red.shade800,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    )
        .animate(delay: duration)
        .fadeOut(duration: 300.ms)
        .scale(end: const Offset(0.8, 0.8), duration: 300.ms)
        .then()
        .callback(callback: (_) => onComplete());
  }

  // Animación de carga con pulso
  static Widget loadingPulseAnimation({
    required Widget child,
    Duration duration = const Duration(milliseconds: 1500),
  }) {
    return child
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .scale(
          begin: const Offset(1, 1),
          end: const Offset(1.05, 1.05),
          duration: duration,
          curve: Curves.easeInOut,
        )
        .fade(
          begin: 1.0,
          end: 0.7,
          duration: duration,
          curve: Curves.easeInOut,
        );
  }

  // Animación de celebración para logros
  static Widget celebrationAnimation({
    required BuildContext context,
    required VoidCallback onComplete,
  }) {
    return Stack(
      children: [
        // Confetti animado
        ...List.generate(20, (index) {
          final randomX = (index * 37) % MediaQuery.of(context).size.width;
          final randomDelay = Duration(milliseconds: index * 100);

          return Positioned(
            left: randomX,
            top: -20,
            child: Icon(
              Icons.star,
              color: Colors.primaries[index % Colors.primaries.length],
              size: 20,
            )
                .animate(delay: randomDelay)
                .moveY(
                  begin: 0,
                  end: MediaQuery.of(context).size.height + 40,
                  duration: const Duration(milliseconds: 2000),
                  curve: Curves.easeOut,
                )
                .rotate(begin: 0, end: 2, duration: const Duration(milliseconds: 2000))
                .fadeOut(delay: const Duration(milliseconds: 1500), duration: 500.ms),
          );
        }),

        // Mensaje central
        Center(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.celebration,
                  color: Colors.orange,
                  size: 48,
                )
                    .animate()
                    .scale(duration: 500.ms, curve: Curves.elasticOut),
                const SizedBox(height: 16),
                const Text(
                  '¡Felicitaciones!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0A4B84),
                  ),
                )
                    .animate(delay: 200.ms)
                    .slideY(begin: 0.5, end: 0, duration: 400.ms)
                    .fadeIn(duration: 400.ms),
                const SizedBox(height: 8),
                const Text(
                  'Has completado todas las citas del día',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                )
                    .animate(delay: 400.ms)
                    .slideY(begin: 0.5, end: 0, duration: 400.ms)
                    .fadeIn(duration: 400.ms),
              ],
            ),
          )
              .animate(delay: const Duration(milliseconds: 2500))
              .fadeOut(duration: 500.ms)
              .scale(end: const Offset(0.8, 0.8), duration: 500.ms)
              .then()
              .callback(callback: (_) => onComplete()),
        ),
      ],
    );
  }

  // Animación de swipe con feedback táctil
  static Widget swipeFeedbackAnimation({
    required Widget child,
    required bool isSwiping,
    required bool swipeDirection, // true = right, false = left
  }) {
    if (!isSwiping) return child;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      transform: Matrix4.rotationZ(swipeDirection ? 0.1 : -0.1),
      transformAlignment: Alignment.center,
      child: child,
    )
        .animate()
        .scale(
          begin: const Offset(1, 1),
          end: const Offset(1.05, 1.05),
          duration: 200.ms,
          curve: Curves.elasticOut,
        );
  }

  // Animación de botón presionado
  static Widget buttonPressAnimation({
    required Widget child,
    required bool isPressed,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 100),
      transform: Matrix4.identity()
        ..scale(isPressed ? 0.95 : 1.0),
      child: child,
    );
  }

  // Animación de entrada escalonada para listas
  static Widget staggeredListAnimation({
    required Widget child,
    required int index,
    Duration baseDelay = const Duration(milliseconds: 100),
  }) {
    final delay = baseDelay * index;

    return child
        .animate(delay: delay)
        .slideX(begin: 0.2, end: 0, duration: 400.ms, curve: Curves.easeOut)
        .fadeIn(duration: 300.ms)
        .scale(begin: const Offset(0.8, 0.8), duration: 400.ms, curve: Curves.elasticOut);
  }

  // Animación de foco para campos de entrada
  static Widget focusAnimation({
    required Widget child,
    required bool hasFocus,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: EdgeInsets.all(hasFocus ? 2 : 0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: hasFocus
            ? Border.all(color: const Color(0xFF0A4B84), width: 2)
            : null,
        boxShadow: hasFocus
            ? [
                BoxShadow(
                  color: const Color(0xFF0A4B84).withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: child,
    );
  }

  // Animación de rebote para elementos importantes
  static Widget bounceAttentionAnimation({
    required Widget child,
    required bool shouldBounce,
  }) {
    if (!shouldBounce) return child;

    return child
        .animate(onPlay: (controller) => controller.repeat(reverse: true, period: const Duration(seconds: 2)))
        .scale(
          begin: const Offset(1, 1),
          end: const Offset(1.1, 1.1),
          duration: 500.ms,
          curve: Curves.elasticOut,
        );
  }

  // Animación de transición de página
  static PageRouteBuilder slidePageTransition({
    required Widget page,
    bool slideFromRight = true,
  }) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(1.0, 0.0);
        const end = Offset.zero;
        const curve = Curves.easeInOut;

        var tween = Tween(begin: slideFromRight ? begin : -begin, end: end).chain(CurveTween(curve: curve));

        return SlideTransition(
          position: animation.drive(tween),
          child: child,
        );
      },
    );
  }

  // Animación de entrada para diálogos
  static Widget dialogEntranceAnimation({
    required Widget child,
    Duration duration = const Duration(milliseconds: 400),
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: 0.8 + (value * 0.2),
          child: Opacity(
            opacity: value.clamp(0.0, 1.0),
            child: child,
          ),
        );
      },
      child: child,
    );
  }

  // Animación de entrada desde abajo para bottom sheets
  static Widget bottomSheetEntranceAnimation({
    required Widget child,
    Duration duration = const Duration(milliseconds: 300),
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 50 * (1 - value)),
          child: Opacity(
            opacity: value.clamp(0.0, 1.0),
            child: child,
          ),
        );
      },
      child: child,
    );
  }

  // Animación de entrada con fade y slide para modales
  static Widget modalEntranceAnimation({
    required Widget child,
    Duration duration = const Duration(milliseconds: 350),
    Offset slideOffset = const Offset(0, 0.1),
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: duration,
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Opacity(
          opacity: value.clamp(0.0, 1.0),
          child: Transform.translate(
            offset: slideOffset * (1 - value) * 20,
            child: child,
          ),
        );
      },
      child: child,
    );
  }

  // Animación de guardado con checkmark y confetti
  static Widget saveSuccessAnimation({
    required BuildContext context,
    required String message,
    required VoidCallback onComplete,
    Duration duration = const Duration(milliseconds: 2000),
  }) {
    return Stack(
      children: [
        // Overlay oscuro
        Container(
          color: Colors.black.withOpacity(0.5),
          child: Center(
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 300),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: 0.8 + (value * 0.2),
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.green.shade100,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 50,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          message,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        // Confetti animado
        ...List.generate(15, (index) {
          final randomX = (index * 23) % MediaQuery.of(context).size.width;
          final randomDelay = Duration(milliseconds: index * 150);

          return Positioned(
            left: randomX,
            top: -10,
            child: Icon(
              Icons.star,
              color: Colors.primaries[index % Colors.primaries.length],
              size: 16,
            )
                .animate(delay: randomDelay)
                .moveY(
                  begin: 0,
                  end: MediaQuery.of(context).size.height + 20,
                  duration: const Duration(milliseconds: 2500),
                  curve: Curves.easeOut,
                )
                .rotate(begin: 0, end: 1, duration: const Duration(milliseconds: 2500))
                .fadeOut(delay: const Duration(milliseconds: 2000), duration: 500.ms),
          );
        }),
      ],
    )
        .animate(delay: duration)
        .fadeOut(duration: 300.ms)
        .then()
        .callback(callback: (_) => onComplete());
  }

  // Animación de carga para formularios
  static Widget formLoadingAnimation({
    required Widget child,
    required bool isLoading,
    String loadingText = 'Guardando...',
  }) {
    if (!isLoading) return child;

    return Stack(
      children: [
        // Deshabilitar el formulario
        Opacity(
          opacity: 0.6,
          child: AbsorbPointer(
            child: child,
          ),
        ),

        // Overlay de carga
        Center(
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 200),
            builder: (context, value, child) {
              return Opacity(
                opacity: value.clamp(0.0, 1.0),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0A4B84)),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        loadingText,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // Animación de validación de campos
  static Widget fieldValidationAnimation({
    required Widget child,
    required bool hasError,
    required bool hasFocus,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: EdgeInsets.only(bottom: hasError ? 8 : 0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: hasFocus
            ? [
                BoxShadow(
                  color: (hasError ? Colors.red : const Color(0xFF0A4B84)).withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: child,
    );
  }

  // Animación de expansión para secciones
  static Widget expandableSectionAnimation({
    required Widget child,
    required bool isExpanded,
    Duration duration = const Duration(milliseconds: 300),
  }) {
    return AnimatedSize(
      duration: duration,
      curve: Curves.easeInOut,
      child: Container(
        constraints: BoxConstraints(
          maxHeight: isExpanded ? double.infinity : 0,
        ),
        child: child,
      ),
    );
  }

  // Animación de shimmer para loading
  static Widget shimmerAnimation({
    required Widget child,
    required bool isLoading,
  }) {
    if (!isLoading) return child;

    return ShaderMask(
      shaderCallback: (bounds) {
        return LinearGradient(
          colors: [
            Colors.grey.shade300,
            Colors.grey.shade100,
            Colors.grey.shade300,
          ],
          stops: const [0.0, 0.5, 1.0],
          begin: const Alignment(-1.0, 0.0),
          end: const Alignment(1.0, 0.0),
        ).createShader(bounds);
      },
      child: child
          .animate(onPlay: (controller) => controller.repeat())
          .moveX(begin: -100, end: 100, duration: 1000.ms),
    );
  }
}

// Extensiones útiles para animaciones rápidas
extension AnimationExtensions on Widget {
  Widget withSuccessFeedback({VoidCallback? onComplete}) {
    return FeedbackAnimations.successAnimation(
      child: this,
      onComplete: onComplete ?? () {},
    );
  }

  Widget withErrorFeedback({VoidCallback? onComplete}) {
    return FeedbackAnimations.errorAnimation(
      child: this,
      onComplete: onComplete ?? () {},
    );
  }

  Widget withLoadingPulse() {
    return FeedbackAnimations.loadingPulseAnimation(child: this);
  }

  Widget withStaggeredAnimation(int index) {
    return FeedbackAnimations.staggeredListAnimation(child: this, index: index);
  }

  Widget withFocusAnimation(bool hasFocus) {
    return FeedbackAnimations.focusAnimation(child: this, hasFocus: hasFocus);
  }

  Widget withBounceAttention(bool shouldBounce) {
    return FeedbackAnimations.bounceAttentionAnimation(child: this, shouldBounce: shouldBounce);
  }

  Widget withShimmerLoading(bool isLoading) {
    return FeedbackAnimations.shimmerAnimation(child: this, isLoading: isLoading);
  }
}
