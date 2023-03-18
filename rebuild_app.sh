#!/usr/bin/env bash
flutter clean
flutter pub get
flutter build web --web-renderer html --csp