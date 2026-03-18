class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? imageUrl;
  final String? description;
  final String? parentId;
  final int sortOrder;
  final bool isActive;
  final int productCount;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.imageUrl,
    this.description,
    this.parentId,
    this.sortOrder = 0,
    this.isActive = true,
    this.productCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString(),
      description: json['description']?.toString(),
      parentId: json['parentId']?.toString() ?? json['parent_id']?.toString(),
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? (json['sort_order'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
      productCount: (json['productCount'] as num?)?.toInt() ?? (json['product_count'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    'imageUrl': imageUrl,
    'description': description,
    'parentId': parentId,
    'sortOrder': sortOrder,
    'isActive': isActive,
    'productCount': productCount,
  };
}
