class ReviewModel {
  final String id;
  final String? productId;
  final String? userId;
  final int rating;
  final String? title;
  final String? comment;
  final String status;
  final DateTime createdAt;

  const ReviewModel({
    required this.id,
    this.productId,
    this.userId,
    required this.rating,
    this.title,
    this.comment,
    this.status = 'pending',
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? json['product_id']?.toString(),
      userId: json['userId']?.toString() ?? json['user_id']?.toString(),
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      title: json['title']?.toString(),
      comment: json['comment']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : json['created_at'] != null
              ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
              : DateTime.now(),
    );
  }
}
