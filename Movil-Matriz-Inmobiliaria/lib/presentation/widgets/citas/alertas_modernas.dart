import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

enum AlertType {
  success,
  error,
  warning,
  info,
  loading,
}

enum AlertPosition {
  top,
  bottom,
  center,
}

class ModernAlerts {
  // Toast moderno con animaciones avanzadas
  static void showToast({
    required BuildContext context,
    required String message,
    required AlertType type,
    Duration duration = const Duration(seconds: 3),
    AlertPosition position = AlertPosition.bottom,
    VoidCallback? onTap,
    bool showIcon = true,
    String? actionText,
    VoidCallback? onActionTap,
  }) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => _ModernToastWidget(
        message: message,
        type: type,
        duration: duration,
        position: position,
        onTap: onTap,
        showIcon: showIcon,
        actionText: actionText,
        onActionTap: onActionTap,
      ),
    );

    overlay.insert(overlayEntry);

    // Auto-remover después de la duración
    Future.delayed(duration, () {
      if (overlayEntry.mounted) {
        overlayEntry.remove();
      }
    });
  }

  // Banner superior para mensajes importantes
  static void showBanner({
    required BuildContext context,
    required String title,
    required String message,
    required AlertType type,
    Duration duration = const Duration(seconds: 5),
    VoidCallback? onTap,
    String? actionText,
    VoidCallback? onActionTap,
  }) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => _ModernBannerWidget(
        title: title,
        message: message,
        type: type,
        duration: duration,
        onTap: onTap,
        actionText: actionText,
        onActionTap: onActionTap,
      ),
    );

    overlay.insert(overlayEntry);

    Future.delayed(duration, () {
      if (overlayEntry.mounted) {
        overlayEntry.remove();
      }
    });
  }

  // Diálogo de confirmación moderno
  static Future<bool?> showConfirmationDialog({
    required BuildContext context,
    required String title,
    required String message,
    String confirmText = 'Confirmar',
    String cancelText = 'Cancelar',
    AlertType type = AlertType.warning,
    bool barrierDismissible = true,
  }) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: barrierDismissible,
      builder: (context) => _ModernConfirmationDialog(
        title: title,
        message: message,
        confirmText: confirmText,
        cancelText: cancelText,
        type: type,
      ),
    );
  }

  // Notificación push estilo
  static void showNotification({
    required BuildContext context,
    required String title,
    required String message,
    AlertType type = AlertType.info,
    Duration duration = const Duration(seconds: 4),
    VoidCallback? onTap,
  }) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => _ModernNotificationWidget(
        title: title,
        message: message,
        type: type,
        duration: duration,
        onTap: onTap,
      ),
    );

    overlay.insert(overlayEntry);

    Future.delayed(duration, () {
      if (overlayEntry.mounted) {
        overlayEntry.remove();
      }
    });
  }

  // Loading overlay
  static void showLoading({
    required BuildContext context,
    String message = 'Cargando...',
    bool barrierDismissible = false,
  }) {
    showDialog(
      context: context,
      barrierDismissible: barrierDismissible,
      builder: (context) => _ModernLoadingDialog(message: message),
    );
  }

  // Success feedback con animación
  static void showSuccess({
    required BuildContext context,
    required String message,
    Duration duration = const Duration(seconds: 2),
    VoidCallback? onComplete,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => _ModernSuccessDialog(
        message: message,
        duration: duration,
        onComplete: onComplete,
      ),
    );
  }
}

// Widget Toast moderno
class _ModernToastWidget extends StatefulWidget {
  final String message;
  final AlertType type;
  final Duration duration;
  final AlertPosition position;
  final VoidCallback? onTap;
  final bool showIcon;
  final String? actionText;
  final VoidCallback? onActionTap;

  const _ModernToastWidget({
    required this.message,
    required this.type,
    required this.duration,
    required this.position,
    this.onTap,
    this.showIcon = true,
    this.actionText,
    this.onActionTap,
  });

  @override
  State<_ModernToastWidget> createState() => _ModernToastWidgetState();
}

