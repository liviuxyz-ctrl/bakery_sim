// screens/CartScreen.js
import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import {
    List,
    Avatar,
    Button,
    Divider,
    Text,
    TextInput,
} from 'react-native-paper';
import { darkTheme } from '../theme';

export default function CartScreen({ route }) {
    // receive the cartItems array from MenuScreen
    const initial = route.params?.cartItems || [];
    const [cartItems, setCartItems] = useState(initial);
    const [name, setName] = useState('');

    // update qty or remove if <=0
    function updateQty(id, delta) {
        setCartItems(items => {
            return items
                .map(ci =>
                    ci.id === id
                        ? { ...ci, qty: ci.qty + delta }
                        : ci
                )
                .filter(ci => ci.qty > 0);
        });
    }

    // simulate pay
    function handlePay() {
        Alert.alert(
            'Reservation Confirmed',
            `Thank you, ${name.trim()}!\nYou reserved ${cartItems
                .map(ci => `${ci.qty}× ${ci.name}`)
                .join(', ')}.`
        );
        // reset (if you want)
        setCartItems([]);
        setName('');
    }

    return (
        <View style={[styles.container, {
            backgroundColor: darkTheme.colors.background,
        }]}>
            <List.Section>
                {cartItems.map((ci, idx) => (
                    <View key={ci.id} style={styles.row}>
                        <Avatar.Image size={40} source={{ uri: ci.imageUri }} />
                        <View style={styles.info}>
                            <Text style={{ color: darkTheme.colors.text }}>
                                {ci.name}
                            </Text>
                            <Text style={{ color: darkTheme.colors.text }}>
                                Qty: {ci.qty}
                            </Text>
                        </View>
                        <View style={styles.controls}>
                            <Button
                                compact
                                mode="text"
                                onPress={() => updateQty(ci.id, -1)}
                            >
                                –
                            </Button>
                            <Button
                                compact
                                mode="text"
                                onPress={() => updateQty(ci.id, +1)}
                            >
                                +
                            </Button>
                        </View>
                    </View>
                ))}
            </List.Section>

            <Divider />

            <TextInput
                label="Reservation Name"
                value={name}
                mode="outlined"
                onChangeText={setName}
                style={[
                    styles.input,
                    { backgroundColor: darkTheme.colors.surface },
                ]}
            />

            <Text style={[styles.total, {
                color: darkTheme.colors.text,
            }]}>
                Total Items: {cartItems.reduce((s, c) => s + c.qty, 0)}
            </Text>

            <Button
                mode="contained"
                onPress={handlePay}
                disabled={!name.trim() || cartItems.length === 0}
            >
                Pay
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    info: { flex: 1, marginLeft: 8 },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: { marginVertical: 12 },
    total: { textAlign: 'center', marginBottom: 12, fontSize: 16 },
});
