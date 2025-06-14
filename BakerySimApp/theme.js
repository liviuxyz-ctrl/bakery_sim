import { MD3DarkTheme as DefaultDarkTheme } from 'react-native-paper';

export const colors = {
    primary: '#7e57c2',      // deep purple
    accent:  '#b39ddb',      // light purple
    background: '#120C19FF',   // almost-black
    surface:    '#120C19FFs',   // card backgrounds
    text:       '#ffffff',
};

export const darkTheme = {
    ...DefaultDarkTheme,
    colors: {
        ...DefaultDarkTheme.colors,
        ...colors,
    },
};