class OrderItemModel {
  final String id;
  final String productId;
  final String? name;
  final double price;
  final int quantity;
  final double totalPrice;
  final String? image;

  const OrderItemModel({
    required this.id,
    required this.productId,
    this.name,
    required this.price,
    required this.quantity,
    required this.totalPrice,
    this.image,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? json['product_id']?.toString() ?? '',
      name: json['name']?.toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? (json['total_price'] as num?)?.toDouble() ?? 0.0,
      image: json['image']?.toString(),
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentMethod;
  final String paymentStatus;
  final double subtotal;
  final double tax;
  final double shipping;
  final double discount;
  final double total;
  final List<OrderItemModel> items;
  final Map<String, dynamic>? shippingAddress;
  final String? trackingNumber;
  final String? notes;
  final DateTime createdAt;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.subtotal,
    required this.tax,
    required this.shipping,
    required this.discount,
    required this.total,
    required this.items,
    this.shippingAddress,
    this.trackingNumber,
    this.notes,
    required this.createdAt,
  });

  bool get isCancellable => status == 'placed' || status == 'confirmed';
  bool get isDelivered => status == 'delivered';

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    List<OrderItemModel> orderItems = [];
    if (json['items'] is List) {
      orderItems = (json['items'] as List).map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return OrderModel(
      id: json['id']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? json['order_number']?.toString() ?? '',
      status: json['status']?.toString() ?? 'placed',
      paymentMethod: json['paymentMethod']?.toString() ?? json['payment_method']?.toString() ?? 'cod',
      paymentStatus: json['paymentStatus']?.toString() ?? json['payment_status']?.toString() ?? 'pending',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      shipping: (json['shipping'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      items: orderItems,
      shippingAddress: json['shippingAddress'] as Map<String, dynamic>? ?? json['shipping_address'] as Map<String, dynamic>?,
      trackingNumber: json['trackingNumber']?.toString() ?? json['tracking_number']?.toString(),
      notes: json['notes']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : json['created_at'] != null
              ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
              : DateTime.now(),
    );
  }
}