class _ModernToastWidgetState extends State<_ModernToastWidget>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _slideAnimation = Tween<double>(
      begin: widget.position == AlertPosition.top ? -1.0 : 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return Positioned(
      top: widget.position == AlertPosition.top ? 50 : null,
      bottom: widget.position == AlertPosition.bottom ? 100 : null,
      left: 16,
      right: 16,
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(0, _slideAnimation.value * 50),
            child: Opacity(
              opacity: _fadeAnimation.value,
              child: Material(
                color: Colors.transparent,
                child: GestureDetector(
                  onTap: widget.onTap,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: screenSize.width - 32,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      color: _getBackgroundColor(),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _getBorderColor(),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _getShadowColor(),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        if (widget.showIcon) ...[
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: _getIconBackgroundColor(),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              _getIcon(),
                              color: _getIconColor(),
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: Text(
                            widget.message,
                            style: TextStyle(
                              color: _getTextColor(),
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              height: 1.3,
                            ),
                          ),
                        ),
                        if (widget.actionText != null && widget.onActionTap != null) ...[
                          const SizedBox(width: 12),
                          GestureDetector(
                            onTap: widget.onActionTap,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: _getActionColor(),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                widget.actionText!,
                                style: TextStyle(
                                  color: _getTextColor(),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade50;
      case AlertType.error:
        return Colors.red.shade50;
      case AlertType.warning:
        return Colors.orange.shade50;
      case AlertType.info:
        return Colors.blue.shade50;
      case AlertType.loading:
        return Colors.grey.shade50;
    }
  }

  Color _getBorderColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200;
      case AlertType.error:
        return Colors.red.shade200;
      case AlertType.warning:
        return Colors.orange.shade200;
      case AlertType.info:
        return Colors.blue.shade200;
      case AlertType.loading:
        return Colors.grey.shade200;
    }
  }

  Color _getShadowColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200.withOpacity(0.3);
      case AlertType.error:
        return Colors.red.shade200.withOpacity(0.3);
      case AlertType.warning:
        return Colors.orange.shade200.withOpacity(0.3);
      case AlertType.info:
        return Colors.blue.shade200.withOpacity(0.3);
      case AlertType.loading:
        return Colors.grey.shade200.withOpacity(0.3);
    }
  }

  Color _getIconBackgroundColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade100;
      case AlertType.error:
        return Colors.red.shade100;
      case AlertType.warning:
        return Colors.orange.shade100;
      case AlertType.info:
        return Colors.blue.shade100;
      case AlertType.loading:
        return Colors.grey.shade100;
    }
  }

  Color _getIconColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade700;
      case AlertType.error:
        return Colors.red.shade700;
      case AlertType.warning:
        return Colors.orange.shade700;
      case AlertType.info:
        return Colors.blue.shade700;
      case AlertType.loading:
        return Colors.grey.shade700;
    }
  }

  IconData _getIcon() {
    switch (widget.type) {
      case AlertType.success:
        return Icons.check_circle;
      case AlertType.error:
        return Icons.error;
      case AlertType.warning:
        return Icons.warning;
      case AlertType.info:
        return Icons.info;
      case AlertType.loading:
        return Icons.hourglass_empty;
    }
  }

  Color _getTextColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade800;
      case AlertType.error:
        return Colors.red.shade800;
      case AlertType.warning:
        return Colors.orange.shade800;
      case AlertType.info:
        return Colors.blue.shade800;
      case AlertType.loading:
        return Colors.grey.shade800;
    }
  }

  Color _getActionColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200;
      case AlertType.error:
        return Colors.red.shade200;
      case AlertType.warning:
        return Colors.orange.shade200;
      case AlertType.info:
        return Colors.blue.shade200;
      case AlertType.loading:
        return Colors.grey.shade200;
    }
  }
}

// Widget Banner moderno
class _ModernBannerWidget extends StatefulWidget {
  final String title;
  final String message;
  final AlertType type;
  final Duration duration;
  final VoidCallback? onTap;
  final String? actionText;
  final VoidCallback? onActionTap;

  const _ModernBannerWidget({
    required this.title,
    required this.message,
    required this.type,
    required this.duration,
    this.onTap,
    this.actionText,
    this.onActionTap,
  });

  @override
  State<_ModernBannerWidget> createState() => _ModernBannerWidgetState();
}

