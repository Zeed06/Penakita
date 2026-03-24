import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axiosClient from '../api/axiosClient';

const FollowListScreen = ({ route, navigation }: any) => {
  const { userId, type } = route.params; // type: 'followers' or 'following'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await axiosClient.get(`/users/${userId}/${type}`);
        setUsers(res.data.users);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
    navigation.setOptions({ title: type === 'followers' ? 'Followers' : 'Following' });
  }, [userId, type]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#000" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.userItem}
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
          >
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initial}>{item.name.charAt(0)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.name}>{item.name}</Text>
              {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No {type} yet</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  userItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  initial: { fontSize: 20, fontWeight: 'bold', color: '#757575' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#292929' },
  bio: { fontSize: 14, color: '#757575', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#757575', fontSize: 16 }
});

export default FollowListScreen;
