import 'package:flutter/material.dart';

// ⚠️ Se eliminó 'implements PreferredSizeWidget'
class CustomHeader extends StatelessWidget {
  final String title;

  const CustomHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Image.asset(
            "assets/images/Logo2Matriz.png",
            height: 20,
          ),
          // 👇 Solo muestra el título si no está vacío
          if (title.isNotEmpty)
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0A4B84),
              ),
            ),
          const Icon(
            Icons.person_outline,
            size: 32,
            color: Colors.black87,
          ),
        ],
      ),
    );
  }

  // ⚠️ Se eliminó la implementación de preferredSize
}