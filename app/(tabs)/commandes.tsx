import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type LigneCommande = {
  id: number;
  produit: {
    id: number;
    nom: string;
    description?: string;
    prix: number;
    image?: string;
  };
  quantite: number;
  prixUnitaire: number;
  optionsChoisies?: string[];
};

type Order = {
  id: string;
  modePaiement: string;
  client: Client;
  vendeur: Vendeur;
  livreur: Livreur;
  total: number;
  statut:
    | "EN_ATTENTE"
    | "ACCEPTEE"
    | "EN_PREPARATION"
    | "EN_ROUTE"
    | "LIVREE"
    | "ANNULEE";
  dateCommande: string | null;
  lignes?: LigneCommande[];
  livraisonAdresse?: string;
};

type Client={
  nom:string;
  prenom:string;
}

type Vendeur={
  nom:string;
  prenom:string;
}
type Livreur={
  nom:string;
  prenom:string;
}
type PageResponse = {
  content: Order[];
  totalPages: number;
  number: number;
  totalElements: number;
};

export default function CommandesScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  const API_BASE = "http://localhost:8082";

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (pageNumber: number = 0) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/commandes/paged?page=${pageNumber}&size=${pageSize}`
      );debugger
      const data: PageResponse = await res.json();debugger
      setOrders(data.content);debugger
      setTotalPages(data.totalPages);debugger
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: Order["statut"]) => {
    const colors: Record<string, string> = {
      EN_ATTENTE: "#F59E0B",
      ACCEPTEE: "#3B82F6",
      EN_PREPARATION: "#8B5CF6",
      EN_ROUTE: "#06B6D4",
      LIVREE: "#4CAF50",
      ANNULEE: "#EF4444",
    };
    return (
      <View style={[styles.badge, { backgroundColor: colors[statut] || "#6b7280" }]}>
        <Text style={styles.badgeText}>{statut?.replace("_", " ") || "N/A"}</Text>
      </View>
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.client}>{item.client.nom}  {item.client.prenom}</Text>
        <Text style={styles.date}>
          {new Date(item.dateCommande).toLocaleDateString("fr-FR")}
        </Text>
        <Text style={styles.total}>{item.total.toFixed(2)} €</Text>
        {getStatusBadge(item.statut)}
      </View>

      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}
      >
        <Icon name="information-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const handlePageNav = (type: string) => {
    if (type === "first") setPage(0);
    if (type === "prev" && page > 0) setPage(page - 1);
    if (type === "next" && page + 1 < totalPages) setPage(page + 1);
    if (type === "last") setPage(totalPages - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Toutes les commandes</Text>
      <Text style={styles.subtitle}>Supervision et intervention en cas de litige</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : (
        <>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
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

      {/* Modal détails commande */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder ? (
              <ScrollView>
                <Text style={styles.modalTitle}>Détails de la commande</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>ID:</Text> #{selectedOrder.id}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Client:</Text> {selectedOrder.client.nom}  {selectedOrder.client.prenom}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Vendeur:</Text> {selectedOrder.vendeur.nom}  {selectedOrder.vendeur.prenom}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Livreur:</Text> {selectedOrder.livreur.nom}  {selectedOrder.livreur.prenom}
                </Text>
                 <Text style={styles.modalText}>
                  <Text style={styles.label}>Mode de Paiement:</Text> {selectedOrder.modePaiement}  
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Montant:</Text> {selectedOrder.total.toFixed(2)} €
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Statut:</Text>{" "}
                  {selectedOrder.statut ? selectedOrder.statut.replace("_", " ") : "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.label}>Date:</Text>{" "}
                  {new Date(selectedOrder.dateCommande).toLocaleString("fr-FR")}
                </Text>
                {selectedOrder.livraisonAdresse && (
                  <Text style={styles.modalText}>
                    <Text style={styles.label}>Adresse:</Text> {selectedOrder.livraisonAdresse}
                  </Text>
                )}

               {selectedOrder.lignes && (
  <>
    <Text style={[styles.modalTitle, { marginTop: 10 }]}>Produits</Text>
    {selectedOrder.lignes.map((ligne, idx) => (
      <View key={idx} style={{ marginBottom: 6 }}>
        <Text style={styles.modalText}>
          {ligne.quantite} × {ligne.produit.nom} - {ligne.prixUnitaire.toFixed(2)} €
        </Text>
        {ligne.optionsChoisies && ligne.optionsChoisies.length > 0 && (
          <Text
            style={[styles.modalText, { marginLeft: 10, fontStyle: "italic" }]}
          >
            Options: {ligne.optionsChoisies.join(", ")}
          </Text>
        )}
      </View>
    ))}
  </>
)}


                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#1e293b", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#475569", marginBottom: 12 },
  orderRow: {
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
  client: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  date: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  total: { fontSize: 15, color: "#2563eb", fontWeight: "600", marginBottom: 4 },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  detailBtn: { backgroundColor: "#2563eb", padding: 8, borderRadius: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#2563eb" },
  modalText: { fontSize: 15, color: "#334155", marginBottom: 6 },
  label: { fontWeight: "700", color: "#0f172a" },
  closeBtn: { marginTop: 15, backgroundColor: "#2563eb", paddingVertical: 10, borderRadius: 8 },
  closeText: { color: "#fff", textAlign: "center", fontWeight: "600" },
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