class _ModernBannerWidgetState extends State<_ModernBannerWidget>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _slideAnimation = Tween<double>(
      begin: -1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(0, _slideAnimation.value * 100),
            child: Opacity(
              opacity: _fadeAnimation.value,
              child: Material(
                color: Colors.transparent,
                child: GestureDetector(
                  onTap: widget.onTap,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _getBackgroundColor(),
                      border: Border(
                        bottom: BorderSide(
                          color: _getBorderColor(),
                          width: 3,
                        ),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _getShadowColor(),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      bottom: false,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: _getIconBackgroundColor(),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              _getIcon(),
                              color: _getIconColor(),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.title,
                                  style: TextStyle(
                                    color: _getTextColor(),
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  widget.message,
                                  style: TextStyle(
                                    color: _getTextColor().withOpacity(0.8),
                                    fontSize: 14,
                                    height: 1.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (widget.actionText != null && widget.onActionTap != null) ...[
                            const SizedBox(width: 16),
                            GestureDetector(
                              onTap: widget.onActionTap,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: _getActionColor(),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  widget.actionText!,
                                  style: TextStyle(
                                    color: _getTextColor(),
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade500;
      case AlertType.error:
        return Colors.red.shade500;
      case AlertType.warning:
        return Colors.orange.shade500;
      case AlertType.info:
        return Colors.blue.shade500;
      case AlertType.loading:
        return Colors.grey.shade500;
    }
  }

  Color _getBorderColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade600;
      case AlertType.error:
        return Colors.red.shade600;
      case AlertType.warning:
        return Colors.orange.shade600;
      case AlertType.info:
        return Colors.blue.shade600;
      case AlertType.loading:
        return Colors.grey.shade600;
    }
  }

  Color _getShadowColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200;
      case AlertType.error:
        return Colors.red.shade200;
      case AlertType.warning:
        return Colors.orange.shade200;
      case AlertType.info:
        return Colors.blue.shade200;
      case AlertType.loading:
        return Colors.grey.shade200;
    }
  }

  Color _getIconBackgroundColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.white.withOpacity(0.2);
      case AlertType.error:
        return Colors.white.withOpacity(0.2);
      case AlertType.warning:
        return Colors.white.withOpacity(0.2);
      case AlertType.info:
        return Colors.white.withOpacity(0.2);
      case AlertType.loading:
        return Colors.white.withOpacity(0.2);
    }
  }

  Color _getIconColor() {
    return Colors.white;
  }

  IconData _getIcon() {
    switch (widget.type) {
      case AlertType.success:
        return Icons.check_circle;
      case AlertType.error:
        return Icons.error;
      case AlertType.warning:
        return Icons.warning;
      case AlertType.info:
        return Icons.info;
      case AlertType.loading:
        return Icons.hourglass_empty;
    }
  }

  Color _getTextColor() {
    return Colors.white;
  }

  Color _getActionColor() {
    return Colors.white.withOpacity(0.2);
  }
}

// Diálogo de confirmación moderno
class _ModernConfirmationDialog extends StatefulWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final AlertType type;

  const _ModernConfirmationDialog({
    required this.title,
    required this.message,
    required this.confirmText,
    required this.cancelText,
    required this.type,
  });

  @override
  State<_ModernConfirmationDialog> createState() => _ModernConfirmationDialogState();
}

