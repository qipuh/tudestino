import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../providers/social_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/social_post.dart';
import 'comments_screen.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    timeago.setLocaleMessages('es', timeago.EsMessages());

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SocialProvider>(context, listen: false).loadFeed(refresh: true);
    });

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final socialProvider = Provider.of<SocialProvider>(context, listen: false);
      if (!socialProvider.isLoading && socialProvider.hasMorePosts) {
        socialProvider.loadFeed();
      }
    }
  }

  Future<void> _onRefresh() async {
    await Provider.of<SocialProvider>(context, listen: false)
        .loadFeed(refresh: true);
  }

  @override
  Widget build(BuildContext context) {
    final socialProvider = Provider.of<SocialProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'TuDestino',
          style: TextStyle(
            fontFamily: 'Pacifico',
            fontSize: 24,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_box_outlined),
            onPressed: () {
              if (authProvider.isAuthenticated) {
                Navigator.of(context).pushNamed('/create-post');
              } else {
                Navigator.of(context).pushNamed('/login');
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.of(context).pushNamed('/notifications');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: socialProvider.feedPosts.isEmpty && socialProvider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : socialProvider.feedPosts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.photo_library_outlined,
                            size: 80, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text(
                          'No hay publicaciones',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).pushNamed('/create-post');
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Crear publicación'),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    itemCount: socialProvider.feedPosts.length + 1,
                    itemBuilder: (context, index) {
                      if (index == socialProvider.feedPosts.length) {
                        return socialProvider.isLoading
                            ? const Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Center(child: CircularProgressIndicator()),
                              )
                            : const SizedBox(height: 80);
                      }
                      return PostCard(
                        post: socialProvider.feedPosts[index],
                        currentUserId: authProvider.user?.id,
                      );
                    },
                  ),
      ),
    );
  }
}

class PostCard extends StatelessWidget {
  final SocialPost post;
  final String? currentUserId;

  const PostCard({
    super.key,
    required this.post,
    this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Colors.grey.shade300, width: 0.5),
          bottom: BorderSide(color: Colors.grey.shade300, width: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundImage: post.user?.profilePicture != null
                      ? CachedNetworkImageProvider(post.user!.profilePicture!)
                      : null,
                  child: post.user?.profilePicture == null
                      ? const Icon(Icons.person, size: 20)
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post.user?.name ?? 'Usuario',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        timeago.format(post.createdAt, locale: 'es'),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (currentUserId == post.userId)
                  IconButton(
                    icon: const Icon(Icons.more_horiz),
                    onPressed: () => _showPostOptions(context),
                  ),
              ],
            ),
          ),

          // Image carousel
          if (post.mediaUrls.isNotEmpty)
            SizedBox(
              height: 400,
              child: PageView.builder(
                itemCount: post.mediaUrls.length,
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onDoubleTap: () => _handleLike(context),
                    child: CachedNetworkImage(
                      imageUrl: post.mediaUrls[index],
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey.shade200,
                        child: const Center(child: CircularProgressIndicator()),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.error, size: 60),
                      ),
                    ),
                  );
                },
              ),
            ),

          // Action buttons
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(
                    post.isLiked ? Icons.favorite : Icons.favorite_border,
                    color: post.isLiked ? Colors.red : Colors.black,
                  ),
                  onPressed: () => _handleLike(context),
                ),
                IconButton(
                  icon: const Icon(Icons.chat_bubble_outline),
                  onPressed: () => _navigateToComments(context),
                ),
                IconButton(
                  icon: const Icon(Icons.send_outlined),
                  onPressed: () {
                    // TODO: Compartir
                  },
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.bookmark_border),
                  onPressed: () {
                    // TODO: Guardar
                  },
                ),
              ],
            ),
          ),

          // Likes count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              '${post.likesCount} ${post.likesCount == 1 ? "Me gusta" : "Me gusta"}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),

          // Caption
          if (post.caption.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: RichText(
                text: TextSpan(
                  style: const TextStyle(color: Colors.black, fontSize: 14),
                  children: [
                    TextSpan(
                      text: post.user?.name ?? 'Usuario',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const TextSpan(text: ' '),
                    TextSpan(text: post.caption),
                  ],
                ),
              ),
            ),

          // View comments
          if (post.commentsCount > 0)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: GestureDetector(
                onTap: () => _navigateToComments(context),
                child: Text(
                  'Ver los ${post.commentsCount} comentarios',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 13,
                  ),
                ),
              ),
            ),

          const SizedBox(height: 12),
        ],
      ),
    );
  }

  void _handleLike(BuildContext context) {
    Provider.of<SocialProvider>(context, listen: false).toggleLikePost(post.id);
  }

  void _navigateToComments(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CommentsScreen(
          contentType: 'post',
          contentId: post.id,
        ),
      ),
    );
  }

  void _showPostOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.delete, color: Colors.red),
              title: const Text(
                'Eliminar',
                style: TextStyle(color: Colors.red),
              ),
              onTap: () async {
                Navigator.pop(context);
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Eliminar publicación'),
                    content: const Text(
                        '¿Estás seguro que deseas eliminar esta publicación?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancelar'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        style: TextButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('Eliminar'),
                      ),
                    ],
                  ),
                );

                if (confirm == true && context.mounted) {
                  final success = await Provider.of<SocialProvider>(
                    context,
                    listen: false,
                  ).deletePost(post.id);

                  if (success && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Publicación eliminada'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.cancel),
              title: const Text('Cancelar'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
