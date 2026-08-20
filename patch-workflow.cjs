const fs = require('fs');
let yml = fs.readFileSync('.github/workflows/build-apps.yml', 'utf8');

const oldBuildStep = `      - name: Build iOS App
        working-directory: ./ios/App
        run: |
          xcodebuild -project App.xcodeproj -scheme App -configuration Release -sdk iphoneos -derivedDataPath build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGNING_IDENTITY=""
          
          # Create IPA
          mkdir -p Payload
          cp -r build/Build/Products/Release-iphoneos/App.app Payload/
          zip -r "Quran Study.ipa" Payload`;

const newBuildStep = `      - name: Install Apple certificate and provisioning profile
        env:
          BUILD_CERTIFICATE_BASE64: \${{ secrets.IOS_CERTIFICATE_BASE64 }}
          P12_PASSWORD: \${{ secrets.IOS_CERTIFICATE_PASSWORD }}
          BUILD_PROVISION_PROFILE_BASE64: \${{ secrets.IOS_PROVISION_PROFILE_BASE64 }}
          KEYCHAIN_PASSWORD: \${{ secrets.GITHUB_TOKEN }}
        run: |
          # create variables
          CERTIFICATE_PATH=$RUNNER_TEMP/build_certificate.p12
          PP_PATH=$RUNNER_TEMP/build_pp.mobileprovision
          KEYCHAIN_PATH=$RUNNER_TEMP/app-signing.keychain-db

          # import certificate and provisioning profile from secrets
          echo -n "$BUILD_CERTIFICATE_BASE64" | base64 --decode -o $CERTIFICATE_PATH
          echo -n "$BUILD_PROVISION_PROFILE_BASE64" | base64 --decode -o $PP_PATH

          # create temporary keychain
          security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
          security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
          security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

          # import certificate to keychain
          security import $CERTIFICATE_PATH -P "$P12_PASSWORD" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
          security list-keychain -d user -s $KEYCHAIN_PATH

          # apply provisioning profile
          mkdir -p ~/Library/MobileDevice/Provisioning\\ Profiles
          cp $PP_PATH ~/Library/MobileDevice/Provisioning\\ Profiles

      - name: Build iOS App
        working-directory: ./ios/App
        run: |
          # Build the app with code signing enabled automatically using the imported profile
          xcodebuild -project App.xcodeproj -scheme App -configuration Release -sdk iphoneos -derivedDataPath build CODE_SIGNING_STYLE=Manual
          
          # Create Signed IPA
          mkdir -p Payload
          cp -r build/Build/Products/Release-iphoneos/App.app Payload/
          zip -r "Quran Study.ipa" Payload`;

if (yml.includes(oldBuildStep)) {
    yml = yml.replace(oldBuildStep, newBuildStep);
    fs.writeFileSync('.github/workflows/build-apps.yml', yml);
    console.log("Successfully patched workflow!");
} else {
    console.error("Could not find the target block to replace.");
}
