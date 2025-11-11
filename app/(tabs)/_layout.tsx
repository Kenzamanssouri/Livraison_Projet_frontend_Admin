import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Platform, TouchableOpacity, View, StyleSheet, I18nManager } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DropDownPicker from "react-native-dropdown-picker";

import CommandesScreen from "./commandes";
import AdminDashboard from "./index";
import PaiementScreen from "./paiement";
import UsersScreen from "./users";
import DocumentScreen from "./document";
import ParametreScreen from "./parametre";

const Drawer = createDrawerNavigator();

export default function AdminLayout() {
  const router = useRouter();
  const [lang, setLang] = useState("fr");

  // DropDownPicker state
  const [open, setOpen] = useState(false);

  const languages = [
    { label: "Français 🇫🇷", value: "fr" },
    { label: "English 🇬🇧", value: "en" },
    { label: "Español 🇪🇸", value: "es" },
    { label: "العربية 🇸🇦", value: "ar" },
  ];

  const changeLanguage = async (newLang: string) => {
    setLang(newLang);
    await AsyncStorage.setItem("lang", newLang);
    I18nManager.forceRTL(newLang === "ar");
  };

  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("lang");
      if (savedLang) changeLanguage(savedLang);
    })();
  }, []);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem("userToken");
    } else {
      await SecureStore.deleteItemAsync("userToken");
    }
    router.replace("/login");
  };

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: "#1e40af" },
        headerTintColor: "#fff",
        drawerActiveBackgroundColor: "#1e3a8a",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#cbd5e1",
        drawerLabelStyle: { fontSize: 16 },
        headerRight: () => (
          <View style={styles.headerRight}>
            {/* 🔹 Sélecteur de langue */}
            <DropDownPicker
              open={open}
              value={lang}
              items={languages}
              setOpen={setOpen}
              setValue={setLang}
              onChangeValue={changeLanguage}
              containerStyle={{ width: 140, marginRight: 10 }}
              style={{ backgroundColor: "#2563eb" }}
              dropDownContainerStyle={{ backgroundColor: "#1e3a8a" }}
              textStyle={{ color: "#fff" }}
            />

            {/* 🔹 Bouton déconnexion */}
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Icon name="logout" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Drawer.Screen name="Dashboard">
        {props => <AdminDashboard {...props} lang={lang} />}
      </Drawer.Screen>

      <Drawer.Screen name="Users">
        {props => <UsersScreen {...props} lang={lang} />}
      </Drawer.Screen>

      <Drawer.Screen name="Commandes">
        {props => <CommandesScreen {...props} lang={lang} />}
      </Drawer.Screen>

      <Drawer.Screen name="Paiement">
        {props => <PaiementScreen {...props} lang={lang} />}
      </Drawer.Screen>

      
      <Drawer.Screen name="Documents">
        {props => <DocumentScreen {...props} lang={lang} />}
      </Drawer.Screen>     
      <Drawer.Screen name="Parametres">
        {props => <ParametreScreen {...props} lang={lang} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
});
