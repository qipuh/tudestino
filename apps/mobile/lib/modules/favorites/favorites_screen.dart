import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/favorites_provider.dart';
import '../properties/property_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        context.read<FavoritesProvider>().loadFavorites();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    if (!authProvider.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Favoritos')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.favorite_border, size: 80, color: Colors.grey),
              const SizedBox(height: 16),
              const Text(
                'Inicia sesión para ver tus favoritos',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushNamed('/login');
                },
                child: const Text('Iniciar sesión'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Favoritos'),
      ),
      body: Consumer<FavoritesProvider>(
        builder: (context, favoritesProvider, _) {
          if (favoritesProvider.isLoading && favoritesProvider.favorites.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final favorites = favoritesProvider.favorites;

          if (favorites.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.favorite_border,
                      size: 80, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'No tienes propiedades favoritas',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Explora y guarda tus lugares favoritos',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushNamed('/search');
                    },
                    icon: const Icon(Icons.search),
                    label: const Text('Explorar propiedades'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: favoritesProvider.loadFavorites,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favorites.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: PropertyCard(property: favorites[index]),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
