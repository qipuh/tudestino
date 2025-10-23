import 'package:flutter/material.dart';
import '../models/social_post.dart';
import '../core/services/api_service.dart';

class SocialProvider with ChangeNotifier {
  final ApiService _apiService;

  List<SocialPost> _feedPosts = [];
  List<Reel> _reels = [];
  List<Comment> _comments = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMorePosts = true;

  SocialProvider(this._apiService);

  List<SocialPost> get feedPosts => _feedPosts;
  List<Reel> get reels => _reels;
  List<Comment> get comments => _comments;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMorePosts => _hasMorePosts;

  // Load feed posts
  Future<void> loadFeed({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMorePosts = true;
      _feedPosts = [];
    }

    if (!_hasMorePosts || _isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(
        '/social/feed?page=$_currentPage&limit=10',
      );

      if (response.data['success']) {
        final List<dynamic> data = response.data['data']['posts'];
        final newPosts = data.map((json) => SocialPost.fromJson(json)).toList();

        if (refresh) {
          _feedPosts = newPosts;
        } else {
          _feedPosts.addAll(newPosts);
        }

        _hasMorePosts = newPosts.length >= 10;
        _currentPage++;
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar el feed';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Load reels
  Future<void> loadReels() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/social/reels/feed');

      if (response.data['success']) {
        _reels = (response.data['data']['reels'] as List)
            .map((json) => Reel.fromJson(json))
            .toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar reels';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Toggle like on post
  Future<bool> toggleLikePost(String postId) async {
    try {
      final response = await _apiService.post(
        '/social/like',
        data: {
          'contentType': 'post',
          'contentId': postId,
        },
      );

      if (response.data['success']) {
        // Update post in local list
        final index = _feedPosts.indexWhere((p) => p.id == postId);
        if (index != -1) {
          final post = _feedPosts[index];
          _feedPosts[index] = post.copyWith(
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
          );
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Toggle like on reel
  Future<bool> toggleLikeReel(String reelId) async {
    try {
      final response = await _apiService.post(
        '/social/like',
        data: {
          'contentType': 'reel',
          'contentId': reelId,
        },
      );

      if (response.data['success']) {
        // Update reel in local list
        final index = _reels.indexWhere((r) => r.id == reelId);
        if (index != -1) {
          final reel = _reels[index];
          _reels[index] = reel.copyWith(
            isLiked: !reel.isLiked,
            likesCount: reel.isLiked ? reel.likesCount - 1 : reel.likesCount + 1,
          );
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Load comments
  Future<void> loadComments(String contentType, String contentId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(
        '/social/comments/$contentType/$contentId',
      );

      if (response.data['success']) {
        _comments = (response.data['data'] as List)
            .map((json) => Comment.fromJson(json))
            .toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar comentarios';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Add comment
  Future<bool> addComment(String contentType, String contentId, String text) async {
    try {
      final response = await _apiService.post(
        '/social/comment',
        data: {
          'contentType': contentType,
          'contentId': contentId,
          'text': text,
        },
      );

      if (response.data['success']) {
        // Reload comments
        await loadComments(contentType, contentId);

        // Update comment count
        if (contentType == 'post') {
          final index = _feedPosts.indexWhere((p) => p.id == contentId);
          if (index != -1) {
            final post = _feedPosts[index];
            _feedPosts[index] = post.copyWith(
              commentsCount: post.commentsCount + 1,
            );
          }
        } else if (contentType == 'reel') {
          final index = _reels.indexWhere((r) => r.id == contentId);
          if (index != -1) {
            final reel = _reels[index];
            _reels[index] = reel.copyWith(
              commentsCount: reel.commentsCount + 1,
            );
          }
        }
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Create post
  Future<bool> createPost({
    required String caption,
    required List<String> mediaPaths,
  }) async {
    try {
      // TODO: Implement multipart file upload
      // This would require using FormData with Dio
      _error = 'Función de crear post próximamente';
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Error al crear post';
      notifyListeners();
      return false;
    }
  }

  // Delete post
  Future<bool> deletePost(String postId) async {
    try {
      final response = await _apiService.delete('/social/posts/$postId');

      if (response.data['success']) {
        _feedPosts.removeWhere((p) => p.id == postId);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
