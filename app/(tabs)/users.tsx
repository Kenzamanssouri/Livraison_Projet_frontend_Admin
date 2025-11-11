import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge, Card, Tooltip } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";

type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "CLIENT" | "VENDEUR" | "LIVREUR" | "ADMIN";
  bloque: boolean;
  estValideParAdmin?: boolean | null;
  motifRejet?: string;
  depotGarantie?: number;
};

type PageResponse = {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
};

export default function UsersScreen() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [allPage, setAllPage] = useState(0);
  const [allTotalPages, setAllTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | User["role"]>("");

  const API_BASE = "http://localhost:8082";

  // Charger token
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token =
          Platform.OS === "web"
            ? await AsyncStorage.getItem("userToken")
            : await SecureStore.getItemAsync("userToken");
        if (token) setJwtToken(token);
      } catch (err) {
        console.error("Erreur récupération token:", err);
      }
    };
    loadToken();
  }, []);

  // Filtrage search + rôle
  useEffect(() => {
    let result = allUsers;

    if (searchTerm.trim()) {
      result = result.filter(
        (u) =>
          u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, allUsers]);

  // 🔹 Charger les utilisateurs en attente
  const fetchPendingUsers = async (pageNumber = 0, size = pageSize) => {
    if (!jwtToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/utilisateurs/LivreurVendeurNonAccepter?page=${pageNumber}&size=${size}`
      );
      const data: PageResponse = await res.json();
      setPendingUsers(data.content);
      setPendingPage(data.number);
      setPendingTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Charger tous les utilisateurs
  const fetchAllUsers = async (pageNumber = 0, size = pageSize) => {
    if (!jwtToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/utilisateurs?page=${pageNumber}&size=${size}`
      );
      const data: PageResponse = await res.json();
      setAllUsers(data.content);
      setFilteredUsers(data.content); // initial filtered = all
      setAllPage(data.number);
      setAllTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken) {
      fetchPendingUsers(0, pageSize);
      fetchAllUsers(0, pageSize);
    }
  }, [jwtToken]);

  // 🔹 Pagination
  const handlePendingNav = (type: string) => {
    if (type === "first") fetchPendingUsers(0);
    if (type === "prev" && pendingPage > 0) fetchPendingUsers(pendingPage - 1);
    if (type === "next" && pendingPage + 1 < pendingTotalPages)
      fetchPendingUsers(pendingPage + 1);
    if (type === "last") fetchPendingUsers(pendingTotalPages - 1);
  };

  const handleAllNav = (type: string) => {
    if (type === "first") fetchAllUsers(0);
    if (type === "prev" && allPage > 0) fetchAllUsers(allPage - 1);
    if (type === "next" && allPage + 1 < allTotalPages)
      fetchAllUsers(allPage + 1);
    if (type === "last") fetchAllUsers(allTotalPages - 1);
  };

  // 🔹 Badge rôle
  const getRoleBadge = (role: string | null | undefined) => {
    if (!role) return null;
    const colors: Record<string, string> = {
      CLIENT: "#6366f1",
      VENDEUR: "#10b981",
      LIVREUR: "#3b82f6",
      ADMIN: "#f59e0b",
    };
    return (
      <Badge
        style={{
          backgroundColor: colors[role] || "#6b7280",
          color: "#fff",
          marginLeft: 6,
        }}
      >
        {role}
      </Badge>
    );
  };

  // 🔹 Valider un utilisateur
  const handleValidateUser = async (user: User) => {
    try {
      const endpoint =
        user.role === "VENDEUR"
          ? `${API_BASE}/api/vendeurs/${user.id}/accept`
          : `${API_BASE}/api/livreurs/${user.id}/accept`;

      const res = await fetch(endpoint, { method: "GET" });
      if (!res.ok) throw new Error("Erreur validation");
      fetchPendingUsers(pendingPage);
      fetchAllUsers(allPage);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Ouvrir modal de rejet
  const handleRejectUser = (user: User) => {
    setSelectedUser(user);
    setRejectModalVisible(true);
  };

  // 🔹 Confirmer le rejet
  const confirmRejectUser = async () => {
    if (!selectedUser || !rejectReason.trim()) return;
    try {
      const endpoint =
        selectedUser.role === "VENDEUR"
          ? `${API_BASE}/api/vendeurs/${selectedUser.id}/refuse/${rejectReason}`
          : `${API_BASE}/api/livreurs/${selectedUser.id}/refuse/${rejectReason}`;
      const res = await fetch(endpoint, { method: "GET" });
      if (!res.ok) throw new Error("Erreur lors du rejet");

      setRejectModalVisible(false);
      setRejectReason("");
      setSelectedUser(null);
      fetchPendingUsers(pendingPage);
      fetchAllUsers(allPage);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Voir détails
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsVisible(true);
  };

  // 🔹 Rendu utilisateur
  const renderPendingUser = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>
          {item.nom} {item.prenom} {getRoleBadge(item.role)}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userStatus}>
          {!item.bloque ? "✅ Actif" : "⛔ Bloqué"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Tooltip title="Valider">
          <TouchableOpacity
            style={[styles.actionBtn, styles.validateBtn]}
            onPress={() => handleValidateUser(item)}
          >
            <Icon name="check" size={20} color="#fff" />
          </TouchableOpacity>
        </Tooltip>
        <Tooltip title="Refuser">
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleRejectUser(item)}
          >
            <Icon name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </Tooltip>
        <Tooltip title="Détails">
          <TouchableOpacity
            style={[styles.actionBtn, styles.detailBtn]}
            onPress={() => handleViewDetails(item)}
          >
            <Icon name="information" size={20} color="#fff" />
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>
          {item.nom} {item.prenom} {getRoleBadge(item.role)}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userStatus}>
          {!item.bloque ? "✅ Actif" : "⛔ Bloqué"}
        </Text>
        {item.role === "LIVREUR" && (
          <Text style={{ color: "#2563eb", marginTop: 4 }}>
            💰 Dépôt de garantie :{" "}
            <Text style={{ fontWeight: "700" }}>
              {item.depotGarantie ? `${item.depotGarantie.toFixed(2)} MAD` : "—"}
            </Text>
          </Text>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Tooltip title="Détails">
          <TouchableOpacity
            style={[styles.actionBtn, styles.detailBtn]}
            onPress={() => handleViewDetails(item)}
          >
            <Icon name="information" size={20} color="#fff" />
          </TouchableOpacity>
        </Tooltip>
          {/* Bloquer / Débloquer */}

      {/* 🔹 Bouton Bloquer / Débloquer uniquement pour LIVREUR ou VENDEUR */}
      {(item.role === "LIVREUR" || item.role === "VENDEUR") && (
        <Tooltip title={item.bloque ? "Débloquer" : "Bloquer"}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: item.bloque ? "#10b981" : "#ef4444" },
            ]}
            onPress={() => handleToggleBlockUser(item)}
          >
            <Icon name={item.bloque ? "lock-open" : "lock"} size={20} color="#fff" />
          </TouchableOpacity>
        </Tooltip>
      )}
      </View>
    </View>
  );

  // 🔹 Recherche backend
