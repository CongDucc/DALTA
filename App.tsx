import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/Navigation/RootNavigator';
import { Provider } from 'react-redux';
import { store, persistor } from './src/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { UserProvider } from './src/Components/LoginRegisterComponent/UserContext';

export default function App() {
  return (
    <UserProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
