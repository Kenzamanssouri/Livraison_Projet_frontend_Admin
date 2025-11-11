
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Badge, Card } from "react-native-paper";

export default function AdminDashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
const [users, setUsers] = useState<number>(0);
  const router = useRouter();
const [usersByRole, setUsersByRole] = useState<Record<string, number>>({});
const [totalUsers, setTotalUsers] = useState<number>(0);
const [ordersStats, setOrdersStats] = useState<any>(null);

  // 🔹 Récupérer le token stocké
  useEffect(() => {
    const getToken = async () => {
      let token: string | null = null;
      if (Platform.OS === "web") {
        token = await AsyncStorage.getItem("userToken");
      } else {
        token = await SecureStore.getItemAsync("userToken");
      }
      if (!token) {
        router.replace("/login");
        return;
      }
      setAccessToken(token);
    };
    getToken();
  }, []);

  // 🔹 Charger les commandes
  const fetchCommandes = async () => {
    try {
      const response = await fetch("http://localhost:8082/api/commandes");
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      console.log('data',data)
      setOrders(data || []);debugger
            console.log('order',orders)

    } catch (err) {
      console.error("Erreur chargement commandes:", err);
    }
  };

 // 🔹 Charger le nombre total d’utilisateurs
const fetchUsers = async () => {
  try {
    const response = await fetch("http://localhost:8082/api/utilisateurs/count");
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    debugger
    // ⚠️ si ton endpoint retourne un nombre brut (ex: 42)
    const data = await response.text(); debugger
    const total = parseInt(data, 10); // convertit la chaîne en nombre
    debugger
          console.log('total',total)

    setUsers(total); // 👈 maintenant users contient bien le nombre
    debugger
          console.log('users',users)

  } catch (err) {
    console.error("Erreur chargement utilisateurs:", err);
  }
};
const fetchUsersByRole = async () => {
  try {
    const response = await fetch("http://localhost:8082/api/utilisateurs/by-role");
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const data = await response.json(); // { client: 10, delivery: 3, vendor: 5, admin: 2 }
    setUsersByRole(data);
    const total = Object.values(data).reduce((acc, n) => acc + n, 0);
    setTotalUsers(total);
  } catch (err) {
    console.error("Erreur chargement utilisateurs par rôle:", err);
  }
};
const fetchOrdersByStatus = async () => {
  try {
    const response = await fetch("http://localhost:8082/api/commandes/by-status");
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    const data = await response.json();
    setOrdersStats(data);
  } catch (err) {
    console.error("Erreur chargement commandes par statut:", err);
  }
};


  useEffect(() => {
    fetchCommandes();
    fetchUsers();
      fetchUsersByRole();
      fetchOrdersByStatus();
  }, []);

  // 🔹 Déconnexion
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem("userToken");
    } else {
      await SecureStore.deleteItemAsync("userToken");
    }
    router.replace("/login");
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: "#64748b",
      confirmed: "#3b82f6",
      preparing: "#f97316",
      ready: "#a855f7",
      delivering: "#14b8a6",
      delivered: "#16a34a",
      cancelled: "#ef4444",
    };
    return (
      <Badge
        style={{
          backgroundColor: colors[status] || "#475569",
          color: "#fff",
        }}
      >
        {status}
      </Badge>
    );
  };

  const renderOrder = ({ item }: any) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderText}>Commande #{item.id}</Text>
          <Text style={styles.orderText}>{item.restaurantName}</Text>
        </View>
        <View style={styles.orderStatus}>
          <Text style={styles.orderText}>{item.total.toFixed(2)} €</Text>
          {getStatusBadge(item.status)}
        </View>
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.background}>
      <View style={styles.container}>
        

        {/* 🔹 Statistiques principales */}
        <View
          style={[
            styles.statsContainer,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          {/* Commandes totales */}
          <Card style={{ flex: 0.48, borderRadius: 12, overflow: "hidden" }}>
            <LinearGradient
              colors={["#f97316", "#ef4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 15 }}
            >
              <Text style={styles.statLabel}>Commandes totales</Text>
              <Text style={styles.statNumber}>{orders.length}</Text>
            </LinearGradient>
          </Card>

          {/* Revenu total */}
          <Card style={{ flex: 0.48, borderRadius: 12, overflow: "hidden" }}>
            <LinearGradient
              colors={["#3b82f6", "#4f46e5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 15 }}
            >
              <Text style={styles.statLabel}>Revenu total</Text>
              <Text style={styles.statNumber}>
                {orders
                  .reduce((acc, o) => acc + (o.total || 0), 0)
                  .toFixed(2)}{" "}
                €
              </Text>
            </LinearGradient>
          </Card>
        </View>
  <View
          style={[
            styles.statsContainer,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
        {/* 🔹 Utilisateurs totaux */}
          <Card style={{ flex: 0.48, borderRadius: 12, overflow: "hidden" }}>
  <LinearGradient
    colors={["#10b981", "#059669"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ padding: 15 }}
  >
    <Text style={styles.statLabel}>Utilisateurs</Text>
    <Text  style={styles.statNumber}>{users}</Text>
  </LinearGradient>
</Card>

</View>
   {/* 🔹 Commandes par statut */}
<Card style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, backgroundColor: "#1e293b", padding: 15 }}>
  <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Commandes par statut</Text>
  <Text style={{ color: "#cbd5e1", marginBottom: 10 }}>
    Distribution des commandes
  </Text>

  {ordersStats?.ordersByStatus &&
    Object.entries(ordersStats.ordersByStatus).map(([status, count]) => {
      const statusLabels: Record<string, string> = {
        EN_ATTENTE: "En attente",
        ACCEPTEE: "Acceptée",
        EN_PREPARATION: "En préparation",
        EN_ROUTE: "En route",
        LIVREE: "Livrée",
        ANNULEE: "Annulée",
      };

      const statusColors: Record<string, string> = {
        EN_ATTENTE: "#64748b",
        ACCEPTEE: "#3b82f6",
        EN_PREPARATION: "#f97316",
        EN_ROUTE: "#a855f7",
        LIVREE: "#16a34a",
        ANNULEE: "#ef4444",
      };

      const total = ordersStats.totalOrders || 1;
      const percentage = ((count / total) * 100).toFixed(0);

      return (
        <View key={status} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#f1f5f9" }}>{statusLabels[status]}</Text>
            <Text style={{ color: "#f1f5f9" }}>{count}</Text>
          </View>

          {/* Barre de progression */}
          <View style={{ backgroundColor: "#334155", borderRadius: 10, height: 8, marginTop: 4 }}>
            <View
              style={{
                backgroundColor: statusColors[status],
                width: `${percentage}%`,
                height: 8,
                borderRadius: 10,
              }}
            />
          </View>
        </View>
      );
    })}
</Card>
    
{/* 🔹 Répartition des utilisateurs par rôle */}
<Card style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, backgroundColor: "#1e293b", padding: 15 }}>
  <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Utilisateurs par rôle</Text>
  <Text style={{ color: "#cbd5e1", marginBottom: 10 }}>
    Distribution des utilisateurs
  </Text>

  {/* Liste des rôles */}
  {usersByRole &&
    Object.entries(usersByRole).map(([role, count]) => {
      const roleLabels: Record<string, string> = {
        client: "Clients",
        delivery: "Livreurs",
        vendor: "Vendeurs",
        admin: "Administrateurs",
      };

      const roleColors: Record<string, string> = {
        client: "#f97316", // orange
        delivery: "#3b82f6", // bleu
        vendor: "#10b981", // vert
        admin: "#8b5cf6", // violet
      };

      const total = totalUsers || 1;
      const percentage = ((count / total) * 100).toFixed(0);

      return (
        <View key={role} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#f1f5f9" }}>{roleLabels[role]}</Text>
            <Text style={{ color: "#f1f5f9" }}>{count}</Text>
          </View>

          {/* Barre de progression */}
          <View style={{ backgroundColor: "#334155", borderRadius: 10, height: 8, marginTop: 4 }}>
            <View
              style={{
                backgroundColor: roleColors[role],
                width: `${percentage}%`,
                height: 8,
                borderRadius: 10,
              }}
            />
          </View>
        </View>
      );
    })}
</Card>

        {/* 🔹 Liste des commandes récentes */}
        <Text style={styles.sectionTitle}>Commandes récentes</Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#0f172a" },
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e40af",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statLabel: { color: "#f1f5f9", fontSize: 16 },
  statNumber: { color: "#f1f5f9", fontSize: 22, fontWeight: "700" },
  sectionTitle: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#1e293b",
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderText: { color: "#e2e8f0" },
  orderStatus: { alignItems: "flex-end" },
});
