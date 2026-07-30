const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "const { isDarkMode, hasSeenWelcome, setHasSeenWelcome, englishFont } = useSettingsStore();\n  const [showWelcome, setShowWelcome] = useState(!hasSeenWelcome);",
  "const { isDarkMode, englishFont } = useSettingsStore();\n  const [showWelcome, setShowWelcome] = useState(true);"
);

content = content.replace(
  "const handleWelcomeComplete = () => {\n    setShowWelcome(false);\n    setHasSeenWelcome(true);\n  };",
  "const handleWelcomeComplete = () => {\n    setShowWelcome(false);\n  };"
);

content = content.replace(
  "const handleExitComplete = () => {\n    // In a real PWA/Android app, this might close the window/activity.\n    // For this web view, we'll just reset state to show Home.\n    setIsExiting(false);\n  };",
  "const handleExitComplete = async () => {\n    try {\n      const { App: CapacitorApp } = await import('@capacitor/app');\n      await CapacitorApp.exitApp();\n    } catch (e) {\n      console.warn(\"Could not exit app using capacitor\", e);\n      window.close();\n      setIsExiting(false);\n    }\n  };"
);

fs.writeFileSync('src/App.tsx', content);
