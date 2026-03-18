class ProductModel {
  final String id;
  final String name;
  final String? description;
  final double price;
  final double? compareAtPrice;
  final int stock;
  final String category;
  final String? categoryId;
  final String? brand;
  final List<String> images;
  final String? thumbnail;
  final String status;
  final double rating;
  final int reviewCount;
  final String? sku;

  const ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.compareAtPrice,
    required this.stock,
    required this.category,
    this.categoryId,
    this.brand,
    required this.images,
    this.thumbnail,
    this.status = 'active',
    this.rating = 0,
    this.reviewCount = 0,
    this.sku,
  });

  bool get isInStock => stock > 0;
  bool get isOnSale => compareAtPrice != null && compareAtPrice! > price;
  int get discountPercent => isOnSale
      ? (((compareAtPrice! - price) / compareAtPrice!) * 100).round()
      : 0;
  String get displayImage => thumbnail ?? (images.isNotEmpty ? images.first : '');

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    List<String> imgs = [];
    if (json['images'] is List) {
      imgs = (json['images'] as List).map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    }
    final thumb = json['thumbnail']?.toString() ?? json['image']?.toString() ?? (imgs.isNotEmpty ? imgs.first : '');
    return ProductModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      compareAtPrice: (json['compareAtPrice'] as num?)?.toDouble() ?? (json['compare_at_price'] as num?)?.toDouble() ?? (json['price_mrp'] as num?)?.toDouble(),
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      category: json['category']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? json['category_id']?.toString(),
      brand: json['brand']?.toString(),
      images: imgs,
      thumbnail: thumb.isNotEmpty ? thumb : null,
      status: json['status']?.toString() ?? 'active',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? (json['num_reviews'] as num?)?.toInt() ?? 0,
      sku: json['sku']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'price': price,
    'compareAtPrice': compareAtPrice,
    'stock': stock,
    'category': category,
    'categoryId': categoryId,
    'brand': brand,
    'images': images,
    'thumbnail': thumbnail,
    'status': status,
    'rating': rating,
    'reviewCount': reviewCount,
    'sku': sku,
  };
}
