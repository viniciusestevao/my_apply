import { AppRegistry, Platform, StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import Routes from './src/routes';
//import LoginScreen from './src/loginScreen';

AppRegistry.registerComponent('App', () => App);

function App(){
  return(
    <NavigationContainer>
      <StatusBar hidden/>
   {/*   <LoginScreen />    */}
        <Routes /> 
    </NavigationContainer>
  )
}

export default App;