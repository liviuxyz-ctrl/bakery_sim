# 🍰 Kid-Friendly Guide: Building Your Dessert Shop App

Welcome to your hands-on guide to the **“Dessert Shop”** app! We’ll walk through how to set it up, run it, and explore each file with plenty of comments so you—and your students—can see exactly what’s happening.

---

## 📋 1. Prerequisites

1. **Node.js & fnm** (for switching to Node 22)
2. **Expo CLI** (via `npm install -g expo-cli` or use the new `create-expo-app`)
3. **PowerShell** (if you’re on Windows) or Terminal (macOS/Linux)
4. **Git** (optional, but handy for version control)

---

## 🚀 2. Project Setup

1. **Bootstrap a new Expo project**

   ```bash
   npx create-expo-app BakerySim --template blank
   cd BakerySim
   ```

2. **Add our install script & list**

    * Create **`expo-requirements.txt`** listing:

      ```
      react-native-paper
      @expo/vector-icons
      react-native-safe-area-context
      @react-native-async-storage/async-storage
      @react-navigation/native
      @react-navigation/stack
      ```
    * Create **`install-deps.ps1`** (PowerShell) to auto-install:

      ```powershell
      # install-deps.ps1
      fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
      fnm use 22
 
      if (-not (Test-Path "./node_modules/expo")) {
        npm install expo
      }
 
      Get-Content .\expo-requirements.txt | ForEach-Object {
        $pkg = $_.Trim()
        if ($pkg -and -not $pkg.StartsWith("#")) {
          expo install $pkg
        }
      }
      Write-Host "All dependencies installed!"
      ```
    * Run once:

      ```powershell
      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass  
      .\install-deps.ps1
      ```

3. **Folder structure**

   ```
   BakerySim/
   ├── assets/                # (images if you had any)
   ├── screens/
   │   ├── MenuScreen.js
   │   └── CartScreen.js
   ├── theme.js
   ├── App.js
   ├── install-deps.ps1
   ├── expo-requirements.txt
   ├── package.json
   └── ...
   ```

---

## ▶️ 3. Run Your App!

In your project folder:

```bash
expo start
```

* Scan the QR code with Expo Go on your phone, or
* Press `w` in the terminal to launch it in a browser.

---

## 🔍 4. Code Walkthrough

### 4.1 **theme.js**

Defines our **purple-on-dark** color scheme.

```js
// theme.js
import { MD3DarkTheme as DefaultDark } from 'react-native-paper';

export const darkTheme = {
  ...DefaultDark,
  colors: {
    ...DefaultDark.colors,
    primary:    '#7e57c2',  // deep purple buttons
    accent:     '#b39ddb',  // lighter purple highlights
    background: '#121212',  // dark page background
    surface:    '#1f1f1f',  // cards & modals
    text:       '#ffffff',  // white text everywhere
  },
};
```

> **Tip for kids:**
> We “spread” the built-in theme (`...DefaultDark`) and then **override** just the colors we care about.

---

### 4.2 **App.js**

Sets up navigation and wraps everything in our `PaperProvider`.

```js
// App.js
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { darkTheme } from './theme';
import MenuScreen from './screens/MenuScreen';
import CartScreen from './screens/CartScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    // 1) Give all components our dark theme
    <PaperProvider theme={darkTheme}>
      {/* 2) NavigationContainer makes "screens" work */}
      <NavigationContainer theme={{ colors: darkTheme.colors }}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: darkTheme.colors.surface },
            headerTintColor: darkTheme.colors.text,
          }}
        >
          {/* 3) Two screens: Menu and Cart */}
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
```

> **Kids’ hint:**
> Think of each **screen** as a new page in your app. The navigator “stacks” them like cards in a deck.

---

### 4.3 **MenuScreen.js**

Displays desserts, lets you **add** to cart, and shows **stock**.

```js
// screens/MenuScreen.js
import React, { useState } from 'react';
import { FlatList } from 'react-native';
import {
  Appbar, Card, Paragraph,
  Button, Badge, Portal, Modal, Text
} from 'react-native-paper';
import { darkTheme } from '../theme';

// 1) Hard-coded list of desserts
const initialMenu = [
  { id: '1', name: 'Chocolate Cake', stock: 5, recipe: '• 200g flour\n• 100g sugar\n…' },
  { id: '2', name: 'Lemon Tart',     stock: 3, recipe: '• 200g flour\n• 100g butter\n…' },
  { id: '3', name: 'Strawberry Pie', stock: 1, recipe: '• 300g strawberries\n…' },
];

// 2) Helper to grab a 200×200 image from Unsplash
const getImage = name =>
  `https://source.unsplash.com/200x200/?${encodeURIComponent(name)},food,drink`;

