import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import React from 'react';

// Native MainActivity selects a different root for the stage1 build type.
// Neither registration imports the other application's component tree.
AppRegistry.registerComponent('DesiiBitesStage1', () => require('./src/backend/Stage1VerificationApp').default);
registerRootComponent(function CustomerRoot(props) {
  const App = require('./App').default;
  return React.createElement(App, props);
});

