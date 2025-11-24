import 'package:flutter/material.dart';
// import '../widgets/menu.dart'; // Ya no se necesita el menú aquí
// import '../widgets/header.dart'; // El header ya no se incluye aquí

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    // ⚠️ ELIMINAMOS Scaffold, SafeArea, Column y CustomHeader. 
    // Solo devolvemos el contenido principal.
    return Center( // Ya está dentro de un Expanded en MainScreen
      child: Text(
        'Bienvenido a la app',
        style: Theme.of(context).textTheme.headlineSmall,
      ),
    );
  }
}