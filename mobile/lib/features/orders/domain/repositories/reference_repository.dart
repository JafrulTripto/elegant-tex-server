import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/customer_match.dart';
import '../entities/ref_item.dart';

/// The reference lists a new/edit order form needs up front. `parties` is the
/// marketplaces or merchants list depending on the order type.
class FormRefs {
  const FormRefs({
    required this.productTypes,
    required this.fabricTypes,
    required this.deliveryChannels,
    required this.parties,
    required this.divisions,
  });

  final List<RefItem> productTypes;
  final List<RefItem> fabricTypes;
  final List<RefItem> deliveryChannels;
  final List<RefItem> parties;
  final List<RefItem> divisions;
}

abstract interface class ReferenceRepository {
  Future<Either<Failure, FormRefs>> loadFormRefs({
    required int orderType,
    required int userId,
  });
  Future<Either<Failure, List<RefItem>>> districts(int divisionId);
  Future<Either<Failure, List<RefItem>>> upazilas(int districtId);
  Future<Either<Failure, List<FabricColor>>> fabrics(String search);
  Future<Either<Failure, List<CustomerMatch>>> searchCustomers(String phone);
}
