import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("fr");

  // DropDownPicker state
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const texts = {
    fr: {
      title: "Espace Administrateur",
      email: "Adresse email",
      password: "Mot de passe",
      login: "Se connecter",
      success: "Connexion réussie !",
      welcome: "Bienvenue",
      error: "Identifiants invalides",
      footer: "© 2025 Portail Administratif — Tous droits réservés",
    },
    en: {
      title: "Admin Area",
      email: "Email address",
      password: "Password",
      login: "Login",
      success: "Login successful!",
      welcome: "Welcome",
      error: "Invalid credentials",
      footer: "© 2025 Admin Portal — All rights reserved",
    },
    es: {
      title: "Área Administrativa",
      email: "Correo electrónico",
      password: "Contraseña",
      login: "Iniciar sesión",
      success: "¡Inicio de sesión exitoso!",
      welcome: "Bienvenido",
      error: "Credenciales inválidas",
      footer: "© 2025 Portal Administrativo — Todos los derechos reservados",
    },
    ar: {
      title: "منطقة الإدارة",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      login: "تسجيل الدخول",
      success: "تم تسجيل الدخول بنجاح!",
      welcome: "مرحباً",
      error: "بيانات الاعتماد غير صالحة",
      footer: "© ٢٠٢٥ البوابة الإدارية — جميع الحقوق محفوظة",
    },
  };

  const languages = [
    { label: 'Français 🇫🇷', value: 'fr' },
    { label: 'English 🇬🇧', value: 'en' },
    { label: 'Español 🇪🇸', value: 'es' },
    { label: 'العربية 🇸🇦', value: 'ar' },
  ];

  // Charger la langue sauvegardée
  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("lang");
      if (savedLang) changeLanguage(savedLang);
    })();
  }, []);

  // Changement de langue avec RTL
  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem("lang", newLang);
    I18nManager.forceRTL(newLang === "ar");
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, motDePasse: password, role: 3 }),
      });

      if (!response.ok) throw new Error(texts[lang].error);
      const data = await response.json();
      console.log('Token reçu du backend :', data.token);

      if (Platform.OS === 'web') {
        debugger
        await AsyncStorage.setItem('userToken', data.token);
      } else {
        await SecureStore.setItemAsync('userToken', data.token);
      }

      Alert.alert(texts[lang].welcome, texts[lang].success);
      router.replace("/(tabs)");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2070' }}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior="padding" style={styles.container}>

        {/* Sélecteur de langue flottant */}
        <View style={styles.langDropdownWrapper}>
          <DropDownPicker
            open={open}
            value={lang}
            items={languages}
            setOpen={setOpen}
            setValue={setLang}
            onChangeValue={changeLanguage}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        <View style={[styles.card, lang === "ar" && { direction: "rtl" }]}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.logo}
          />
          <Text style={styles.header}>{texts[lang].title}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            placeholder={texts[lang].email}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            onChangeText={setLogin}
            value={login}
            placeholderTextColor="#94a3b8"
            textAlign={lang === "ar" ? "right" : "left"}
          />
          <TextInput
            placeholder={texts[lang].password}
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholderTextColor="#94a3b8"
            textAlign={lang === "ar" ? "right" : "left"}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{texts[lang].login}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>{texts[lang].footer}</Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  logo: { width: 70, height: 70, alignSelf: 'center', marginBottom: 15 },
  header: { fontSize: 24, fontWeight: '700', color: '#f8fafc', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#f1f5f9',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  error: { color: '#f87171', textAlign: 'center', marginBottom: 10, fontSize: 14 },
  footerText: { marginTop: 25, fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  langDropdownWrapper: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 150,
    zIndex: 1000,
  },
  dropdown: { backgroundColor: 'rgba(255,255,255,0.1)' },
  dropdownText: { color: '#f1f5f9' },
  dropdownContainer: { backgroundColor: 'rgba(30,41,59,0.9)' },
});
