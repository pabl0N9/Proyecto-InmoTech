import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';

class SoundService {
  static final SoundService _instance = SoundService._internal();
  factory SoundService() => _instance;
  SoundService._internal();

  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isEnabled = true;

  bool get isEnabled => _isEnabled;

  void setEnabled(bool enabled) {
    _isEnabled = enabled;
  }

  Future<void> _playSound(String assetPath) async {
    if (!_isEnabled) return;

    try {
      await _audioPlayer.stop();
      final bytes = await rootBundle.load(assetPath);
      await _audioPlayer.play(BytesSource(bytes.buffer.asUint8List()));
    } catch (e) {
      // Silently fail if sound can't be played
      print('Error playing sound: $e');
    }
  }

  // Success sounds
  Future<void> playSuccess() async {
    await _playSound('assets/sounds/success.mp3');
  }

  Future<void> playAppointmentCreated() async {
    await _playSound('assets/sounds/appointment_created.mp3');
  }

  Future<void> playAppointmentUpdated() async {
    await _playSound('assets/sounds/appointment_updated.mp3');
  }

  // Action sounds
  Future<void> playTap() async {
    await _playSound('assets/sounds/tap.mp3');
  }

  Future<void> playSwipe() async {
    await _playSound('assets/sounds/swipe.mp3');
  }

  Future<void> playExpand() async {
    await _playSound('assets/sounds/expand.mp3');
  }

  Future<void> playCollapse() async {
    await _playSound('assets/sounds/collapse.mp3');
  }

  // Notification sounds
  Future<void> playNotification() async {
    await _playSound('assets/sounds/notification.mp3');
  }

  Future<void> playReminder() async {
    await _playSound('assets/sounds/reminder.mp3');
  }

  // Error sounds
  Future<void> playError() async {
    await _playSound('assets/sounds/error.mp3');
  }

  Future<void> playDelete() async {
    await _playSound('assets/sounds/delete.mp3');
  }

  // Dispose
  void dispose() {
    _audioPlayer.dispose();
  }
}
