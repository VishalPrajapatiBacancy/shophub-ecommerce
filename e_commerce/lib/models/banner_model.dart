class BannerModel {
  final String id;
  final String title;
  final String? imageUrl;
  final String linkType;
  final String? linkValue;
  final int sortOrder;
  final bool isActive;

  const BannerModel({
    required this.id,
    required this.title,
    this.imageUrl,
    this.linkType = 'none',
    this.linkValue,
    this.sortOrder = 0,
    this.isActive = true,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString(),
      linkType: json['linkType']?.toString() ?? json['link_type']?.toString() ?? 'none',
      linkValue: json['linkValue']?.toString() ?? json['link_value']?.toString(),
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? (json['sort_order'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
    );
  }
}
