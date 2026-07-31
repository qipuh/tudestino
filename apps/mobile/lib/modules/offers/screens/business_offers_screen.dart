import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/offer_model.dart';
import '../services/offers_service.dart';

class BusinessOffersScreen extends StatefulWidget {
  final String businessId;
  final String? businessName;

  const BusinessOffersScreen({
    super.key,
    required this.businessId,
    this.businessName,
  });

  @override
  State<BusinessOffersScreen> createState() => _BusinessOffersScreenState();
}

class _BusinessOffersScreenState extends State<BusinessOffersScreen> {
  final OffersService _service = OffersService();
  late Future<List<OfferModel>> _offersFuture;

  @override
  void initState() {
    super.initState();
    _offersFuture = _service.getOffersByBusiness(widget.businessId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ofertas'),
        elevation: 0,
      ),
      body: FutureBuilder<List<OfferModel>>(
        future: _offersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Volver'),
                  ),
                ],
              ),
            );
          }

          final offers = snapshot.data ?? [];

          if (offers.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.local_offer_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Sin ofertas disponibles',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: offers.length,
            itemBuilder: (context, index) {
              final offer = offers[index];
              return OfferCard(offer: offer);
            },
          );
        },
      ),
    );
  }
}

class OfferCard extends StatelessWidget {
  final OfferModel offer;

  const OfferCard({
    super.key,
    required this.offer,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy', 'es_ES');
    final validityColor =
        offer.isValid ? Colors.green : Colors.red;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        offer.code,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        offer.description,
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getDiscountText(),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (offer.validFrom != null || offer.validUntil != null) ...[
              Row(
                children: [
                  Icon(Icons.calendar_today,
                      size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _getValidityText(dateFormat),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: validityColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      offer.isValid ? 'Vigente' : 'Expirada',
                      style: TextStyle(
                        fontSize: 12,
                        color: validityColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
            if (offer.maxUses != null) ...[
              Row(
                children: [
                  Icon(Icons.local_offer,
                      size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Usos: ${offer.usedCount} / ${offer.maxUses}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.content_copy,
                      size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      offer.code,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => _copyToClipboard(context),
                    child: const Text('Copiar'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getDiscountText() {
    if (offer.discountType == 'percentage') {
      return '${offer.discountValue.toStringAsFixed(0)}% OFF';
    } else if (offer.discountType == 'fixed') {
      return 'S/ ${offer.discountValue.toStringAsFixed(2)}';
    } else if (offer.discountType == 'free') {
      return 'GRATIS';
    }
    return 'DESCUENTO';
  }

  String _getValidityText(DateFormat dateFormat) {
    if (offer.validFrom != null && offer.validUntil != null) {
      return '${dateFormat.format(offer.validFrom!)} - ${dateFormat.format(offer.validUntil!)}';
    } else if (offer.validFrom != null) {
      return 'Desde ${dateFormat.format(offer.validFrom!)}';
    } else if (offer.validUntil != null) {
      return 'Hasta ${dateFormat.format(offer.validUntil!)}';
    }
    return 'Sin límite de tiempo';
  }

  void _copyToClipboard(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Código copiado')),
    );
  }
}
