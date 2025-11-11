import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const showAlert = (title: string, message: string): void => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const DetailVendeur = () => {
  const { id } = useLocalSearchParams();
  const [vendeur, setVendeur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [motif, setMotif] = useState('');
  const [piecesJointes, setPiecesJointes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchVendeur = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/api/vendeurs/${id}`);
        setVendeur(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du vendeur:', error);
        showAlert('Erreur', 'Impossible de récupérer les informations du vendeur.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPiecesJointes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/uploadPj1/by-Id-type/${id}/VendeurFichier`
        );
        setPiecesJointes(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des pièces jointes:', error);
      }
    };

    if (id) {
      fetchVendeur();
      fetchPiecesJointes();
    }
  }, [id]);

  const handleAccept = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Voulez-vous vraiment accepter ce vendeur ?');
      if (confirmed) {
        acceptVendeur();
      }
    } else {
      Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment accepter ce vendeur ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Accepter', onPress: acceptVendeur },
        ],
        { cancelable: true }
      );
    }
  };

  const acceptVendeur = async () => {
    try {
      await axios.get(`http://localhost:8082/api/vendeurs/${id}/accept`);
      showAlert('Succès', 'Le vendeur a été accepté.');
      router.back();
    } catch (err) {
      showAlert('Erreur', 'Impossible d’accepter le vendeur.');
    }
  };

  const handleRefuse = () => {
    setMotif('');
    setShowRefuseModal(true);
  };

  const refuseVendeur = async () => {
    if (!motif.trim()) {
      showAlert('Erreur', 'Veuillez saisir un motif de refus.');
      return;
    }

    try {
      await axios.get(`http://localhost:8082/api/vendeurs/${id}/refuse/${motif}`);
      showAlert('Succès', 'Le vendeur a été refusé.');
      setShowRefuseModal(false);
      router.back();
    } catch (err) {
      showAlert('Erreur', 'Impossible de refuser le vendeur.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!vendeur) {
    return (
      <View style={styles.container}>
        <Text>Vendeur non trouvé.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Détails du Vendeur</Text>

      <Text style={styles.sectionTitle}>Informations personnelles</Text>
      <Text>Nom: {vendeur.nom}</Text>
      <Text>Prénom: {vendeur.prenom}</Text>
      <Text>Email: {vendeur.email}</Text>
      <Text>Téléphone: {vendeur.telephone}</Text>
      <Text>Adresse: {vendeur.adresse}</Text>
      <Text>Ville: {vendeur.ville}</Text>

      <Text style={styles.sectionTitle}>Informations professionnelles</Text>
      <Text>Nom de l'établissement: {vendeur.nomEtablissement}</Text>
      <Text>Catégorie: {vendeur.categorie}</Text>
      <Text>Registre de commerce: {vendeur.registreCommerce}</Text>
      <Text>Identifiant fiscal: {vendeur.identifiantFiscal}</Text>
      <Text>RIB: {vendeur.rib || 'Non fourni'}</Text>

      <Text style={styles.sectionTitle}>Horaire d'ouverture</Text>
      {vendeur.horaireOuverture ? (
        <>
          <Text>Jour: {vendeur.horaireOuverture.jour}</Text>
          <Text>Ouverture: {vendeur.horaireOuverture.heureOuverture}</Text>
          <Text>Fermeture: {vendeur.horaireOuverture.heureFermeture}</Text>
        </>
      ) : (
        <Text>Horaire non défini</Text>
      )}

      <Text style={styles.sectionTitle}>Pièces jointes</Text>
      {piecesJointes.length > 0 ? (
        piecesJointes.map((pj, index) => (
          <View key={index} style={styles.pjRow}>
            <Text style={styles.pjName}>{pj.name || `Fichier ${index + 1}`}</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                const fileName = pj.url.replace("/uploads/", "");

                const url = `http://localhost:8082/api/uploadPj1/download/${fileName}`;
                if (Platform.OS === 'web') {
                  window.open(url, '_blank');
                } else {
                  showAlert(
                    'Téléchargement non supporté',
                    'Le téléchargement sur mobile nécessite une intégration supplémentaire.'
                  );
                }
              }}
            >
              <Text style={styles.downloadButtonText}>📥 Télécharger</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text>Aucune pièce jointe disponible.</Text>
      )}

      {vendeur.estValideParAdmin === true && (
        <View style={[styles.badge, styles.badgeValid]}>
          <Text style={styles.badgeText}>Validé ✅</Text>
        </View>
      )}

      {vendeur.estValideParAdmin === false && (
        <>
          <View style={[styles.badge, styles.badgeRefused]}>
            <Text style={styles.badgeText}>Refusé ❌</Text>
          </View>
          {vendeur.motifRejet && (
            <Text style={styles.motifText}>Motif du rejet : {vendeur.motifRejet}</Text>
          )}
        </>
      )}

      {(vendeur.estValideParAdmin === null || vendeur.estValideParAdmin === undefined) && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.accept]} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.refuse]} onPress={handleRefuse}>
            <Text style={styles.buttonText}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showRefuseModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Motif du refus</Text>
            <TextInput
              style={styles.input}
              placeholder="Saisissez le motif..."
              value={motif}
              onChangeText={setMotif}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.refuse]} onPress={refuseVendeur}>
                <Text style={styles.buttonText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999' }]}
                onPress={() => setShowRefuseModal(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  accept: {
    backgroundColor: '#4CAF50',
  },
  refuse: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 30,
  },
  badgeValid: {
    backgroundColor: '#4CAF50',
  },
  badgeRefused: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  motifText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#F44336',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pjRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pjName: {
    fontSize: 14,
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DetailVendeur;
