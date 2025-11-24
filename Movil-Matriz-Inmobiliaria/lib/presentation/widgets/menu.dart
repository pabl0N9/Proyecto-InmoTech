import 'package:flutter/material.dart';
import '../pages/home_page.dart';
// Asegúrate de que estas páginas existan, aunque ahora son solo placeholders
import '../pages/citas_page.dart'; 
import '../pages/reportes_page.dart'; 
import 'header.dart'; // Importamos el CustomHeader

/// Pantalla principal con BottomNavigationBar
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // Lista de títulos para el Header (puedes ajustarlos)
  final List<String> _pageTitles = const [
    'Inicio',
    'Mis Citas',
    'Reportes',
  ];

  // Las páginas solo contienen el contenido, NO el Scaffold ni el Header.
  final List<Widget> _pages = const [
    HomePage(),
    CitasPage(),
    ReportesPage(),
  ];

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ⚠️ El Scaffold principal NO tiene AppBar aquí, para usar el Header personalizado
      
      body: SafeArea(
        child: Column( // Usamos Column para apilar el Header y el Contenido
          children: [
            // 💡 CustomHeader como primer elemento del body
            CustomHeader(title: _pageTitles[_selectedIndex]), 

            // 💡 Expanded para que la página seleccionada ocupe el espacio restante
            Expanded(
              child: _pages[_selectedIndex], // Carga la página actual (HomePage, CitasPage, etc.)
            ),
          ],
        ),
      ),

      // Menú de navegación en la parte inferior
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: const Color.fromRGBO(0, 120, 206, 1),
        unselectedItemColor: const Color.fromRGBO(97, 138, 133, 1),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Inicio',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Citas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build),
            label: 'Reportes',
          ),
        ],
      ),
    );
  }
}