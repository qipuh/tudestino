import 'package:intl/intl.dart';

/// Todos los precios en la plataforma están en soles peruanos (PEN).
///
/// OJO: el locale 'es_PE' pone el símbolo DESPUÉS del número ("60,00 S/") -
/// esto lo decide el patrón CLDR del locale, no el parámetro `symbol` (que
/// solo cambia el texto del símbolo, no su posición). Se usa 'en_US' a
/// propósito para forzar el patrón "símbolo + número" que pide el diseño,
/// mientras el `symbol` sigue siendo 'S/ '.
class CurrencyFormatter {
  static final NumberFormat _format = NumberFormat.currency(
    locale: 'en_US',
    symbol: 'S/ ',
    decimalDigits: 2,
  );

  static String format(num amount) => _format.format(amount);
}
