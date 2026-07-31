import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:get_it/get_it.dart';
import '../services/locations_service.dart';

class LocationData {
  final String? countryId;
  final String? departmentId;
  final String? provinceId;
  final String? districtId;

  LocationData({
    this.countryId,
    this.departmentId,
    this.provinceId,
    this.districtId,
  });

  LocationData copyWith({
    String? countryId,
    String? departmentId,
    String? provinceId,
    String? districtId,
  }) {
    return LocationData(
      countryId: countryId ?? this.countryId,
      departmentId: departmentId ?? this.departmentId,
      provinceId: provinceId ?? this.provinceId,
      districtId: districtId ?? this.districtId,
    );
  }
}

class LocationPickerProvider extends ChangeNotifier {
  final LocationsService locationsService;

  List<Country> countries = [];
  List<Department> departments = [];
  List<Province> provinces = [];
  List<District> districts = [];

  bool loadingCountries = false;
  bool loadingDepartments = false;
  bool loadingProvinces = false;
  bool loadingDistricts = false;

  LocationData selectedLocation = LocationData();

  LocationPickerProvider(this.locationsService) {
    loadCountries();
  }

  Future<void> loadCountries() async {
    try {
      loadingCountries = true;
      notifyListeners();
      countries = await locationsService.getCountries();
    } catch (e) {
      debugPrint('Error loading countries: $e');
    } finally {
      loadingCountries = false;
      notifyListeners();
    }
  }

  Future<void> selectCountry(String countryId) async {
    selectedLocation = selectedLocation.copyWith(
      countryId: countryId,
      departmentId: null,
      provinceId: null,
      districtId: null,
    );
    departments = [];
    provinces = [];
    districts = [];
    notifyListeners();

    try {
      loadingDepartments = true;
      notifyListeners();
      departments = await locationsService.getDepartments(countryId);
    } catch (e) {
      debugPrint('Error loading departments: $e');
    } finally {
      loadingDepartments = false;
      notifyListeners();
    }
  }

  Future<void> selectDepartment(String departmentId) async {
    selectedLocation = selectedLocation.copyWith(
      departmentId: departmentId,
      provinceId: null,
      districtId: null,
    );
    provinces = [];
    districts = [];
    notifyListeners();

    try {
      loadingProvinces = true;
      notifyListeners();
      provinces = await locationsService.getProvinces(departmentId);
    } catch (e) {
      debugPrint('Error loading provinces: $e');
    } finally {
      loadingProvinces = false;
      notifyListeners();
    }
  }

  Future<void> selectProvince(String provinceId) async {
    selectedLocation = selectedLocation.copyWith(
      provinceId: provinceId,
      districtId: null,
    );
    districts = [];
    notifyListeners();

    try {
      loadingDistricts = true;
      notifyListeners();
      districts = await locationsService.getDistricts(provinceId);
    } catch (e) {
      debugPrint('Error loading districts: $e');
    } finally {
      loadingDistricts = false;
      notifyListeners();
    }
  }

  void selectDistrict(String districtId) {
    selectedLocation = selectedLocation.copyWith(districtId: districtId);
    notifyListeners();
  }

  void setInitialLocation(LocationData location) {
    selectedLocation = location;
    notifyListeners();
  }
}

class LocationPicker extends StatelessWidget {
  final LocationData? initialValue;
  final Function(LocationData)? onChanged;
  final String label;

  const LocationPicker({
    Key? key,
    this.initialValue,
    this.onChanged,
    this.label = 'Ubicación',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<LocationPickerProvider>(
      create: (_) => LocationPickerProvider(
        GetIt.instance<LocationsService>(),
      )..setInitialLocation(initialValue ?? LocationData()),
      child: _LocationPickerContent(
        label: label,
        onChanged: onChanged,
      ),
    );
  }
}

class _LocationPickerContent extends StatelessWidget {
  final String label;
  final Function(LocationData)? onChanged;

  const _LocationPickerContent({
    Key? key,
    required this.label,
    this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<LocationPickerProvider>(
      builder: (context, provider, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            // Country
            _DropdownField(
              label: 'País',
              isLoading: provider.loadingCountries,
              items: provider.countries
                  .map((c) => DropdownMenuItem(
                    value: c.id.toString(),
                    child: Text('${c.flagEmoji ?? ''} ${c.name}'),
                  ))
                  .toList(),
              value: provider.selectedLocation.countryId?.toString(),
              onChanged: (value) {
                if (value != null) {
                  provider.selectCountry(value);
                  onChanged?.call(provider.selectedLocation);
                }
              },
            ),
            const SizedBox(height: 12),
            // Department
            _DropdownField(
              label: 'Departamento',
              isLoading: provider.loadingDepartments,
              isEnabled: provider.selectedLocation.countryId != null,
              items: provider.departments
                  .map((d) => DropdownMenuItem(
                    value: d.id,
                    child: Text(d.name),
                  ))
                  .toList(),
              value: provider.selectedLocation.departmentId,
              onChanged: (value) {
                if (value != null) {
                  provider.selectDepartment(value);
                  onChanged?.call(provider.selectedLocation);
                }
              },
            ),
            const SizedBox(height: 12),
            // Province
            _DropdownField(
              label: 'Provincia',
              isLoading: provider.loadingProvinces,
              isEnabled: provider.selectedLocation.departmentId != null,
              items: provider.provinces
                  .map((p) => DropdownMenuItem(
                    value: p.id,
                    child: Text(p.name),
                  ))
                  .toList(),
              value: provider.selectedLocation.provinceId,
              onChanged: (value) {
                if (value != null) {
                  provider.selectProvince(value);
                  onChanged?.call(provider.selectedLocation);
                }
              },
            ),
            const SizedBox(height: 12),
            // District
            _DropdownField(
              label: 'Distrito',
              isLoading: provider.loadingDistricts,
              isEnabled: provider.selectedLocation.provinceId != null,
              items: provider.districts
                  .map((d) => DropdownMenuItem(
                    value: d.id,
                    child: Text(d.name),
                  ))
                  .toList(),
              value: provider.selectedLocation.districtId,
              onChanged: (value) {
                if (value != null) {
                  provider.selectDistrict(value);
                  onChanged?.call(provider.selectedLocation);
                }
              },
            ),
          ],
        );
      },
    );
  }
}

class _DropdownField extends StatelessWidget {
  final String label;
  final bool isLoading;
  final bool isEnabled;
  final List<DropdownMenuItem<String>> items;
  final String? value;
  final Function(String?)? onChanged;

  const _DropdownField({
    Key? key,
    required this.label,
    this.isLoading = false,
    this.isEnabled = true,
    required this.items,
    this.value,
    this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        enabled: isEnabled && !isLoading,
      ),
      isExpanded: true,
      value: value,
      items: isLoading
          ? [
              const DropdownMenuItem(
                value: '',
                child: Text('Cargando...'),
              )
            ]
          : items.isEmpty
              ? [
                  DropdownMenuItem(
                    value: '',
                    child: Text('Selecciona ${label.toLowerCase()}'),
                  )
                ]
              : items,
      onChanged: isLoading || !isEnabled ? null : onChanged,
    );
  }
}
