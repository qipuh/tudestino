import 'package:dio/dio.dart' as dio;
import 'package:flutter/material.dart';
import '../models/social_post.dart';
import '../core/services/api_service.dart';

class SocialProvider with ChangeNotifier {
  final ApiService _apiService;

  List<SocialPost> _feedPosts = [];
  List<Reel> _reels = [];
  List<Comment> _comments = [];
  List<SocialPost> _savedPosts = [];
  final Set<String> _savedPostIds = {};
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMorePosts = true;

  SocialProvider(this._apiService);

  List<SocialPost> get feedPosts => _feedPosts;
  List<Reel> get reels => _reels;
  List<Comment> get comments => _comments;
  List<SocialPost> get savedPosts => _savedPosts;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMorePosts => _hasMorePosts;

  bool isPostSaved(String postId) => _savedPostIds.contains(postId);

  Future<void> loadSavedPosts() async {
    try {
      final response = await _apiService.get('/social/posts/saved/me');
      if (response.data['success'] == true) {
        _savedPosts = (response.data['data'] as List)
            .map((json) => SocialPost.fromJson(json))
            .toList();
        _savedPostIds
          ..clear()
          ..addAll(_savedPosts.map((p) => p.id));
        notifyListeners();
      }
    } catch (_) {
      // silencioso
    }
  }

  Future<void> toggleSavePost(String postId) async {
    final wasSaved = _savedPostIds.contains(postId);
    if (wasSaved) {
      _savedPostIds.remove(postId);
    } else {
      _savedPostIds.add(postId);
    }
    notifyListeners();

    try {
      final response = await _apiService.post('/social/posts/$postId/save');
      final isSaved = response.data['isSaved'] == true;
      if (isSaved) {
        _savedPostIds.add(postId);
      } else {
        _savedPostIds.remove(postId);
      }
      notifyListeners();
    } catch (_) {
      if (wasSaved) {
        _savedPostIds.add(postId);
      } else {
        _savedPostIds.remove(postId);
      }
      notifyListeners();
    }
  }

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
    String? location,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final formData = dio.FormData.fromMap({
        'caption': caption,
        if (location != null) 'location': location,
        'media': await Future.wait(
          mediaPaths.map((path) => dio.MultipartFile.fromFile(path)),
        ),
      });

      final response = await _apiService.post('/social/posts', data: formData);

      if (response.data['success'] == true) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = response.data['message'] ?? 'Error al crear post';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      if (e is dio.DioException && e.response?.data is Map) {
        _error = (e.response!.data['message'] ?? 'Error al crear post').toString();
      } else {
        _error = 'Error de conexión. Verifica tu internet.';
      }
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> createReel({
    required String videoPath,
    String? caption,
    String? location,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final formData = dio.FormData.fromMap({
        if (caption != null) 'caption': caption,
        if (location != null) 'location': location,
        'video': await dio.MultipartFile.fromFile(videoPath),
      });

      final response = await _apiService.post('/social/reels', data: formData);

      if (response.data['success'] == true) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = response.data['message'] ?? 'Error al crear reel';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      if (e is dio.DioException && e.response?.data is Map) {
        _error = (e.response!.data['message'] ?? 'Error al crear reel').toString();
      } else {
        _error = 'Error de conexión. Verifica tu internet.';
      }
      _isLoading = false;
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
