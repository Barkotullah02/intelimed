import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:intelimed_mobile/api/api_client.dart';
import 'package:intelimed_mobile/providers/auth_provider.dart';
import 'package:intelimed_mobile/providers/drug_provider.dart';
import 'package:intelimed_mobile/main.dart';

Widget _wrap() {
  final api = ApiClient();
  return MultiProvider(
    providers: [
      Provider<ApiClient>.value(value: api),
      ChangeNotifierProvider(create: (_) => AuthProvider(api)),
      ChangeNotifierProvider(create: (_) => DrugProvider(api)),
    ],
    child: const IntelliMedsApp(),
  );
}

void main() {
  testWidgets('boots to the login gate', (tester) async {
    await tester.pumpWidget(_wrap());
    expect(find.text('Sign in to IntelliMeds'), findsOneWidget);
    expect(find.text('Continue without signing in'), findsOneWidget);
  });

  testWidgets('guest entry reveals the 5-tab home shell', (tester) async {
    await tester.pumpWidget(_wrap());
    await tester.tap(find.text('Continue without signing in'));
    await tester.pumpAndSettle();

    expect(find.text('Sarah'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}
