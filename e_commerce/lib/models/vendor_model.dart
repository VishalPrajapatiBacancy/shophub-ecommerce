class VendorModel {
  final String id;
  final String storeName;
  final String slug;
  final String? description;
  final String? logoUrl;
  final String? bannerUrl;
  final double rating;
  final int totalOrders;
  final String createdAt;

  const VendorModel({
    required this.id,
    required this.storeName,
    required this.slug,
    this.description,
    this.logoUrl,
    this.bannerUrl,
    this.rating = 0,
    this.totalOrders = 0,
    required this.createdAt,
  });

  factory VendorModel.fromJson(Map<String, dynamic> json) {
    return VendorModel(
      id: json['id']?.toString() ?? '',
      storeName: json['storeName']?.toString() ?? json['store_name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString(),
      logoUrl: json['logoUrl']?.toString() ?? json['logo_url']?.toString(),
      bannerUrl: json['bannerUrl']?.toString() ?? json['banner_url']?.toString(),
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? (json['total_orders'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'storeName': storeName,
    'slug': slug,
    'description': description,
    'logoUrl': logoUrl,
    'bannerUrl': bannerUrl,
    'rating': rating,
    'totalOrders': totalOrders,
    'createdAt': createdAt,
  };
}
