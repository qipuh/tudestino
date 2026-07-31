import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:video_player/video_player.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../providers/social_provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../models/social_post.dart';

class CommentsScreen extends StatefulWidget {
  final String contentType;
  final String contentId;
  final SocialPost? post;
  final Reel? reel;

  const CommentsScreen({
    super.key,
    required this.contentType,
    required this.contentId,
    this.post,
    this.reel,
  });

  @override
  State<CommentsScreen> createState() => _CommentsScreenState();
}

class _CommentsScreenState extends State<CommentsScreen> {
  final TextEditingController _commentController = TextEditingController();
  VideoPlayerController? _videoController;

  @override
  void initState() {
    super.initState();
    timeago.setLocaleMessages('es', timeago.EsMessages());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SocialProvider>(context, listen: false)
          .loadComments(widget.contentType, widget.contentId);
    });

    if (widget.reel != null) {
      _videoController = VideoPlayerController.networkUrl(Uri.parse(widget.reel!.videoUrl))
        ..setLooping(true)
        ..initialize().then((_) {
          if (mounted) {
            setState(() {});
            _videoController?.play();
          }
        });
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _submitComment() async {
    if (_commentController.text.trim().isEmpty) return;

    final socialProvider = Provider.of<SocialProvider>(context, listen: false);
    final success = await socialProvider.addComment(
      widget.contentType,
      widget.contentId,
      _commentController.text.trim(),
    );

    if (success) {
      _commentController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  Widget? _buildMediaHeader() {
    final post = widget.post;
    final reel = widget.reel;

    if (post == null && reel == null) return null;

    final user = post?.user ?? reel?.user;
    final caption = post?.caption ?? reel?.caption ?? '';

    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundImage: user?.profilePicture != null
                      ? CachedNetworkImageProvider(user!.profilePicture!)
                      : null,
                  child: user?.profilePicture == null
                      ? const Icon(Icons.person, size: 18)
                      : null,
                ),
                const SizedBox(width: 10),
                Text(
                  user?.name ?? 'Usuario',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
              ],
            ),
          ),
          if (post != null && post.mediaUrls.isNotEmpty)
            SizedBox(
              height: 300,
              child: PageView.builder(
                itemCount: post.mediaUrls.length,
                itemBuilder: (context, index) => CachedNetworkImage(
                  imageUrl: post.mediaUrls[index],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  placeholder: (_, __) => Container(color: AppTheme.sand),
                  errorWidget: (_, __, ___) => Container(
                    color: AppTheme.sand,
                    child: const Icon(Icons.error_outline),
                  ),
                ),
              ),
            )
          else if (reel != null)
            SizedBox(
              height: 300,
              width: double.infinity,
              child: _videoController != null && _videoController!.value.isInitialized
                  ? FittedBox(
                      fit: BoxFit.cover,
                      clipBehavior: Clip.hardEdge,
                      child: SizedBox(
                        width: _videoController!.value.size.width,
                        height: _videoController!.value.size.height,
                        child: VideoPlayer(_videoController!),
                      ),
                    )
                  : Container(
                      color: Colors.black,
                      child: reel.thumbnailUrl != null
                          ? CachedNetworkImage(imageUrl: reel.thumbnailUrl!, fit: BoxFit.cover)
                          : const Center(child: CircularProgressIndicator()),
                    ),
            ),
          if (caption.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(caption, style: const TextStyle(fontSize: 14)),
            ),
          const Divider(height: 1),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final socialProvider = Provider.of<SocialProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final mediaHeader = _buildMediaHeader();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: const Text('Publicación'),
      ),
      body: Column(
        children: [
          Expanded(
            child: CustomScrollView(
              slivers: [
                if (mediaHeader != null) SliverToBoxAdapter(child: mediaHeader),
                if (socialProvider.isLoading && socialProvider.comments.isEmpty)
                  const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (socialProvider.comments.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Column(
                        children: [
                          Icon(Icons.chat_bubble_outline, size: 60, color: Colors.grey),
                          SizedBox(height: 16),
                          Text('No hay comentarios', style: TextStyle(color: Colors.grey)),
                          SizedBox(height: 8),
                          Text(
                            'Sé el primero en comentar',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => CommentTile(comment: socialProvider.comments[index]),
                        childCount: socialProvider.comments.length,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Colors.grey.shade300),
              ),
            ),
            padding: const EdgeInsets.all(8.0),
            child: SafeArea(
              child: authProvider.isAuthenticated
                  ? Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundImage: authProvider.user?.profilePicture != null
                              ? CachedNetworkImageProvider(
                                  authProvider.user!.profilePicture!)
                              : null,
                          child: authProvider.user?.profilePicture == null
                              ? const Icon(Icons.person, size: 20)
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _commentController,
                            decoration: InputDecoration(
                              hintText: 'Añade un comentario...',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24),
                                borderSide: BorderSide.none,
                              ),
                              filled: true,
                              fillColor: Colors.grey.shade100,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                            ),
                            maxLines: null,
                            textInputAction: TextInputAction.send,
                            onSubmitted: (_) => _submitComment(),
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.send,
                            color: _commentController.text.isEmpty
                                ? Colors.grey
                                : Theme.of(context).primaryColor,
                          ),
                          onPressed: _submitComment,
                        ),
                      ],
                    )
                  : GestureDetector(
                      onTap: () {
                        Navigator.of(context).pushNamed('/login');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.login, color: Theme.of(context).primaryColor),
                            const SizedBox(width: 8),
                            Text(
                              'Inicia sesión para comentar',
                              style: TextStyle(
                                color: Theme.of(context).primaryColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class CommentTile extends StatelessWidget {
  final Comment comment;

  const CommentTile({super.key, required this.comment});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundImage: comment.user?.profilePicture != null
                ? CachedNetworkImageProvider(comment.user!.profilePicture!)
                : null,
            child: comment.user?.profilePicture == null
                ? const Icon(Icons.person, size: 20)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        comment.user?.name ?? 'Usuario',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        comment.text,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.only(left: 12),
                  child: Text(
                    timeago.format(comment.createdAt, locale: 'es'),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