export default function MenuScreen({ navigation }) {
  // 3) State: our menu & cart
  const [menu, setMenu] = useState(initialMenu);
  const [cart, setCart] = useState([]);
  const [modalItem, setModalItem] = useState(null);

  // 4) When “Add” is pressed:
  function addToCart(item) {
    if (item.stock === 0) return;          // no more stock → do nothing
    setMenu(m => 
      m.map(i => i.id === item.id 
        ? { ...i, stock: i.stock - 1 }     // reduce stock by 1
        : i
      )
    );
    setCart(c => [...c, item.id]);         // tack the item ID onto cart
  }

  // Count how many total items in cart
  const totalCount = cart.length;

  return (
    <>
      {/* Top bar with title & cart badge */}
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

      {/* List of dessert cards */}
      <FlatList
        data={menu}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <Card style={{ margin: 8, backgroundColor: darkTheme.colors.surface }}>
            <Card.Cover source={{ uri: getImage(item.name) }} />
            <Card.Title
              title={item.name}
              subtitle={`Stock: ${item.stock}`}
              titleStyle={{ color: darkTheme.colors.text }}
            />
            <Card.Content>
              <Paragraph style={{ color: darkTheme.colors.text }}>
                {item.recipe.split('\n')[0]}…{/* show only first line */}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                disabled={item.stock === 0}
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

      {/* Popup modal for full recipe */}
      <Portal>
        <Modal
          visible={!!modalItem}
          onDismiss={() => setModalItem(null)}
          contentContainerStyle={{
            margin: 20, padding: 20, borderRadius: 8,
            backgroundColor: darkTheme.colors.surface,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: darkTheme.colors.text, marginBottom: 8 }}>
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

> **Kid Tip:**
>
> * We keep the **menu** and **cart** in React’s **state** so the app updates automatically when they change.
> * The **FlatList** is like a super-powered loop that renders each card.

---

### 4.4 **CartScreen.js**

Shows what you added, lets you change **quantities**, enter your **name**, and “Pay” (simulate reservation).

```js
// screens/CartScreen.js
import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import {
  List, Avatar, Button, Divider, Text, TextInput
} from 'react-native-paper';
import { darkTheme } from '../theme';

// 1) This screen gets the cart items via navigation
export default function CartScreen({ route }) {
  // route.params.cartItems is an array of IDs
  const initialIds = route.params?.cartItems || [];
  // Build an array of { id, name, uri, qty }
  const [items, setItems] = useState(
    initialIds.reduce((acc, id) => {
      const existing = acc.find(x => x.id === id);
      if (existing) {
        existing.qty++;
      } else {
        acc.push({ id, qty: 1 });
      }
      return acc;
    }, [])
  );
  const [name, setName] = useState('');

  // 2) Helper for thumbnail
  const thumb = id =>
    `https://source.unsplash.com/40x40/?sig=${id},food,drink`;

  // 3) Change quantity (+1 or –1)
  function changeQty(idx, delta) {
    setItems(curr => {
      const next = [...curr];
      next[idx].qty += delta;
      if (next[idx].qty < 1) next.splice(idx, 1); // remove if zero
      return next;
    });
  }

  // 4) Simulate “Pay”
  function handlePay() {
    Alert.alert(
      'Reservation Confirmed',
      `Thanks, ${name.trim()}!\n` +
      items.map(i => `${i.qty} × item ${i.id}`).join(', ')
    );
    setItems([]);
    setName('');
  }

  return (
    <View style={[styles.container, { backgroundColor: darkTheme.colors.background }]}>
      <List.Section>
        {items.map((ci, idx) => (
          <View key={ci.id} style={styles.row}>
            <Avatar.Image size={40} source={{ uri: thumb(ci.id) }} />
            <View style={styles.info}>
              <Text style={{ color: darkTheme.colors.text }}>
                Item {ci.id}
              </Text>
              <Text style={{ color: darkTheme.colors.text }}>
                Qty: {ci.qty}
              </Text>
            </View>
            <View style={styles.controls}>
              <Button compact onPress={() => changeQty(idx, -1)}>-</Button>
              <Button compact onPress={() => changeQty(idx, +1)}>+</Button>
            </View>
          </View>
        ))}
      </List.Section>

      <Divider />

      {/* 5) Name input */}
      <TextInput
        label="Your Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      {/* 6) Total & Pay */}
      <Text style={[styles.total, { color: darkTheme.colors.text }]}>
        Total Items: {items.reduce((s, i) => s + i.qty, 0)}
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  info: { flex: 1, marginLeft: 8 },
  controls: { flexDirection: 'row' },
  input: { marginVertical: 12, backgroundColor: darkTheme.colors.surface },
  total: { textAlign: 'center', marginBottom: 12, fontSize: 16 },
});
```

> **Key points for kids:**
>
> * We build up the **items** array with `{id, qty}` and update it when you tap “+” or “–”.
> * The **TextInput** collects your reservation **name**.
> * The **Pay** button only works when you’ve entered a name and have at least one item.


## 🎉 5. Wrapping Up

* **Try it out!** Add different quantities, type your name, tap Pay.
* **Experiment**: change color hex codes in `theme.js` to craft your own style.
* **Explore**: add a “Remove all” button, or let users clear their cart.

You now have a **complete**, **themed**, **commented** React Native Expo app that uses local state, navigation, and a bit of network magic for images—perfect for a 1-hour lesson! Enjoy teaching and tinkering.
