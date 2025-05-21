import { View, Text, TextInput, Button, StyleSheet ,Platform,Alert} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
 
  const [error, setError] = useState('');
  const handleLogin = async () => {
    setError(''); // reset error first
    try {
      const response = await fetch('http://192.168.1.8:8082/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          motDePasse: password,
          role:3,
        }),
      });

      if (!response.ok) {
        throw new Error('Identifiants invalides');
      }

      const data = await response.json();
      console.log('Token reçu du backend :', data.token);

      try {
        if (Platform.OS === 'web') {
          await AsyncStorage.setItem('userToken', data.token);
        } else {
          await SecureStore.setItemAsync('userToken', data.token);
        }
      } catch (err) {
        console.error("Erreur lors de l'enregistrement du token :", err);
        Alert.alert("Attention", "Le token n'a pas pu être enregistré localement.");
      }

      Alert.alert('Bienvenue', 'Connexion réussie !');
      router.replace("/(tabs)"); // Navigate to main tabs on success
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Login</Text>
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
});
