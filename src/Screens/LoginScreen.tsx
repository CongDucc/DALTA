import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const LoginScreen = () => {
    const [userId, setGetUserId] = useState('');
    const [userName, setGetUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            // Simulate API call
            const response = await fakeApiCall(email, password);

            if (response.success) {
                setGetUserId(response.user._id);
                setGetUserName(response.user.name); // Make sure to set username
                console.log('Login successful:', response.user);
            } else {
                console.error('Login failed:', response.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const fakeApiCall = async (email: string, password: string) => {
        // Simulated API response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: {
                        _id: '12345',
                        name: 'John Doe',
                    },
                });
            }, 1000);
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
            {userName ? <Text>Welcome, {userName}!</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});

export default LoginScreen;