import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../../features/auth/data/datasources/auth_remote_data_source.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/cubit/auth_cubit.dart';
import '../../features/orders/data/datasources/order_detail_remote_data_source.dart';
import '../../features/orders/data/datasources/orders_remote_data_source.dart';
import '../../features/orders/data/repositories/order_detail_repository_impl.dart';
import '../../features/orders/data/repositories/orders_repository_impl.dart';
import '../../features/orders/domain/repositories/order_detail_repository.dart';
import '../../features/orders/domain/repositories/orders_repository.dart';
import '../../features/orders/presentation/cubit/order_detail_cubit.dart';
import '../../features/orders/presentation/cubit/orders_cubit.dart';
import '../network/dio_client.dart';
import '../storage/token_storage.dart';

final GetIt sl = GetIt.instance;

Future<void> setupInjector() async {
  // Core
  sl.registerLazySingleton<FlutterSecureStorage>(() => FlutterSecureStorage());
  sl.registerLazySingleton<TokenStorage>(() => TokenStorage(sl()));
  sl.registerLazySingleton<DioClient>(() => DioClient(sl()));

  // Auth
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSource(sl<DioClient>().dio, sl()),
  );
  sl.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(sl(), sl()));
  sl.registerLazySingleton<AuthCubit>(() => AuthCubit(sl()));

  // Orders — a fresh cubit per page mount.
  sl.registerLazySingleton<OrdersRemoteDataSource>(
    () => OrdersRemoteDataSource(sl<DioClient>().dio),
  );
  sl.registerLazySingleton<OrdersRepository>(() => OrdersRepositoryImpl(sl()));
  sl.registerFactory<OrdersCubit>(() => OrdersCubit(sl()));

  sl.registerLazySingleton<OrderDetailRemoteDataSource>(
    () => OrderDetailRemoteDataSource(sl<DioClient>().dio),
  );
  sl.registerLazySingleton<OrderDetailRepository>(() => OrderDetailRepositoryImpl(sl()));
  sl.registerFactoryParam<OrderDetailCubit, int, void>(
    (orderId, _) => OrderDetailCubit(sl(), orderId),
  );

  // A failed token refresh bounces the user to login.
  sl<DioClient>().onSessionExpired = () => sl<AuthCubit>().sessionExpired();
}
