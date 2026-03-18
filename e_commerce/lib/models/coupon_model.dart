class CouponModel {
  final String id;
  final String code;
  final String? description;
  final String type;
  final double value;
  final double? minOrderAmount;
  final double? maxDiscount;
  final double discountAmount;
  final double finalAmount;

  const CouponModel({
    required this.id,
    required this.code,
    this.description,
    required this.type,
    required this.value,
    this.minOrderAmount,
    this.maxDiscount,
    required this.discountAmount,
    required this.finalAmount,
  });

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      description: json['description']?.toString(),
      type: json['type']?.toString() ?? 'percentage',
      value: (json['value'] as num?)?.toDouble() ?? 0.0,
      minOrderAmount: (json['minOrderAmount'] as num?)?.toDouble() ?? (json['min_order_amount'] as num?)?.toDouble(),
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble() ?? (json['max_discount'] as num?)?.toDouble(),
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? (json['discount_amount'] as num?)?.toDouble() ?? 0.0,
      finalAmount: (json['finalAmount'] as num?)?.toDouble() ?? (json['final_amount'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
