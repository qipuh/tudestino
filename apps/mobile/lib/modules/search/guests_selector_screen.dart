import 'package:flutter/material.dart';

class GuestsSelectorScreen extends StatefulWidget {
  final int initialAdults;
  final int initialChildren;

  const GuestsSelectorScreen({
    super.key,
    this.initialAdults = 2,
    this.initialChildren = 0,
  });

  @override
  State<GuestsSelectorScreen> createState() => _GuestsSelectorScreenState();
}

class _GuestsSelectorScreenState extends State<GuestsSelectorScreen> {
  late int _adults;
  late int _children;

  @override
  void initState() {
    super.initState();
    _adults = widget.initialAdults;
    _children = widget.initialChildren;
  }

  int get _totalGuests => _adults + _children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('¿Quiénes viajan?'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context, {
                'adults': _adults,
                'children': _children,
              });
            },
            child: Text(
              'Confirmar',
              style: TextStyle(
                color: theme.primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Adultos
          _buildGuestCounter(
            'Adultos',
            'Mayores de 18 años',
            _adults,
            Icons.person,
            (value) => setState(() => _adults = value),
            min: 1,
            max: 16,
            theme: theme,
          ),

          Divider(height: 48, color: Colors.grey.shade200),

          // Niños
          _buildGuestCounter(
            'Niños',
            'Menores de 18 años',
            _children,
            Icons.child_care,
            (value) => setState(() => _children = value),
            min: 0,
            max: 10,
            theme: theme,
          ),

          const SizedBox(height: 32),

          // Resumen Total
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.primaryColor.withAlpha(25),
                  theme.primaryColor.withAlpha(10),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: theme.primaryColor.withAlpha(50),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total de huéspedes',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$_totalGuests ${_totalGuests == 1 ? "huésped" : "huéspedes"}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    if (_adults > 0 || _children > 0) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${_adults > 0 ? "$_adults ${_adults == 1 ? "adulto" : "adultos"}" : ""}${_adults > 0 && _children > 0 ? " • " : ""}${_children > 0 ? "$_children ${_children == 1 ? "niño" : "niños"}" : ""}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.primaryColor,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '$_totalGuests',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Información adicional
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.blue.shade100,
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Verifica la capacidad máxima de huéspedes en cada propiedad',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.blue.shade900,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(25),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: () {
              Navigator.pop(context, {
                'adults': _adults,
                'children': _children,
              });
            },
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Confirmar ($_totalGuests ${_totalGuests == 1 ? "huésped" : "huéspedes"})',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGuestCounter(
    String title,
    String subtitle,
    int value,
    IconData icon,
    Function(int) onChanged, {
    required int min,
    required int max,
    required ThemeData theme,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: theme.primaryColor.withAlpha(25),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: theme.primaryColor,
            size: 28,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
        Row(
          children: [
            _buildCounterButton(
              icon: Icons.remove,
              onPressed: value > min ? () => onChanged(value - 1) : null,
              theme: theme,
            ),
            Container(
              width: 48,
              alignment: Alignment.center,
              child: Text(
                value.toString(),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ),
            _buildCounterButton(
              icon: Icons.add,
              onPressed: value < max ? () => onChanged(value + 1) : null,
              theme: theme,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCounterButton({
    required IconData icon,
    required VoidCallback? onPressed,
    required ThemeData theme,
  }) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: onPressed != null
              ? theme.primaryColor.withAlpha(100)
              : Colors.grey.shade300,
          width: 1.5,
        ),
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon),
        color: onPressed != null ? theme.primaryColor : Colors.grey.shade400,
        iconSize: 20,
        padding: const EdgeInsets.all(8),
        constraints: const BoxConstraints(
          minWidth: 36,
          minHeight: 36,
        ),
      ),
    );
  }
}