class _ModernConfirmationDialogState extends State<_ModernConfirmationDialog>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              backgroundColor: Colors.white,
              elevation: 20,
              shadowColor: _getShadowColor(),
              contentPadding: EdgeInsets.zero,
              content: Container(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header con icono
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: _getHeaderColor(),
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      ),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _getIcon(),
                              color: Colors.white,
                              size: 32,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            widget.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),

                    // Contenido
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Text(
                            widget.message,
                            style: const TextStyle(
                              color: Colors.black87,
                              fontSize: 16,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 32),

                          // Botones
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => Navigator.of(context).pop(false),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    side: BorderSide(color: _getBorderColor()),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: Text(
                                    widget.cancelText,
                                    style: TextStyle(
                                      color: _getBorderColor(),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => Navigator.of(context).pop(true),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: _getConfirmColor(),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    elevation: 0,
                                  ),
                                  child: Text(
                                    widget.confirmText,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Color _getHeaderColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade500;
      case AlertType.error:
        return Colors.red.shade500;
      case AlertType.warning:
        return Colors.orange.shade500;
      case AlertType.info:
        return Colors.blue.shade500;
      case AlertType.loading:
        return Colors.grey.shade500;
    }
  }

  Color _getShadowColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200;
      case AlertType.error:
        return Colors.red.shade200;
      case AlertType.warning:
        return Colors.orange.shade200;
      case AlertType.info:
        return Colors.blue.shade200;
      case AlertType.loading:
        return Colors.grey.shade200;
    }
  }

  IconData _getIcon() {
    switch (widget.type) {
      case AlertType.success:
        return Icons.check_circle;
      case AlertType.error:
        return Icons.error;
      case AlertType.warning:
        return Icons.warning;
      case AlertType.info:
        return Icons.info;
      case AlertType.loading:
        return Icons.hourglass_empty;
    }
  }

  Color _getBorderColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade600;
      case AlertType.error:
        return Colors.red.shade600;
      case AlertType.warning:
        return Colors.orange.shade600;
      case AlertType.info:
        return Colors.blue.shade600;
      case AlertType.loading:
        return Colors.grey.shade600;
    }
  }

  Color _getConfirmColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade600;
      case AlertType.error:
        return Colors.red.shade600;
      case AlertType.warning:
        return Colors.orange.shade600;
      case AlertType.info:
        return Colors.blue.shade600;
      case AlertType.loading:
        return Colors.grey.shade600;
    }
  }
}

// Widget de notificación push
class _ModernNotificationWidget extends StatefulWidget {
  final String title;
  final String message;
  final AlertType type;
  final Duration duration;
  final VoidCallback? onTap;

  const _ModernNotificationWidget({
    required this.title,
    required this.message,
    required this.type,
    required this.duration,
    this.onTap,
  });

  @override
  State<_ModernNotificationWidget> createState() => _ModernNotificationWidgetState();
}

class _ModernNotificationWidgetState extends State<_ModernNotificationWidget>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _slideAnimation = Tween<double>(
      begin: -1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 60,
      right: 16,
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(_slideAnimation.value * 350, 0),
            child: Opacity(
              opacity: _fadeAnimation.value,
              child: Material(
                color: Colors.transparent,
                child: GestureDetector(
                  onTap: widget.onTap,
                  child: Container(
                    width: 320,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _getBorderColor(),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _getShadowColor(),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: _getIconBackgroundColor(),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            _getIcon(),
                            color: _getIconColor(),
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.title,
                                style: TextStyle(
                                  color: _getTextColor(),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                widget.message,
                                style: TextStyle(
                                  color: _getTextColor().withOpacity(0.8),
                                  fontSize: 12,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Color _getBorderColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200;
      case AlertType.error:
        return Colors.red.shade200;
      case AlertType.warning:
        return Colors.orange.shade200;
      case AlertType.info:
        return Colors.blue.shade200;
      case AlertType.loading:
        return Colors.grey.shade200;
    }
  }

  Color _getShadowColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade200.withOpacity(0.3);
      case AlertType.error:
        return Colors.red.shade200.withOpacity(0.3);
      case AlertType.warning:
        return Colors.orange.shade200.withOpacity(0.3);
      case AlertType.info:
        return Colors.blue.shade200.withOpacity(0.3);
      case AlertType.loading:
        return Colors.grey.shade200.withOpacity(0.3);
    }
  }

  Color _getIconBackgroundColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade100;
      case AlertType.error:
        return Colors.red.shade100;
      case AlertType.warning:
        return Colors.orange.shade100;
      case AlertType.info:
        return Colors.blue.shade100;
      case AlertType.loading:
        return Colors.grey.shade100;
    }
  }

  Color _getIconColor() {
    switch (widget.type) {
      case AlertType.success:
        return Colors.green.shade700;
      case AlertType.error:
        return Colors.red.shade700;
      case AlertType.warning:
        return Colors.orange.shade700;
      case AlertType.info:
        return Colors.blue.shade700;
      case AlertType.loading:
        return Colors.grey.shade700;
    }
  }

  IconData _getIcon() {
    switch (widget.type) {
      case AlertType.success:
        return Icons.check_circle;
      case AlertType.error:
        return Icons.error;
      case AlertType.warning:
        return Icons.warning;
      case AlertType.info:
        return Icons.info;
      case AlertType.loading:
        return Icons.hourglass_empty;
    }
  }

  Color _getTextColor() {
    return Colors.black87;
  }
}

