class CartItemModel {
  final String productId;
  final String name;
  final double price;
  int quantity;
  final String? image;
  final String? variantSku;

  CartItemModel({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    this.image,
    this.variantSku,
  });

  double get totalPrice => price * quantity;

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      productId: json['productId']?.toString() ?? json['product_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      image: json['image']?.toString(),
      variantSku: json['variantSku']?.toString() ?? json['variant_sku']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'name': name,
    'price': price,
    'quantity': quantity,
    'image': image,
    'variantSku': variantSku,
  };

  CartItemModel copyWith({int? quantity}) {
    return CartItemModel(
      productId: productId,
      name: name,
      price: price,
      quantity: quantity ?? this.quantity,
      image: image,
      variantSku: variantSku,
    );
  }
}
