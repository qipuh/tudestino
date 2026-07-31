import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final theme = Theme.of(context);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Perfil')),
        body: const Center(
          child: Text('No has iniciado sesión'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.of(context).pushNamed('/account-settings');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.primaryColor,
                    theme.primaryColor.withOpacity(0.8),
                  ],
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: Colors.white,
                    child: user.profilePicture != null
                        ? ClipOval(
                            child: Image.network(
                              user.profilePicture!,
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                            ),
                          )
                        : const Icon(Icons.person, size: 50),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user.name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      user.role == 'guest'
                          ? 'Viajero'
                          : user.role == 'host'
                              ? 'Anfitrión'
                              : 'Admin',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Stats (if host)
            if (user.role == 'host' && user.hostRating != null)
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem(
                      icon: Icons.star,
                      label: 'Calificación',
                      value: user.hostRating!.toStringAsFixed(1),
                      color: Colors.amber,
                    ),
                    _buildStatItem(
                      icon: Icons.rate_review,
                      label: 'Reseñas',
                      value: '${user.hostReviewCount ?? 0}',
                      color: Colors.blue,
                    ),
                  ],
                ),
              ),

            // Menu Items
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.book_online,
                    title: 'Mis Reservas',
                    subtitle: 'Ver historial de reservas',
                    onTap: () {
                      Navigator.of(context).pushNamed('/bookings');
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.favorite,
                    title: 'Favoritos',
                    subtitle: 'Propiedades guardadas',
                    onTap: () {
                      Navigator.of(context).pushNamed('/favorites');
                    },
                  ),
                  if (user.role == 'host')
                    _buildMenuItem(
                      icon: Icons.hotel,
                      title: 'Mis Propiedades',
                      subtitle: 'Gestionar alojamientos',
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Próximamente')),
                        );
                      },
                    ),
                  _buildMenuItem(
                    icon: Icons.notifications,
                    title: 'Notificaciones',
                    subtitle: 'Ver tus notificaciones',
                    onTap: () {
                      Navigator.of(context).pushNamed('/notifications');
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.help,
                    title: 'Ayuda y Soporte',
                    subtitle: 'Centro de ayuda',
                    onTap: () {
                      Navigator.of(context).pushNamed('/help-support');
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.logout,
                    title: 'Cerrar Sesión',
                    subtitle: 'Salir de la aplicación',
                    onTap: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Cerrar Sesión'),
                          content: const Text(
                              '¿Estás seguro que deseas cerrar sesión?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('Cancelar'),
                            ),
                            TextButton(
                              onPressed: () => Navigator.pop(context, true),
                              child: const Text('Cerrar Sesión'),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true && context.mounted) {
                        await authProvider.logout();
                        if (context.mounted) {
                          Navigator.of(context).pushNamedAndRemoveUntil(
                            '/',
                            (route) => false,
                          );
                        }
                      }
                    },
                    iconColor: Colors.red,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
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

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? iconColor,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: iconColor),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
