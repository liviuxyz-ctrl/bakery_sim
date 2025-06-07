# 🍰 Dessert Shop App – Ultimate Cheat Sheet

> A detailed, step-by-step reference to set up, understand, and extend your React Native Expo “Dessert Shop” app.

---

## 📦 Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Project Bootstrap](#project-bootstrap)  
3. [Folder Structure](#folder-structure)  
4. [Dependencies & Scripts](#dependencies--scripts)  
5. [Theming & Styling](#theming--styling)  
6. [App Entry (App.js)](#app-entry-appjs)  
7. [Menu Screen (MenuScreen.js)](#menu-screen-menuscreenjs)  
   - State & Data Flow  
   - Layout & Components  
   - Hooks & Handlers  
   - Recipe Modal  
8. [Cart Screen (CartScreen.js)](#cart-screen-cartscreenjs)  
   - Receiving Params  
   - Quantity Controls  
   - Reservation Form  
9. [AsyncStorage Quick Guide](#asyncstorage-quick-guide)  
10. [Navigation Deep Dive](#navigation-deep-dive)  
11. [Unsplash Source API Testing](#unsplash-source-api-testing)  
12. [Common Pitfalls & Debugging](#common-pitfalls--debugging)  
13. [Extension Ideas](#extension-ideas)  
14. [Glossary & Resources](#glossary--resources)  

---

## 📋 1. Prerequisites

- **Node.js** (v22 recommended via [`fnm`](https://github.com/Schniz/fnm))  
- **Expo CLI** (via `npm install -g expo-cli` or `npx create-expo-app`)  
- **PowerShell** on Windows (for `install-deps.ps1`), or any Unix shell  
- **Git** (optional, but ideal for versioning)  

---

## 🚀 2. Project Bootstrap

```bash
# 1. Create project (JS-only template)
npx create-expo-app BakerySim --template blank
cd BakerySim

# 2. Prepare dependency list
# Create file expo-requirements.txt with:
#   react-native-paper
#   @expo/vector-icons
#   react-native-safe-area-context
#   @react-native-async-storage/async-storage
#   @react-navigation/native
#   @react-navigation/stack

# 3. Create/install script (PowerShell example)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install-deps.ps1   # Runs expo install on each package

# 4. Launch the app
npm start
# or
expo start
````

**Tip:** On macOS/Linux, you can convert `install-deps.ps1` to a simple bash loop.

---

## 📂 3. Folder Structure

```
BakerySim/
├── assets/               # static assets (if any)
├── screens/
│   ├── MenuScreen.js
│   └── CartScreen.js
├── theme.js              # color/theme definitions
├── App.js                # app entry + navigation
├── install-deps.ps1      # Windows install script
├── expo-requirements.txt # list of `expo install` packages
├── package.json
└── CHEATSHEET.md         # ← YOU ARE HERE
```

---

## 📦 4. Dependencies & Scripts

### expo-requirements.txt

```
react-native-paper
@expo/vector-icons
react-native-safe-area-context
@react-native-async-storage/async-storage
@react-navigation/native
@react-navigation/stack
```

### package.json snippets

```jsonc
{
  "scripts": {
    "start": "node server.js",       // for web/Heroku if used
    "build:web": "expo build:web",   // if you publish web
    "android": "expo start --android",
    "ios": "expo start --ios"
  },
  "dependencies": {
    "expo": "...",
    "react-native-paper": "...",
    "@react-navigation/native": "...",
    "@react-navigation/stack": "...",
    "@react-native-async-storage/async-storage": "...",
    "@expo/vector-icons": "...",
    "react-native-safe-area-context": "..."
  }
}
```

---

## 🎨 5. Theming & Styling

### theme.js

```js
import { MD3DarkTheme as DefaultDark } from 'react-native-paper';

// Define your custom palette:
export const darkTheme = {
  ...DefaultDark,
  colors: {
    ...DefaultDark.colors,
    primary:    '#7e57c2',  // deep purple buttons
    accent:     '#b39ddb',  // light purple highlights
    background: '#121212',  // app background color
    surface:    '#1f1f1f',  // cards & modal backgrounds
    text:       '#ffffff',  // default text color
  },
};
```

> **Why Material 3?** React Native Paper v5+ supports MD3, which gives updated components and theming out of the box.

---

## 🚪 6. App Entry (App.js)

```js
// App.js
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer }       from '@react-navigation/native';
import { createStackNavigator }      from '@react-navigation/stack';

import { darkTheme }   from './theme';
import MenuScreen      from './screens/MenuScreen';
import CartScreen      from './screens/CartScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={darkTheme}>
      <NavigationContainer theme={{ colors: darkTheme.colors }}>
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
```

* **PaperProvider**: Applies theme to all Paper components
* **NavigationContainer**: Hooks into React Navigation
* **Stack.Navigator**: Defines two screens—Menu & Cart

---

## 🏪 7. Menu Screen (screens/MenuScreen.js)

### 7.1. Imports & Data

```js
import React, { useState } from 'react';
import { FlatList }         from 'react-native';
import {
  Appbar, Card, Paragraph,
  Button, Badge, Portal, Modal, Text
} from 'react-native-paper';
import { darkTheme }        from '../theme';

// 1. Hard-coded menu items with stock & recipe
const initialMenu = [
  { id: '1', name: 'Chocolate Cake',   stock: 5, recipe: '• 200g flour\n• 100g sugar\n• 50g cocoa' },
  { id: '2', name: 'Lemon Tart',       stock: 3, recipe: '• 200g flour\n• 100g butter\n• juice of 2 lemons' },
  { id: '3', name: 'Strawberry Pie',   stock: 1, recipe: '• 300g strawberries\n• 100g sugar\n• pie crust' },
];

// 2. Unsplash Source helper (no API key required)
const getImageUri = name =>
  `https://source.unsplash.com/200x200/?${encodeURIComponent(name)},food,drink&sig=${name}`;
```

### 7.2. Component & State

```js
export default function MenuScreen({ navigation }) {
  // menu = current stock & data; cart = list of item IDs pressed
  const [menu, setMenu] = useState(initialMenu);
  const [cart, setCart] = useState([]);
  const [modalItem, setModalItem] = useState(null);

  // Add to cart: decrement stock and record ID
  function addToCart(item) {
    if (item.stock === 0) return;  // no more stock
    setMenu(m =>
      m.map(i => i.id === item.id
        ? { ...i, stock: i.stock - 1 }
        : i
      )
    );
    setCart(c => [...c, item.id]);
  }

  const totalCount = cart.length;
```

### 7.3. Layout & Components

```js
  return (
    <>
      {/* ————— Header with Cart Badge ————— */}
      <Appbar.Header style={{ backgroundColor: darkTheme.colors.surface }}>
        <Appbar.Content
          title="Dessert Shop"
          titleStyle={{ color: darkTheme.colors.text }}
        />
        <Appbar.Action
          icon="cart"
          color={darkTheme.colors.text}
          onPress={() => navigation.navigate('Cart', { cartItems: cart })}
        />
        {totalCount > 0 && (
          <Badge
            size={20}
            style={{
              position: 'absolute', top: 12, right: 12,
              backgroundColor: darkTheme.colors.accent,
            }}
          >
            {totalCount}
          </Badge>
        )}
      </Appbar.Header>

      {/* ————— Dessert List ————— */}
      <FlatList
        data={menu}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Card style={{ margin: 8, backgroundColor: darkTheme.colors.surface }}>
            {/* Image */}
            <Card.Cover source={{ uri: getImageUri(item.name) }} />
            {/* Title & Stock */}
            <Card.Title
              title={item.name}
              subtitle={`Stock: ${item.stock}`}
              titleStyle={{ color: darkTheme.colors.text }}
              subtitleStyle={{
                color: item.stock > 1
                  ? darkTheme.colors.accent
                  : '#cf6679'   // red if low
              }}
            />
            {/* Preview */}
            <Card.Content>
              <Paragraph style={{ color: darkTheme.colors.text }}>
                {item.recipe.split('\n')[0]}…{/* first line only */}
              </Paragraph>
            </Card.Content>
            {/* Actions */}
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => addToCart(item)}
                disabled={!item.stock}
                style={{ flex: 1, marginRight: 4 }}
              >
                Add
              </Button>
              <Button
                mode="outlined"
                onPress={() => setModalItem(item)}
                style={{ flex: 1 }}
              >
                Recipe
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      {/* ————— Recipe Modal ————— */}
      <Portal>
        <Modal
          visible={!!modalItem}
          onDismiss={() => setModalItem(null)}
          contentContainerStyle={{
            margin: 20, padding: 20, borderRadius: 8,
            backgroundColor: darkTheme.colors.surface
          }}
        >
          <Text
            style={{
              fontSize: 18, fontWeight: 'bold',
              color: darkTheme.colors.text,
              marginBottom: 8
            }}
          >
            {modalItem?.name} Recipe
          </Text>
          <Text style={{ color: darkTheme.colors.text, marginBottom: 16 }}>
            {modalItem?.recipe}
          </Text>
          <Button mode="contained" onPress={() => setModalItem(null)}>
            Close
          </Button>
        </Modal>
      </Portal>
    </>
  );
}
```

---

## 🛒 8. Cart Screen (screens/CartScreen.js)

### 8.1. Receiving Params & State

```js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  List, Avatar, Button,
  Divider, Text, TextInput
} from 'react-native-paper';
import { darkTheme } from '../theme';

// Build initial items array: group IDs into {id, qty}
function buildItems(ids) {
  return ids.reduce((acc, id) => {
    const idx = acc.findIndex(x => x.id === id);
    if (idx >= 0) acc[idx].qty++;
    else acc.push({ id, qty: 1 });
    return acc;
  }, []);
}

export default function CartScreen({ route }) {
  const initialIds = route.params?.cartItems || [];
  const [items, setItems] = useState(buildItems(initialIds));
  const [name, setName] = useState('');
```

### 8.2. Quantity Controls

```js
  // Adjust qty; remove if <= 0
  function changeQty(idx, delta) {
    setItems(curr => {
      const next = [...curr];
      next[idx].qty += delta;
      if (next[idx].qty < 1) next.splice(idx, 1);
      return next;
    });
  }
```

### 8.3. Reservation Form

```js
  function handlePay() {
    Alert.alert(
      'Reservation Confirmed',
      `Thanks, ${name.trim()}!\n` +
      items.map(ci => `${ci.qty}× Item ${ci.id}`).join(', ')
    );
    // Reset
    setItems([]);
    setName('');
  }
```

### 8.4. Layout & Components

```js
  return (
    <View style={[styles.container, { backgroundColor: darkTheme.colors.background }]}>
      {/* List of items */}
      <List.Section>
        {items.map((ci, idx) => (
          <View key={ci.id} style={styles.row}>
            <Avatar.Image
              size={40}
              source={{ uri: `https://source.unsplash.com/40x40/?sig=${ci.id},food,drink` }}
            />
            <View style={styles.info}>
              <Text style={{ color: darkTheme.colors.text }}>{`Item ${ci.id}`}</Text>
              <Text style={{ color: darkTheme.colors.text }}>{`Qty: ${ci.qty}`}</Text>
            </View>
            <View style={styles.controls}>
              <Button compact onPress={() => changeQty(idx, -1)}>-</Button>
              <Button compact onPress={() => changeQty(idx, +1)}>+</Button>
            </View>
          </View>
        ))}
      </List.Section>

      <Divider />

      {/* Name input */}
      <TextInput
        label="Your Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={[styles.input, { backgroundColor: darkTheme.colors.surface }]}
      />

      {/* Total & Pay */}
      <Text style={[styles.total, { color: darkTheme.colors.text }]}>
        {`Total Items: ${items.reduce((s, i) => s + i.qty, 0)}`}
      </Text>
      <Button
        mode="contained"
        onPress={handlePay}
        disabled={!name.trim() || items.length === 0}
      >
        Pay
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  info:      { flex: 1, marginLeft: 8 },
  controls:  { flexDirection: 'row' },
  input:     { marginVertical: 12 },
  total:     { textAlign: 'center', marginBottom: 12, fontSize: 16 },
});
```

---

## 💾 9. AsyncStorage Quick Guide

* **Import:** `import AsyncStorage from '@react-native-async-storage/async-storage';`
* **Save data:**

  ```js
  AsyncStorage.setItem('cart', JSON.stringify(cartArray));
  ```
* **Load data:**

  ```js
  const json = await AsyncStorage.getItem('cart');
  const cart = json ? JSON.parse(json) : [];
  ```
* **Remove data:**

  ```js
  AsyncStorage.removeItem('cart');
  ```

---

## 🔗 10. Navigation Deep Dive

* **Passing params:**

  ```js
  navigation.navigate('Cart', { cartItems: cartArray });
  ```
* **Accessing params:**

  ```js
  const { cartItems } = route.params;
  ```
* **Options:** customize header via `screenOptions` in `Stack.Navigator`.

---

## 📷 11. Unsplash Source API Testing

Use these URLs in Postman or browser (no key needed):

* **Thumbnail:**
  `https://source.unsplash.com/40x40/?Chocolate%20Cake,food,drink`
* **Product Image:**
  `https://source.unsplash.com/200x200/?Lemon%20Tart,food,drink`
* **Randomized single image:**
  `https://source.unsplash.com/random/200x200/?Strawberry%20Pie,food,drink&sig=5`

> **Pro Tip:** change `?query,food,drink&sig=NUMBER` to vary images.

---

## 🐞 12. Common Pitfalls & Debugging

* **Blank screen** → Did you wrap in `<PaperProvider>` and `<NavigationContainer>`?
* **“Cannot read property of undefined”** → Check your `route.params`; use default empty arrays.
* **AsyncStorage not saving** → Ensure you call `setItem` in a `useEffect` watching the right state.
* **Images not loading** → Encode spaces with `%20` or use `encodeURIComponent`.
* **Heroku Error** → Make sure you have a `server.js` + `Procfile` if deploying web.

---

## 💡 13. Extension Ideas

* **Local Images**: bundle `assets/chocolate.png` and switch `require()` vs URI.
* **Search Bar** in Menu: filter by name in real time.
* **Dark/Light Toggle**: switch themes dynamically.
* **Persistent User**: ask for user name on first run and save it.
* **Order History**: store past reservations with timestamp.
* **Animations**: use `react-native-reanimated` for “Add to cart” feedback.

---

## 📚 14. Glossary & Resources

* **React Hooks**: `useState`, `useEffect` for state and lifecycle
* **React Navigation**: stack / tabs for moving between screens
* **React Native Paper**: Material Design components for RN
* **AsyncStorage**: simple key-value local storage
* **Unsplash Source**: free image URLs, no API key

**Further Reading:**

* React Native Docs: [https://reactnative.dev](https://reactnative.dev)
* Expo Docs: [https://docs.expo.dev](https://docs.expo.dev)
* React Navigation: [https://reactnavigation.org](https://reactnavigation.org)
* React Native Paper: [https://callstack.github.io/react-native-paper](https://callstack.github.io/react-native-paper)


