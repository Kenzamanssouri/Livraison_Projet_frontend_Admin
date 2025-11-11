import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ParametreScreen() {
  const [fraisLivraison, setFraisLivraison] = useState("");
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [seuilBlocage, setSeuilBlocage] = useState(500);
  const [delaiRegul, setDelaiRegul] = useState(5);

  const handleAddZone = () => {
    if (newZone.trim()) {
      setZones([...zones, newZone]);
      setNewZone("");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Paramètres de la plateforme</Text>

      {/* 🔹 FRAIS ET ZONES */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="map-marker-radius" size={22} color="#1e3a8a" />
          <Text style={styles.cardTitle}>Zones & Frais de livraison</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.label}>Frais de livraison standard (MAD)</Text>
          <TextInput
            value={fraisLivraison}
            onChangeText={setFraisLivraison}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Ex: 20"
          />

          <Text style={styles.label}>Zones de livraison</Text>
          {zones.map((z, i) => (
            <View key={i} style={styles.zoneItem}>
              <Text>{z}</Text>
              <TouchableOpacity onPress={() => setZones(zones.filter((_, idx) => idx !== i))}>
                <Icon name="delete-outline" size={22} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.row}>
            <TextInput
              placeholder="Nouvelle zone"
              value={newZone}
              onChangeText={setNewZone}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity style={styles.btnBlue} onPress={handleAddZone}>
              <Text style={styles.btnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 🔹 RÉGULARISATION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="cash-lock" size={22} color="#1e3a8a" />
          <Text style={styles.cardTitle}>Régularisation & Blocage Livreurs</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.label}>Seuil de blocage (MAD)</Text>
          <TextInput
            value={seuilBlocage.toString()}
            onChangeText={setSeuilBlocage}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Délai de régularisation (jours)</Text>
          <TextInput
            value={delaiRegul.toString()}
            onChangeText={setDelaiRegul}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      {/* 🔹 NOTIFICATIONS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="bell-ring" size={22} color="#1e3a8a" />
          <Text style={styles.cardTitle}>Notifications système</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text>Activer les notifications automatiques</Text>
            <TouchableOpacity onPress={() => setNotifications(!notifications)}>
              <Icon
                name={notifications ? "toggle-switch" : "toggle-switch-off-outline"}
                size={40}
                color={notifications ? "#2563eb" : "#9ca3af"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>💾 Sauvegarder les paramètres</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginVertical: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginLeft: 8, color: "#1e293b" },
  cardBody: { marginTop: 5 },
  label: { fontWeight: "500", marginTop: 8, color: "#475569" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
    backgroundColor: "#f8fafc",
  },
  zoneItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  btnBlue: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
