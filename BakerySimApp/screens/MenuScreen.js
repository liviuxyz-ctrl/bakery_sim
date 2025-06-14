// screens/MenuScreen.js
import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import {
    Appbar,
    Card,
    Button,
    Paragraph,
    Badge,
    Portal,
    Modal,
    Text,
} from 'react-native-paper';
import { darkTheme } from '../theme';

// initial menu data
const initialMenu = [
    { id: '1', name: 'Chocolate Cake', stock: 5, recipe: '• 200g flour\n• 100g sugar\n• 50g cocoa\n…' },
    { id: '2', name: 'Lemon Tart',     stock: 3, recipe: '• 200g flour\n• 100g butter\n• 2 lemons\n…' },
    { id: '3', name: 'Strawberry Pie', stock: 1, recipe: '• 369g strawberries\n• 100g sugar\n• Pie crust\n…' },
    { id: '4', name: 'Strawberry Pie', stock: 1, recipe: '• 300g strawberries\n• 100g sugar\n• Pie crust\n…' }
];

// helper to pull a 200×200 photo from Unsplash
const getImageUri = name =>
    `https://source.unsplash.com/200x200/?${encodeURIComponent(name)},food,drink&sig=${name}`;

function getCustomUri(id) {
    switch (id) {
        case '1':
            return `https://www.oetker.co.uk/assets/recipes/assets/46b664a502ce4ebdb241e6667ce789b7/1272x764/pinata-rainbow-cake.webp`;
        case '2':
            return `https://ichef.bbc.co.uk/ace/standard/1600/food/recipes/funfetti_cake_49993_16x9.jpg.webp`;
        default:
            return 'https://communityhub.sage.com/resized-image/__size/640x480/__key/communityserver-discussions-components-files/390/pastedimage1696580419131v1.png';
    }
}

export default function MenuScreen({ navigation }) {
    // cart: array of { id, name, imageUri, qty }
    const [cart, setCart] = useState([]);
    const [menu, setMenu] = useState(initialMenu);
    const [modalItem, setModalItem] = useState(null);

    // handle adding to cart
    function addToCart(item) {
        if (item.stock < 1) return;
        // decrement stock in menu
        setMenu(m =>
            m.map(i =>
                i.id === item.id ? { ...i, stock: i.stock - 1 } : i
            )
        );
        // add or increment cart entry
        setCart(c => {
            const idx = c.findIndex(ci => ci.id === item.id);
            if (idx >= 0) {
                const updated = [...c];
                updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
                return updated;
            } else {
                return [
                    ...c,
                    {
                        id: item.id,
                        name: item.name,
                        imageUri: getImageUri(item.name),
                        qty: 1,
                    },
                ];
            }
        });
    }

    // badge count
    const totalItems = cart.reduce((sum, ci) => sum + ci.qty, 0);

    return (
        <>
            <Appbar.Header style={{ backgroundColor: darkTheme.colors.surface }}>
                <Appbar.Content
                    title="Dessert Shop"
                    titleStyle={{ color: darkTheme.colors.text }}
                />
                <Appbar.Action
                    icon="cake"
                    color={"#71932CFF"}
                    onPress={() =>
                        navigation.navigate('Cart', { cartItems: cart })
                    }
                />
                {totalItems > 0 && (
                    <Badge
                        size={20}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: darkTheme.colors.accent,
                        }}
                    >
                        {totalItems}
                    </Badge>
                )}
            </Appbar.Header>

            <FlatList
                data={menu}
                keyExtractor={i => i.id}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => (
                    <Card style={{ margin: 8, backgroundColor: darkTheme.colors.surface }}>
                        <Card.Cover source={{ uri: getCustomUri(item.id) }} />
                        <Card.Title
                            title={item.name}
                            subtitle={`Stock: ${item.stock}`}
                            titleStyle={{ color: darkTheme.colors.text }}
                            subtitleStyle={{
                                color: item.stock > 1
                                    ? darkTheme.colors.accent
                                    : '#CDE3F1FF',
                            }}
                        />
                        <Card.Content>
                            <Text style={{ color: darkTheme.colors.text }}>
                                {item.recipe.split('\n')[0]}…
                            </Text>
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                mode="contained"
                                onPress={() => addToCart(item)}
                                disabled={item.stock === 0}
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

            <Portal>
                <Modal
                    visible={!!modalItem}
                    onDismiss={() => setModalItem(null)}
                    contentContainerStyle={{
                        margin: 20,
                        padding: 20,
                        borderRadius: 8,
                        backgroundColor: darkTheme.colors.surface,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: darkTheme.colors.text,
                            marginBottom: 8,
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
