import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'presentation/pages/splash_page.dart';
import 'presentation/pages/login_page.dart';
import 'presentation/widgets/menu.dart';
import 'providers/theme_provider.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar datos de localización para fechas en español
  await initializeDateFormatting('es');

  // Inicializar timezone para notificaciones
  tz.initializeTimeZones();

  // Inicializar servicio de notificaciones
  await NotificationService().initialize();

  // Configurar orientación vertical
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const MyApp());
}



class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Matriz Inmobiliaria',
            theme: themeProvider.currentTheme,
            home: const SplashPage(),
            routes: {
              '/login': (context) => const LoginPage(),
              '/home': (context) => const MainScreen(),
            },
          );
        },
      ),
    );
  }
}