const fetchFilteredUsers = async (
  query: string = "", 
  role: string = "", 
  pageNumber = 0, 
  size = pageSize
) => {
  if (!jwtToken) return;
  setLoading(true);
  try {
    const url = `${API_BASE}/api/utilisateurs?page=${pageNumber}&size=${size}` +
                `&search=${encodeURIComponent(query)}&role=${encodeURIComponent(role)}`;
    const res = await fetch(url);
    const data: PageResponse = await res.json();
    setAllUsers(data.content);
    setFilteredUsers(data.content); // initial filtered = all
    setAllPage(data.number);
    setAllTotalPages(data.totalPages);
  } catch (err) {
    console.error("Erreur recherche:", err);
  } finally {
    setLoading(false);
  }
};
const handleToggleBlockUser = async (user: User) => {
  if (!jwtToken) return;
  try {
    const endpoint = `${API_BASE}/api/utilisateurs/${user.role}/${user.id}/${user.bloque ? 'debloquer' : 'bloquer'}`;
    const res = await fetch(endpoint, { method: "GET" });
    if (!res.ok) throw new Error("Erreur lors du changement de statut");
    
    // Refresh user list
    fetchAllUsers(allPage);
    fetchPendingUsers(pendingPage);
  } catch (err) {
    console.error("Erreur blocage/déblocage:", err);
  }
};

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        {/* VALIDATIONS EN ATTENTE */}
        <Card style={[styles.card, styles.pendingCard]}>
          <Text style={styles.pendingTitle}>
            Validations en attente ({pendingUsers.length})
          </Text>
          <Text style={styles.pendingDescription}>
            Vendeurs et livreurs en attente de validation
          </Text>
          {pendingUsers.length > 0 ? (
            <>
              <FlatList
                data={pendingUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPendingUser}
                scrollEnabled={false}
              />
              <View style={styles.pageNav}>
                <TouchableOpacity onPress={() => handlePendingNav("first")}>
                  <Text>⏮️ First</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePendingNav("prev")}>
                  <Text>◀️ Prev</Text>
                </TouchableOpacity>
                <Text>
                  Page {pendingPage + 1} / {pendingTotalPages}
                </Text>
                <TouchableOpacity onPress={() => handlePendingNav("next")}>
                  <Text>Next ▶️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePendingNav("last")}>
                  <Text>Last ⏭️</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={{ color: "#6b7280", fontStyle: "italic", marginVertical: 8 }}>
              ✅ Aucun utilisateur en attente de validation
            </Text>
          )}
        </Card>

        {/* TOUS LES UTILISATEURS */}
        <Card style={[styles.card, { backgroundColor: "#fff" }]}>
          <Text style={styles.pendingTitle}>👥 Tous les utilisateurs</Text>

          {/* Recherche */}
        <TextInput
  placeholder="Rechercher par nom, prénom ou email..."
  style={[styles.textInput, { marginBottom: 8 }]}
  value={searchTerm}
  onChangeText={(text) => {
    setSearchTerm(text);
    fetchFilteredUsers(text, roleFilter); // pass current roleFilter too
  }}
