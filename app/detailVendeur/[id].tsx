import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

const showAlert = (title: string, message: string): void => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};


const DetailVendeur = () => {
  const { id } = useLocalSearchParams(); // Get the ID from route
  const [vendeur, setVendeur] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVendeur = async () => {
      try {
        const response = await axios.get(`http://192.168.1.8:8082/api/vendeurs/${id}`);
        setVendeur(response.data);
      } catch (error) {
        console.error('Error fetching vendeur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendeur();
    }
  }, [id]);

  const handleAccept = () => {debugger
    console.log("Pressed Accept");debugger
    if (Platform.OS === 'web') {debugger
      const confirmed = window.confirm('Voulez-vous vraiment accepter ce vendeur ?');
      console.log('Confirmation result:', confirmed);
      if (confirmed) {debugger
        acceptVendeur();
      }
    } else {
      Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment accepter ce vendeur ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Accepter',
            onPress: acceptVendeur,
            style: 'default',
          },
        ],
        { cancelable: true }
      );
    }
  };
  

  const acceptVendeur = async () => {debugger
    try {
      await axios.get(`http://192.168.1.8:8082/api/vendeurs/${id}/accept`);
      showAlert('Succès', 'Le vendeur a été accepté.');
      router.back();
    } catch (err) {
      showAlert('Erreur', 'Impossible d’accepter le vendeur.');
    }
  };

  const handleRefuse = async () => {
    try {
      await axios.post(`http://192.168.1.8:8082/api/vendeurs/${id}/refuse`);
      showAlert('Succès', 'Le vendeur a été refusé.');
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
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Vendeur</Text>
      <Text>Nom: {vendeur.nom}</Text>
      <Text>Email: {vendeur.email}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.accept]} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accepter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.refuse]} onPress={handleRefuse}>
          <Text style={styles.buttonText}>Refuser</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
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
});

export default DetailVendeur;
