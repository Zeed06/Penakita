import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import ArticleCard from '../components/ArticleCard';

const SearchScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const [artRes, userRes] = await Promise.all([
          axiosClient.get(`/articles/search?q=${text}`),
          axiosClient.get(`/users/all/search?q=${text}`)
        ]);
        setArticles(artRes.data.articles);
        setUsers(userRes.data.users);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      setArticles([]);
      setUsers([]);
    }
  };

  const renderUserItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
      ) : (
        <View style={styles.userAvatarPlaceholder}>
          <Text style={styles.userInitial}>{item.name.charAt(0)}</Text>
        </View>
      )}
      <View>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#757575" />
          <TextInput
            placeholder="Search Medium"
            style={styles.input}
            value={search}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#000" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item: any) => item.id || item.slug}
          renderItem={({ item }) => (
            <ArticleCard 
              article={item} 
              onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
              onPressAuthor={(userId) => navigation.navigate('UserProfile', { userId })}
            />
          )}
          ListHeaderComponent={users.length > 0 ? (
            <View style={styles.usersSection}>
              <Text style={styles.sectionTitle}>People</Text>
              <FlatList
                data={users}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item: any) => item.id}
                renderItem={renderUserItem}
                contentContainerStyle={{ paddingBottom: 10 }}
              />
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Stories</Text>
            </View>
          ) : null}
          contentContainerStyle={styles.list}
          ListEmptyComponent={search.length > 2 ? <Text style={styles.emptyText}>No results found</Text> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchHeader: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#292929' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  usersSection: { marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#292929' },
  userItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  userAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  userInitial: { fontSize: 18, fontWeight: 'bold', color: '#757575' },
  userName: { fontSize: 14, fontWeight: 'bold', color: '#292929' },
  userUsername: { fontSize: 12, color: '#757575' },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 15 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#757575' }
});

export default SearchScreen;
