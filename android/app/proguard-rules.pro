# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor ProGuard & R8 rules
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.Plugin

# WebKit & JavaScript Interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# AndroidX Core, Webkit & Splashscreen
-keep class androidx.core.splashscreen.** { *; }
-keep class androidx.webkit.** { *; }

# Preserve line numbers and source file names for crash analytics
-keepattributes SourceFile,LineNumberTable,*Annotation*
-keepattributes EnclosingMethod,InnerClasses,Signature

# Suppress harmless warnings during release compilation
-dontwarn com.getcapacitor.**
-dontwarn androidx.webkit.**

