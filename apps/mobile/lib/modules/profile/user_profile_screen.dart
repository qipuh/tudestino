import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/services/api_service.dart';
import '../../models/user.dart';
import '../../models/social_post.dart';
import '../../models/property.dart';

class UserProfileScreen extends StatefulWidget {
  final String userId;

  const UserProfileScreen({super.key, required this.userId});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  User? _profileUser;
  bool _isLoading = true;
  List<SocialPost> _posts = [];
  List<Property> _properties = [];
  int _followersCount = 0;
  int _followingCount = 0;
  bool _isFollowing = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfile();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    try {
      setState(() => _isLoading = true);

      final api = ApiService();

      // Cargar perfil del usuario
      final profileResponse = await api.get('/social/profile/${widget.userId}');
      final profileData = profileResponse.data['data'] ?? profileResponse.data;

      setState(() {
        _profileUser = User.fromJson(profileData);
        _followersCount = profileData['followersCount'] ?? 0;
        _followingCount = profileData['followingCount'] ?? 0;
        _isFollowing = profileData['isFollowing'] ?? false;
      });

      // Cargar posts del usuario
      try {
        final postsResponse = await api.get('/social/posts/user/${widget.userId}');
        final postsData = postsResponse.data['data'] ?? postsResponse.data;
        setState(() {
          _posts = (postsData as List).map((p) => SocialPost.fromJson(p)).toList();
        });
      } catch (e) {
        print('Error loading posts: $e');
      }

      // Si es host, cargar propiedades
      if (_profileUser?.role == 'host') {
        try {
          final propertiesResponse = await api.get('/properties?hostId=${widget.userId}');
          final propertiesData = propertiesResponse.data['data'] ?? propertiesResponse.data;
          setState(() {
            _properties = (propertiesData as List)
                .map((p) => Property.fromJson(p))
                .toList();
          });
        } catch (e) {
          print('Error loading properties: $e');
        }
      }
    } catch (e) {
      print('Error loading profile: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar el perfil: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _toggleFollow() async {
    try {
      final api = ApiService();
      if (_isFollowing) {
        await api.post('/social/unfollow/${widget.userId}');
        setState(() {
          _isFollowing = false;
          _followersCount--;
        });
      } else {
        await api.post('/social/follow/${widget.userId}');
        setState(() {
          _isFollowing = true;
          _followersCount++;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  void _openChat() {
    Navigator.of(context).pushNamed(
      '/messages',
      arguments: {'otherUserId': widget.userId},
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUser = authProvider.user;
    final isOwnProfile = currentUser?.id == widget.userId;
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_profileUser == null) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: const Center(child: Text('Usuario no encontrado')),
      );
    }

    final isHost = _profileUser!.role == 'host';

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 280,
              floating: false,
              pinned: true,
              backgroundColor: Colors.white,
              elevation: innerBoxIsScrolled ? 1 : 0,
              flexibleSpace: FlexibleSpaceBar(
                background: _buildHeader(theme, isOwnProfile),
              ),
            ),
          ];
        },
        body: Column(
          children: [
            // Stats bar
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildStatItem(
                    _posts.length.toString(),
                    'Publicaciones',
                    theme,
                  ),
                  _buildStatItem(
                    _followersCount.toString(),
                    'Seguidores',
                    theme,
                  ),
                  _buildStatItem(
                    _followingCount.toString(),
                    'Seguidos',
                    theme,
                  ),
                  if (isHost)
                    _buildStatItem(
                      _properties.length.toString(),
                      'Propiedades',
                      theme,
                    ),
                ],
              ),
            ),

            // Tabs
            Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                labelColor: theme.primaryColor,
                unselectedLabelColor: Colors.grey,
                indicatorColor: theme.primaryColor,
                tabs: [
                  const Tab(icon: Icon(Icons.grid_on), text: 'Muro'),
                  if (isHost) const Tab(icon: Icon(Icons.home), text: 'Propiedades'),
                  const Tab(icon: Icon(Icons.info_outline), text: 'Info'),
                ],
              ),
            ),

            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildPostsTab(),
                  if (isHost) _buildPropertiesTab(),
                  _buildInfoTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme, bool isOwnProfile) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            theme.primaryColor.withOpacity(0.1),
            Colors.white,
          ],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),
            // Avatar
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: theme.primaryColor,
                  width: 3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: theme.primaryColor.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.grey.shade200,
                backgroundImage: _profileUser!.profilePicture != null
                    ? CachedNetworkImageProvider(_profileUser!.profilePicture!)
                    : null,
                child: _profileUser!.profilePicture == null
                    ? Icon(Icons.person, size: 50, color: Colors.grey.shade400)
                    : null,
              ),
            ),
            const SizedBox(height: 16),

            // Name
            Text(
              _profileUser!.name,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),

            // Username
            if (_profileUser!.username != null)
              Text(
                '@${_profileUser!.username}',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey.shade600,
                ),
              ),
            const SizedBox(height: 8),

            // Role badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _profileUser!.role == 'host'
                    ? Colors.blue.withOpacity(0.1)
                    : theme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _profileUser!.role == 'host'
                      ? Colors.blue
                      : theme.primaryColor,
                ),
              ),
              child: Text(
                _profileUser!.role == 'host' ? 'Anfitrión' : 'Viajero',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: _profileUser!.role == 'host'
                      ? Colors.blue
                      : theme.primaryColor,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Action buttons
            if (!isOwnProfile)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: _toggleFollow,
                    icon: Icon(
                      _isFollowing ? Icons.person_remove : Icons.person_add,
                      size: 18,
                    ),
                    label: Text(_isFollowing ? 'Dejar de seguir' : 'Seguir'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: _openChat,
                    icon: const Icon(Icons.message, size: 18),
                    label: const Text('Mensaje'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label, ThemeData theme) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: theme.primaryColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildPostsTab() {
    if (_posts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.photo_library_outlined,
                size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(
              'Sin publicaciones aún',
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(4),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 4,
        mainAxisSpacing: 4,
      ),
      itemCount: _posts.length,
      itemBuilder: (context, index) {
        final post = _posts[index];
        return GestureDetector(
          onTap: () {
            // TODO: Abrir detalle del post
          },
          child: post.mediaUrls.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: post.mediaUrls.first,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    color: Colors.grey.shade200,
                    child: const Center(child: CircularProgressIndicator()),
                  ),
                  errorWidget: (context, url, error) => Container(
                    color: Colors.grey.shade200,
                    child: const Icon(Icons.error),
                  ),
                )
              : Container(
                  color: Colors.grey.shade200,
                  child: const Center(
                    child: Icon(Icons.image),
                  ),
                ),
        );
      },
    );
  }

  Widget _buildPropertiesTab() {
    if (_properties.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_outlined, size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(
              'Sin propiedades registradas',
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _properties.length,
      itemBuilder: (context, index) {
        final property = _properties[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: InkWell(
            onTap: () {
              Navigator.of(context).pushNamed(
                '/property-detail',
                arguments: {
                  'propertyId': property.id,
                },
              );
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (property.rooms.isNotEmpty &&
                    property.rooms.first.images.isNotEmpty)
                  CachedNetworkImage(
                    imageUrl: property.rooms.first.images.first,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        property.displayName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on,
                              size: 14, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(
                            '${property.addressCity}, ${property.addressCountry}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      if (property.ratingCount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.star, size: 16, color: Colors.amber),
                            const SizedBox(width: 4),
                            Text(
                              '${property.ratingAverage.toStringAsFixed(1)} (${property.ratingCount})',
                              style: const TextStyle(fontSize: 13),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_profileUser!.bio != null && _profileUser!.bio!.isNotEmpty) ...[
          const Text(
            'Biografía',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _profileUser!.bio!,
            style: const TextStyle(fontSize: 15, height: 1.5),
          ),
          const Divider(height: 32),
        ],

        const Text(
          'Información de contacto',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),

        _buildInfoItem(Icons.email, _profileUser!.email),
        if (_profileUser!.phone != null)
          _buildInfoItem(Icons.phone, _profileUser!.phone!),

        const Divider(height: 32),

        const Text(
          'Miembro desde',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        _buildInfoItem(
          Icons.calendar_today,
          _formatDate(_profileUser!.createdAt),
        ),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 15),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }
}
