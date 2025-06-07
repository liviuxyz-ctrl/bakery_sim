# 🍰 Dessert Shop App Cheat-Sheet

---

## 1. Project Bootstrap

```bash
# 1. Create a new Expo project (JavaScript template)
npx create-expo-app BakerySim --template blank
cd BakerySim

# 2. Install dependencies in one go
# (after creating expo-requirements.txt with the package list)
PowerShell> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
PowerShell> .\install-deps.ps1

# 3. Start the app
npm start
# or
expo start
````

---

## 2. Dependencies List

Create **`expo-requirements.txt`** with:

```
react-native-paper
@expo/vector-icons
react-native-safe-area-context
@react-native-async-storage/async-storage
@react-navigation/native
@react-navigation/stack
```

---

## 3. Theme Setup (`theme.js`)

```js
// theme.js
import { MD3DarkTheme as DefaultDark } from 'react-native-paper';

export const darkTheme = {
  ...DefaultDark,
  colors: {
    ...DefaultDark.colors,
    primary:    '#7e57c2',  // deep purple buttons
    accent:     '#b39ddb',  // light purple highlights
    background: '#121212',  // app background
    surface:    '#1f1f1f',  // cards & modal bg
    text:       '#ffffff',  // white text
  },
};
```

> **Tip:** We “spread” (`...`) the base theme then override just the colors we need.

---

## 4. App Entry Point (`App.js`)

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

---

## 5. Menu Screen (`screens/MenuScreen.js`)

### 5.1 Imports & Data

```js
import React, { useState } from 'react';
import { FlatList }         from 'react-native';
import {
  Appbar, Card, Paragraph,
  Button, Badge, Portal, Modal, Text
} from 'react-native-paper';
import { darkTheme }        from '../theme';

// Hard-coded menu items
const initialMenu = [
  { id: '1', name: 'Chocolate Cake',   stock: 5,  recipe: '• 200g flour\n• 100g sugar\n…' },
  { id: '2', name: 'Lemon Tart',       stock: 3,  recipe: '• 200g flour\n• 100g butter\n…' },
  { id: '3', name: 'Strawberry Pie',   stock: 1,  recipe: '• 300g berries\n…' },
];

// Unsplash Source helper (no API key)
const getImageUri = name =>
  `https://source.unsplash.com/200x200/?${encodeURIComponent(name)},food,drink&sig=${name}`;
```

### 5.2 Component & State

```js
export default function MenuScreen({ navigation }) {
  const [menu, setMenu]       = useState(initialMenu);
  const [cart, setCart]       = useState([]);      // stores IDs
  const [modalItem, setModalItem] = useState(null);

  // Add to cart + decrement stock
  const addToCart = item => {
    if (!item.stock) return;
    setMenu(m => m.map(i =>
      i.id === item.id ? { ...i, stock: i.stock - 1 } : i
    ));
    setCart(c => [...c, item.id]);
  };

  // Total items for badge
  const totalCount = cart.length;
```

### 5.3 Rendering

```js
  return (
    <>
      {/* Header with title & cart badge */}
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
              backgroundColor: darkTheme.colors.accent
            }}
          >
            {totalCount}
          </Badge>
        )}
      </Appbar.Header>

      {/* List of cards */}
      <FlatList
        data={menu}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <Card style={{ margin: 8, backgroundColor: darkTheme.colors.surface }}>
            <Card.Cover source={{ uri: getImageUri(item.name) }} />
            <Card.Title
              title={item.name}
              subtitle={`Stock: ${item.stock}`}
              titleStyle={{ color: darkTheme.colors.text }}
            />
            <Card.Content>
              <Paragraph style={{ color: darkTheme.colors.text }}>
                {item.recipe.split('\n')[0]}…
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                disabled={!item.stock}
                onPress={() => addToCart(item)}
              >
                Add
              </Button>
              <Button onPress={() => setModalItem(item)}>
                Recipe
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      {/* Recipe Modal */}
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
              fontSize: 18,
              fontWeight: 'bold',
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

## 6. Cart Screen (`screens/CartScreen.js`)

### 6.1 Imports & Setup

```js
import React, { useState }      from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  List, Avatar, Button,
  Divider, Text, TextInput
} from 'react-native-paper';
import { darkTheme } from '../theme';

// Build initial items from passed IDs
const buildItems = ids =>
  ids.reduce((acc, id) => {
    const idx = acc.findIndex(x => x.id === id);
    if (idx >= 0) acc[idx].qty++;
    else acc.push({ id, qty: 1 });
    return acc;
  }, []);
```

### 6.2 Component & State

```js
export default function CartScreen({ route }) {
  const initialIds = route.params?.cartItems || [];
  const [items, setItems] = useState(buildItems(initialIds));
  const [name, setName]    = useState('');

  // + / – quantity
  const changeQty = (idx, delta) => {
    setItems(curr => {
      const next = [...curr];
      next[idx].qty += delta;
      if (next[idx].qty < 1) next.splice(idx, 1);
      return next;
    });
  };
```

### 6.3 Rendering & Pay

```js
  return (
    <View style={[styles.container, { backgroundColor: darkTheme.colors.background }]}>
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
              <Button compact onPress={() => changeQty(idx, -1)}>–</Button>
              <Button compact onPress={() => changeQty(idx, +1)}>+</Button>
            </View>
          </View>
        ))}
      </List.Section>

      <Divider />

      <TextInput
        label="Your Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={[styles.input, { backgroundColor: darkTheme.colors.surface }]}
      />

      <Text style={[styles.total, { color: darkTheme.colors.text }]}>
        {`Total Items: ${items.reduce((s, i) => s + i.qty, 0)}`}
      </Text>

      <Button
        mode="contained"
        onPress={() => {
          Alert.alert('Reservation Confirmed', `Thanks, ${name}!`);
          setItems([]); setName('');
        }}
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

## 7. Quick Tips & Gotchas

* **State updates** are asynchronous—use the functional form (`setX(x => …)`) when depending on old state.
* **FlatList** needs a unique `keyExtractor`.
* **Portal + Modal** from Paper let you pop overlays above other content.
* **Unsplash Source** URLs require no key and give random themed images:

  ```
  https://source.unsplash.com/200x200/?Chocolate%20Cake,food,drink
  ```
* **Navigation Params** pass your cart from Menu → Cart:

  ```js
  navigation.navigate('Cart', { cartItems: cartArray });
  ```
* **PaperProvider** at the top ensures all components respect your theme.
