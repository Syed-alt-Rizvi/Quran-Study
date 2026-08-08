#!/bin/bash
set -e

APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"

# Check if APK is present, else build it
if [ ! -f "$APK_PATH" ]; then
    echo "Building release APK..."
    ./gradlew clean assembleRelease
fi

echo "Verifying APK..."
# We expect to find mipmaps inside
unzip -l "$APK_PATH" | grep -E "ic_launcher|ic_launcher_round" || {
    echo "ERROR: ic_launcher resources missing in APK"
    exit 1
}

if command -v aapt2 &> /dev/null; then
    echo "Running aapt2 dump badging..."
    aapt2 dump --values badging "$APK_PATH" | grep "application-icon" || {
        echo "ERROR: application-icon not found in aapt2 dump"
        exit 1
    }
elif command -v aapt &> /dev/null; then
    echo "Running aapt dump badging..."
    aapt dump badging "$APK_PATH" | grep "application-icon" || {
        echo "ERROR: application-icon not found in aapt dump"
        exit 1
    }
else
    echo "aapt/aapt2 not found, skipping badging check."
fi

echo "Icon verification passed!"
