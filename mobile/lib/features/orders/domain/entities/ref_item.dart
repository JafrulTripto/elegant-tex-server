import 'package:equatable/equatable.dart';

import '../../../../core/utils/json_parse.dart';

/// A generic {id, name} option for form dropdowns (product/fabric types, delivery
/// channels, parties, geo). Parsed tolerantly (id may arrive as id/value/string).
class RefItem extends Equatable {
  const RefItem({required this.id, required this.name});
  final int id;
  final String name;

  factory RefItem.fromJson(Map<String, dynamic> j) => RefItem(
        id: asInt(j['id'] ?? j['value']),
        name: asStr(j['name'] ?? j['label'] ?? j['title'] ?? j['value']),
      );

  @override
  List<Object?> get props => [id, name];
}

/// A fabric colour option (carries an optional swatch image id).
class FabricColor extends Equatable {
  const FabricColor({required this.id, required this.name, this.image});
  final int id;
  final String name;
  final String? image;

  factory FabricColor.fromJson(Map<String, dynamic> j) => FabricColor(
        id: asInt(j['id'] ?? j['value']),
        name: asStr(j['name'] ?? j['label']),
        image: j['image']?.toString(),
      );

  @override
  List<Object?> get props => [id, name];
}
