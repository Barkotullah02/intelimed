import 'package:flutter/foundation.dart';
import '../api/api_client.dart';
import '../data.dart';

enum DataSource { loading, live, sample }

/// Exposes the drug catalogue, loading from the API and falling back to
/// bundled sample data when the backend is unreachable.
class DrugProvider extends ChangeNotifier {
  DrugProvider(this._api);
  final ApiClient _api;

  List<Drug> _drugs = kDrugs;
  DataSource _source = DataSource.sample;
  bool _loaded = false;

  List<Drug> get drugs => _drugs;
  DataSource get source => _source;

  Future<void> load() async {
    if (_loaded) return;
    _loaded = true;
    _source = DataSource.loading;
    notifyListeners();
    try {
      final rows = await _api.listDrugs();
      _drugs = rows.map((d) => Drug(d.id, d.name, d.generic, d.drugClass)).toList();
      _source = DataSource.live;
    } catch (_) {
      _drugs = kDrugs;
      _source = DataSource.sample;
    }
    notifyListeners();
  }
}
