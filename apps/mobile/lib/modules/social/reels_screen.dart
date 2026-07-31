import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../providers/social_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/social_post.dart';
import 'comments_screen.dart';

class ReelsScreen extends StatefulWidget {
  const ReelsScreen({super.key});

  @override
  State<ReelsScreen> createState() => _ReelsScreenState();
}

class _ReelsScreenState extends State<ReelsScreen> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    timeago.setLocaleMessages('es', timeago.EsMessages());
    _pageController = PageController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SocialProvider>(context, listen: false).loadReels();
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final socialProvider = Provider.of<SocialProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Reels',
          style: TextStyle(
            fontFamily: 'Pacifico',
            fontSize: 24,
            color: Colors.white,
            shadows: [
              Shadow(
                blurRadius: 8.0,
                color: Colors.black54,
                offset: Offset(0, 2),
              ),
            ],
          ),
        ),
        iconTheme: const IconThemeData(
          color: Colors.white,
          shadows: [
            Shadow(
              blurRadius: 8.0,
              color: Colors.black54,
              offset: Offset(0, 2),
            ),
          ],
        ),
      ),
      body: socialProvider.reels.isEmpty && socialProvider.isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : socialProvider.reels.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.video_library_outlined,
                          size: 80, color: Colors.grey),
                      const SizedBox(height: 16),
                      const Text(
                        'No hay reels disponibles',
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                      const SizedBox(height: 8),
                      if (authProvider.isAuthenticated)
                        ElevatedButton.icon(
                          onPressed: () async {
                            final created = await Navigator.of(context).pushNamed('/create-post');
                            if (created == true && context.mounted) {
                              Provider.of<SocialProvider>(context, listen: false).loadReels();
                            }
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Crear reel'),
                        ),
                    ],
                  ),
                )
              : PageView.builder(
                  controller: _pageController,
                  scrollDirection: Axis.vertical,
                  itemCount: socialProvider.reels.length,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemBuilder: (context, index) {
                    final reel = socialProvider.reels[index];
                    return ReelVideoPlayer(
                      reel: reel,
                      isCurrentPage: _currentPage == index,
                    );
                  },
                ),
    );
  }
}

class ReelVideoPlayer extends StatefulWidget {
  final Reel reel;
  final bool isCurrentPage;

  const ReelVideoPlayer({
    super.key,
    required this.reel,
    required this.isCurrentPage,
  });

  @override
  State<ReelVideoPlayer> createState() => _ReelVideoPlayerState();
}

