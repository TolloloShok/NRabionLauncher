var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/electron-quick-start-win32-ia32',
    outputDirectory: 'installers',
    authors: 'My App Inc.',
    exe: 'electron-quick-start.exe',
    name: 'electron_quick_start'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