// Diálogo de loading moderno
class _ModernLoadingDialog extends StatelessWidget {
  final String message;

  const _ModernLoadingDialog({required this.message});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: const Color(0xFF0A4B84).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0A4B84)),
                strokeWidth: 3,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              message,
              style: const TextStyle(
                color: Colors.black87,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// Diálogo de éxito moderno
class _ModernSuccessDialog extends StatefulWidget {
  final String message;
  final Duration duration;
  final VoidCallback? onComplete;

  const _ModernSuccessDialog({
    required this.message,
    required this.duration,
    this.onComplete,
  });

  @override
  State<_ModernSuccessDialog> createState() => _ModernSuccessDialogState();
}

class _ModernSuccessDialogState extends State<_ModernSuccessDialog>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();

    // Auto-cerrar después de la duración
    Future.delayed(widget.duration, () {
      if (mounted) {
        Navigator.of(context).pop();
        widget.onComplete?.call();
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: Dialog(
              backgroundColor: Colors.transparent,
              elevation: 0,
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.green.shade200.withOpacity(0.3),
                      blurRadius: 30,
                      offset: const Offset(0, 15),
                      spreadRadius: 5,
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
                    )
                        .animate()
                        .scale(duration: 500.ms, curve: Curves.elasticOut),
                    const SizedBox(height: 24),
                    Text(
                      widget.message,
                      style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

// Extensiones para facilitar el uso
extension ModernAlertsExtension on BuildContext {
  void showModernToast({
    required String message,
    required AlertType type,
    Duration duration = const Duration(seconds: 3),
    AlertPosition position = AlertPosition.bottom,
    VoidCallback? onTap,
    bool showIcon = true,
    String? actionText,
    VoidCallback? onActionTap,
  }) {
    ModernAlerts.showToast(
      context: this,
      message: message,
      type: type,
      duration: duration,
      position: position,
      onTap: onTap,
      showIcon: showIcon,
      actionText: actionText,
      onActionTap: onActionTap,
    );
  }

  void showModernBanner({
    required String title,
    required String message,
    required AlertType type,
    Duration duration = const Duration(seconds: 5),
    VoidCallback? onTap,
    String? actionText,
    VoidCallback? onActionTap,
  }) {
    ModernAlerts.showBanner(
      context: this,
      title: title,
      message: message,
      type: type,
      duration: duration,
      onTap: onTap,
      actionText: actionText,
      onActionTap: onActionTap,
    );
  }

  Future<bool?> showModernConfirmation({
    required String title,
    required String message,
    String confirmText = 'Confirmar',
    String cancelText = 'Cancelar',
    AlertType type = AlertType.warning,
    bool barrierDismissible = true,
  }) {
    return ModernAlerts.showConfirmationDialog(
      context: this,
      title: title,
      message: message,
      confirmText: confirmText,
      cancelText: cancelText,
      type: type,
      barrierDismissible: barrierDismissible,
    );
  }

  void showModernNotification({
    required String title,
    required String message,
    AlertType type = AlertType.info,
    Duration duration = const Duration(seconds: 4),
    VoidCallback? onTap,
  }) {
    ModernAlerts.showNotification(
      context: this,
      title: title,
      message: message,
      type: type,
      duration: duration,
      onTap: onTap,
    );
  }

  void showModernLoading({
    String message = 'Cargando...',
    bool barrierDismissible = false,
  }) {
    ModernAlerts.showLoading(
      context: this,
      message: message,
      barrierDismissible: barrierDismissible,
    );
  }

  void showModernSuccess({
    required String message,
    Duration duration = const Duration(seconds: 2),
    VoidCallback? onComplete,
  }) {
    ModernAlerts.showSuccess(
      context: this,
      message: message,
      duration: duration,
      onComplete: onComplete,
    );
  }
}
