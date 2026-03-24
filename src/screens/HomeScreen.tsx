import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Text, RefreshControl, Image } from 'react-native';
import { useArticleStore } from '../store/articleStore';
import ArticleCard from '../components/ArticleCard';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }: any) => {
  const { articles, loading, fetchArticles } = useArticleStore();
  const [activeTab, setActiveTab] = useState<'For you' | 'Featured'>('For you');

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      fetchArticles();
    });
    return focusListener;
  }, [navigation]);

  const renderItem = ({ item }: any) => (
    <ArticleCard 
      article={item} 
      onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
      onPressAuthor={(userId) => navigation.navigate('UserProfile', { userId })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Medium</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#292929" />
        </TouchableOpacity>
      </View>

      {/* Top Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'For you' && styles.activeTab]} 
          onPress={() => setActiveTab('For you')}
        >
          <Text style={[styles.tabText, activeTab === 'For you' && styles.activeTabText]}>For you</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Featured' && styles.activeTab]} 
          onPress={() => setActiveTab('Featured')}
        >
          <Text style={[styles.tabText, activeTab === 'Featured' && styles.activeTabText]}>Featured</Text>
        </TouchableOpacity>
      </View>

      {/* Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={fetchArticles}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No articles found</Text> : null
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateArticle')}
      >
        <Ionicons name="create-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 30,
    fontFamily: 'Merriweather_700Bold',
    color: '#000',
  },
  iconButton: {
    padding: 5,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#292929',
  },
  tabText: {
    fontSize: 15,
    color: '#757575',
    fontFamily: 'Inter_400Regular',
  },
  activeTabText: {
    color: '#292929',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#757575',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#1A8917',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export default HomeScreen;
