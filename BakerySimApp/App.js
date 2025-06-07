import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavDefault } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { darkTheme } from './theme';
import MenuScreen from "./screens/MenuScreen";
import CartScreen from "./screens/CartScreen";

const Stack = createStackNavigator();

export default function App() {
    return (
        <PaperProvider theme={darkTheme}>
            <NavigationContainer
                theme={{
                    ...NavDefault,
                    dark: true,
                    colors: {
                        background: darkTheme.colors.background,
                        card: darkTheme.colors.surface,
                        text: darkTheme.colors.text,
                        primary: darkTheme.colors.primary,
                    },
                }}
            >
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: darkTheme.colors.surface },
                        headerTintColor: darkTheme.colors.text,
                    }}
                >
                    <Stack.Screen name="Menu" component={MenuScreen} />
                    <Stack.Screen name="Cart" component={CartScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}