class _ReelVideoPlayerState extends State<ReelVideoPlayer> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      print('Initializing video: ${widget.reel.videoUrl}');

      // Sin httpHeaders manuales: forzar 'Connection: keep-alive' rompía la
      // inicialización en Android (ExoPlayer) - el mismo video sí cargaba
      // en el preview de comentarios, que no manda ese header.
      _controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.reel.videoUrl),
      );

      _controller.addListener(() {
        if (_controller.value.hasError) {
          print('Video player error: ${_controller.value.errorDescription}');
          if (mounted) {
            setState(() {
              _hasError = true;
            });
          }
        }
      });

      await _controller.initialize();
      _controller.setLooping(true);
      _controller.setVolume(1.0);

      if (mounted) {
        setState(() {
          _isInitialized = true;
        });

        if (widget.isCurrentPage) {
          _controller.play();
        }
      }
    } catch (e) {
      print('Error initializing video: $e');
      print('Video URL: ${widget.reel.videoUrl}');
      if (mounted) {
        setState(() {
          _hasError = true;
        });
      }
    }
  }

  @override
  void didUpdateWidget(ReelVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.isCurrentPage != oldWidget.isCurrentPage) {
      if (widget.isCurrentPage && _isInitialized) {
        _controller.play();
      } else if (_isInitialized) {
        _controller.pause();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _togglePlay() {
    setState(() {
      if (_controller.value.isPlaying) {
        _controller.pause();
      } else {
        _controller.play();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    return Stack(
      fit: StackFit.expand,
      children: [
        // Video Player
        if (_hasError)
          Container(
            color: Colors.black,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 80, color: Colors.white54),
                const SizedBox(height: 16),
                const Text(
                  'Error al cargar el video',
                  style: TextStyle(color: Colors.white70, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.reel.videoUrl,
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          )
        else if (!_isInitialized)
          Container(
            color: Colors.black,
            child: widget.reel.thumbnailUrl != null
                ? CachedNetworkImage(
                    imageUrl: widget.reel.thumbnailUrl!,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                    errorWidget: (context, url, error) => const Center(
                      child: Icon(Icons.videocam_off, size: 80, color: Colors.white54),
                    ),
                  )
                : const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  ),
          )
        else
          GestureDetector(
            onTap: _togglePlay,
            child: FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _controller.value.size.width,
                height: _controller.value.size.height,
                child: VideoPlayer(_controller),
              ),
            ),
          ),

        // Play/Pause Icon
        if (_isInitialized && !_controller.value.isPlaying)
          Center(
            child: Icon(
              Icons.play_circle_outline,
              size: 80,
              color: Colors.white.withOpacity(0.7),
            ),
          ),

        // Right side actions
        Positioned(
          right: 12,
          bottom: 100,
          child: Column(
            children: [
              // User Avatar
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Perfil de ${widget.reel.user?.name ?? "usuario"}'),
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
                child: CircleAvatar(
                  radius: 24,
                  backgroundImage: widget.reel.user?.profilePicture != null
                      ? CachedNetworkImageProvider(widget.reel.user!.profilePicture!)
                      : null,
                  child: widget.reel.user?.profilePicture == null
                      ? const Icon(Icons.person, size: 24)
                      : null,
                ),
              ),
              const SizedBox(height: 24),

              // Like
              _buildActionButton(
                icon: widget.reel.isLiked ? Icons.favorite : Icons.favorite_border,
                label: widget.reel.likesCount.toString(),
                color: widget.reel.isLiked ? Colors.red : Colors.white,
                onTap: () => _handleLike(context, authProvider),
              ),
              const SizedBox(height: 24),

              // Comments
              _buildActionButton(
                icon: Icons.chat_bubble_outline,
                label: widget.reel.commentsCount.toString(),
                onTap: () => _navigateToComments(context),
              ),
              const SizedBox(height: 24),

              // Share
              _buildActionButton(
                icon: Icons.share_outlined,
                label: widget.reel.sharesCount.toString(),
                onTap: () {
                  // TODO: Implement share
                },
              ),
            ],
          ),
        ),

        // Bottom info
        Positioned(
          left: 12,
          right: 80,
          bottom: 40,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Username
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Perfil de ${widget.reel.user?.name ?? "usuario"}'),
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
                child: Text(
                  '@${widget.reel.user?.name ?? "usuario"}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    shadows: [
                      Shadow(
                        blurRadius: 8.0,
                        color: Colors.black54,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Caption
              if (widget.reel.caption.isNotEmpty)
                Text(
                  widget.reel.caption,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    shadows: [
                      Shadow(
                        blurRadius: 8.0,
                        color: Colors.black54,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),

              // Location
              if (widget.reel.location != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.white, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        widget.reel.location!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          shadows: [
                            Shadow(
                              blurRadius: 8.0,
                              color: Colors.black54,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    Color color = Colors.white,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Colors.black26,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 32),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              shadows: [
                Shadow(
                  blurRadius: 8.0,
                  color: Colors.black54,
                  offset: Offset(0, 1),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleLike(BuildContext context, AuthProvider authProvider) async {
    if (!authProvider.isAuthenticated) {
      _showLoginPrompt(context);
      return;
    }

    await Provider.of<SocialProvider>(context, listen: false)
        .toggleLikeReel(widget.reel.id);
  }

  void _navigateToComments(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CommentsScreen(
          contentType: 'reel',
          contentId: widget.reel.id,
          reel: widget.reel,
        ),
      ),
    );
  }

  void _showLoginPrompt(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Iniciar sesión'),
        content: const Text(
            '¿Quieres dar me gusta a este reel? Inicia sesión para interactuar.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.of(context).pushNamed('/login');
            },
            child: const Text('Iniciar sesión'),
          ),
        ],
      ),
    );
  }
}
