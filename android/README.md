
## App Icons
- The app uses Adaptive Icons for Android 8.0+.
- Adaptive icon definitions are at `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml`.
- Required resource names: `ic_launcher_foreground` (drawable), `ic_launcher_background` (color or drawable), `ic_launcher` (mipmaps for legacy), `ic_launcher_round`.
- To regenerate legacy PNG icons, run the root script `node scripts/generate-mipmaps.cjs`.
- To test locally, run `cd android && ./gradlew assembleRelease`, verify the apk using `unzip` and `aapt2 dump badging`, install it with `adb install -r`, and clear the launcher cache (`Settings -> Apps -> Launcher -> Storage -> Clear cache`) if the icon does not update.
- Do not shrink these resources: they are essential for the launcher.