/>


          {/* Filtre par rôle */}
         <Picker
  selectedValue={roleFilter}
  onValueChange={(value) => {
    setRoleFilter(value);
    fetchFilteredUsers(searchTerm, value); // 🔹 on passe aussi le searchTerm actuel
  }}
  style={{ marginBottom: 8, backgroundColor: "#f3f4f6", borderRadius: 8 }}
>
  <Picker.Item label="Tous les rôles" value="" />
  <Picker.Item label="Client" value="CLIENT" />
  <Picker.Item label="Vendeur" value="VENDEUR" />
  <Picker.Item label="Livreur" value="LIVREUR" />
  <Picker.Item label="Admin" value="ADMIN" />
</Picker>

          <FlatList
            data={filteredUsers}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderUser}
            scrollEnabled={false}
          />

          <View style={styles.pageNav}>
            <TouchableOpacity onPress={() => handleAllNav("first")}>
              <Text>⏮️ First</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAllNav("prev")}>
              <Text>◀️ Prev</Text>
            </TouchableOpacity>
            <Text>
              Page {allPage + 1} / {allTotalPages}
            </Text>
            <TouchableOpacity onPress={() => handleAllNav("next")}>
              <Text>Next ▶️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAllNav("last")}>
              <Text>Last ⏭️</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {loading && <ActivityIndicator size="large" style={{ margin: 16 }} />}
      </ScrollView>

      {/* Modal rejet */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Motif du rejet</Text>
            <TextInput
              placeholder="Saisissez le motif du rejet..."
              style={styles.textInput}
              multiline
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <Text style={{ color: "#6b7280" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRejectUser}>
                <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal détails */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <Text style={styles.detailTitle}>📋 Détails de l'utilisateur</Text>
            {selectedUser ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nom complet :</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser.nom} {selectedUser.prenom}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email :</Text>
                  <Tooltip title={selectedUser.email}>
                    <Text
                      style={[styles.detailValue, { maxWidth: 180 }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {selectedUser.email}
                    </Text>
                  </Tooltip>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rôle :</Text>
                  <Text style={[styles.detailValue, { textTransform: "capitalize" }]}>
                    {selectedUser.role}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Statut :</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: selectedUser.bloque ? "#dc2626" : "#16a34a" },
                    ]}
                  >
                    {selectedUser.bloque ? "Bloqué" : "Actif"}
                  </Text>
                </View>
                {selectedUser.role === "LIVREUR" && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Dépôt de garantie :</Text>
                    <Text style={styles.detailValue}>
                      {selectedUser.depotGarantie
                        ? `${selectedUser.depotGarantie.toFixed(2)} MAD`
                        : "—"}
                    </Text>
                  </View>
                )}
                {selectedUser.motifRejet && (
                  <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                    <Text style={styles.detailLabel}>Motif de rejet :</Text>
                    <Text style={[styles.detailValue, { flex: 1 }]}>
                      {selectedUser.motifRejet}
                    </Text>
                  </View>
                )}
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setDetailsVisible(false)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ActivityIndicator size="large" color="#2563eb" />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", paddingBottom: 20 },

  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingCard: { borderLeftWidth: 5, borderLeftColor: "#f97316" },

  pendingTitle: { fontSize: 18, fontWeight: "700", color: "#ea580c", marginBottom: 6 },
  pendingDescription: { fontSize: 14, color: "#92400e", marginBottom: 12 },

  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  userInfo: { flex: 1, marginRight: 12 },
  userName: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  userEmail: { fontSize: 14, color: "#475569", marginTop: 2 },
  userStatus: { fontSize: 14, fontWeight: "600", marginTop: 4 },

  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  validateBtn: { backgroundColor: "#4CAF50" },
  rejectBtn: { backgroundColor: "#E53935" },
  detailBtn: { backgroundColor: "#3B82F6" },
  blockBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#2563eb" },

  detailsModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  detailTitle: { fontSize: 18, fontWeight: "700", color: "#2563eb", textAlign: "center", marginBottom: 16 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: { fontWeight: "600", color: "#374151", flex: 0.6 },
  detailValue: { flex: 1, color: "#1f2937", fontSize: 14, textAlign: "right" },
  closeBtn: { backgroundColor: "#2563eb", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginTop: 20 },

  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    minHeight: 40,
    textAlignVertical: "top",
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },

  pageNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  picker: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 6,
  },
});

