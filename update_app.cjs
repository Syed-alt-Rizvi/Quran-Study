const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Use Refs for state inside backButtonListener, or just capture the state by avoiding direct state reference inside the callback?
// Actually, it's easier to use a custom hook or refs. 
// We can just add refs for the state in App.tsx

content = content.replace(/import { useState, useEffect } from 'react';/, "import { useState, useEffect, useRef } from 'react';");

const stateRefs = `
  const isSidebarOpenRef = useRef(isSidebarOpen);
  isSidebarOpenRef.current = isSidebarOpen;
  const selectedSurahRef = useRef(selectedSurah);
  selectedSurahRef.current = selectedSurah;
  const selectedJuzRef = useRef(selectedJuz);
  selectedJuzRef.current = selectedJuz;
  const isExitingRef = useRef(isExiting);
  isExitingRef.current = isExiting;
  const showWelcomeRef = useRef(showWelcome);
  showWelcomeRef.current = showWelcome;
`;

content = content.replace(
  /const \[isExiting, setIsExiting\] = useState\(false\);/,
  `const [isExiting, setIsExiting] = useState(false);\n${stateRefs}`
);

const newEffect = `
  useEffect(() => {
    let appListener: any;
    let backButtonListener: any;
    import('@capacitor/app').then(({ App: CapacitorApp }) => {
      appListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          setIsExiting(false);
        }
      });

      backButtonListener = CapacitorApp.addListener('backButton', () => {
        if (isSidebarOpenRef.current) {
          setIsSidebarOpen(false);
        } else if (selectedSurahRef.current !== null) {
          setSelectedSurah(null);
        } else if (selectedJuzRef.current !== null) {
          setSelectedJuz(null);
        } else if (isExitingRef.current) {
          setIsExiting(false);
        } else if (!showWelcomeRef.current) {
          setIsExiting(true);
        } else {
          CapacitorApp.exitApp();
        }
      });
    }).catch(() => {});

    return () => {
      if (appListener) {
        appListener.then((listener: any) => listener.remove());
      }
      if (backButtonListener) {
        backButtonListener.then((listener: any) => listener.remove());
      }
    };
  }, []);
`;

content = content.replace(
  /useEffect\(\(\) => {\s*let appListener: any;[\s\S]*?}, \[\]\);/,
  newEffect.trim()
);

fs.writeFileSync('src/App.tsx', content);
