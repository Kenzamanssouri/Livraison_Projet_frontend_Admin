import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://192.168.1.8:8082/api/notification'; // Corrigé le nom du endpoint
  const router = useRouter(); // Use router for navigation

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(API_URL);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() =>  router.push(`/detailVendeur/${item.idObject}`)}
    >
      <View style={styles.row}>
        <Text style={styles.cellTitle}>{item.title}</Text>
        <Text style={styles.cellMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cellTitle: {
    flex: 1,
    fontWeight: '600',
  },
  cellMessage: {
    flex: 2,
    color: '#666',
  },
});

export default NotificationsScreen;
