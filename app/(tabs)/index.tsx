import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [vendeurs, setVendeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchVendeurs();
    fetchNotifications(); // Appelle aussi cette fonction

  }, []);

  const fetchVendeurs = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/vendeurs/paged?page=0&size=10');
      setVendeurs(response.data.content);
    } catch (error) {
      console.error('Erreur de chargement des vendeurs :', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://192.168.1.8:8082/api/notification');
      setNotificationCount(response.data.length); // Ou filtre si tu veux seulement les non lues
    } catch (error) {
      console.error('Erreur de chargement des notifications :', error);
    }
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D3D47" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header avec icône de notification */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Liste des Vendeurs</Text>
        <TouchableOpacity onPress={() => router.push('/NotificationsScreen')}>
          <View style={styles.notifContainer}>
            <Text style={styles.notifIcon}>🔔</Text>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Tableau */}
      <ScrollView horizontal>
        <View>
          {/* En-têtes du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>Nom</Text>
            <Text style={[styles.cell, styles.headerCell]}>Téléphone</Text>
            <Text style={[styles.cell, styles.headerCell]}>Ville</Text>
            <Text style={[styles.cell, styles.headerCell]}>Validé</Text>
            <Text style={[styles.cell, styles.headerCell]}>Action</Text>
          </View>

          {/* Lignes */}
          {vendeurs.map((vendeur: any) => (
            <View key={vendeur.id} style={styles.tableRow}>
              <Text style={styles.cell}>{vendeur.prenom} {vendeur.nom}</Text>
              <Text style={styles.cell}>{vendeur.telephone}</Text>
              <Text style={styles.cell}>{vendeur.ville}</Text>
              <Text style={styles.cell}>
                {vendeur.estValideParAdmin ? '✅' : '❌'}
              </Text>
              <TouchableOpacity
                style={[styles.cell, styles.viewButton]}
                onPress={() => router.push(`/detailVendeur/${vendeur.id}`)}
              >
                <Text style={styles.viewText}>Voir</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  notifContainer: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notifIcon: {
    fontSize: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  cell: {
    width: 120,
    paddingHorizontal: 8,
    textAlign: 'left',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#1D3D47',
    borderRadius: 4,
    alignItems: 'center',
  },
  viewText: {
    color: '#fff',
    paddingVertical: 4,
  },
});
