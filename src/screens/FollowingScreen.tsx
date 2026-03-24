import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axiosClient from '../api/axiosClient';
import ArticleCard from '../components/ArticleCard';
import { useArticleStore } from '../store/articleStore';

const FollowingScreen = ({ navigation }: any) => {
  const [articles, setArticles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFollowingArticles = async () => {
    try {
      // Production API doesn't seem to have a following feed in the documented contract.
      // We try the old path or fallback to generic posts for now.
      const res = await axiosClient.get('/api/posts');
      setArticles(res.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFollowingArticles();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Following</Text>
      </View>
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No stories found in the feed.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#292929' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20 },
  empty: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: '#757575', fontSize: 16 },
});

export default FollowingScreen;
