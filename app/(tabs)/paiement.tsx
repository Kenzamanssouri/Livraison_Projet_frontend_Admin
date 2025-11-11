import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const API_BASE = "http://localhost:8082";

export default function PaiementScreen() {
  const [deliveryBalances, setDeliveryBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const resLivreurs = await fetch(
        `${API_BASE}/api/livreurs?page=${pageNumber}&size=${pageSize}`
      );
      const livreursData = await resLivreurs.json();
      const list = livreursData.content || livreursData;
      setDeliveryBalances(list);
      setTotalPages(livreursData.totalPages || 1);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageNav = (type) => {
    if (type === "first") setPage(0);
    if (type === "prev" && page > 0) setPage(page - 1);
    if (type === "next" && page + 1 < totalPages) setPage(page + 1);
    if (type === "last") setPage(totalPages - 1);
  };

  const renderLivreur = ({ item }) => {   
    const balance = (item.depotGarantie || 0) + item.commissionTotale - item.encaissementsTotaux;

    const badgeColor = balance < 0 ? "#EF4444" : "#4CAF50";
    const badgeText = balance < 0 ? "Bloqué" : "Actif";

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.nom}</Text>
          <Text style={styles.subText}>
            Dépôt: {(item.depotGarantie || 0).toFixed(2)} €
          </Text>
          <Text style={[styles.amountPositive]}>
            +{item.commissionTotale.toFixed(2)} € commissions
          </Text>
          <Text style={[styles.amountNegative]}>
            -{item.encaissementsTotaux.toFixed(2)} € encaissements
          </Text>
          <Text
            style={[
              styles.balance,
              { color: balance < 0 ? "#EF4444" : "#16a34a" },
            ]}
          >
            Solde net: {balance.toFixed(2)} €
          </Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </View>
        <Icon
          name={balance < 0 ? "alert-circle-outline" : "check-circle-outline"}
          size={26}
          color={balance < 0 ? "#EF4444" : "#16a34a"}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Soldes des livreurs</Text>
      <Text style={styles.subtitle}>
        Commissions, encaissements et soldes nets
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : (
        <>
          <FlatList
            data={deliveryBalances}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLivreur}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Pagination */}
          <View style={styles.pageNav}>
            <TouchableOpacity onPress={() => handlePageNav("first")}>
              <Text>⏮️ First</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePageNav("prev")}>
              <Text>◀️ Prev</Text>
            </TouchableOpacity>
            <Text>
              Page {page + 1} / {totalPages}
            </Text>
            <TouchableOpacity onPress={() => handlePageNav("next")}>
              <Text>Next ▶️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePageNav("last")}>
              <Text>Last ⏭️</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#475569", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  subText: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  amountPositive: { fontSize: 14, color: "#16a34a", fontWeight: "500" },
  amountNegative: { fontSize: 14, color: "#dc2626", fontWeight: "500" },
  balance: { fontSize: 15, fontWeight: "600", marginTop: 6 },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  pageNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
});
