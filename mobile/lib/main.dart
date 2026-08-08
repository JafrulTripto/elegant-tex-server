import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'app.dart';
import 'core/di/injector.dart';
import 'features/auth/presentation/cubit/auth_cubit.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await setupInjector();
  runApp(
    BlocProvider<AuthCubit>.value(
      value: sl<AuthCubit>()..appStarted(),
      child: const ElegantTexApp(),
    ),
  );
}
