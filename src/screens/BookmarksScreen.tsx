import React, { useCallback, useState } from 'react';
import {
  View, FlatList, StyleSheet, Text, ActivityIndicator,
  TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useHighlightStore, Highlight } from '../store/highlightStore';

const BookmarksScreen = ({ navigation }: any) => {
  const { highlights, loading, loadHighlights, removeHighlight } = useHighlightStore();

  useFocusEffect(
    useCallback(() => {
      loadHighlights();
    }, [])
  );

  const handleRemove = (id: string) => {
    Alert.alert('Hapus Highlight', 'Yakin ingin menghapus highlight ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => removeHighlight(id),
      },
    ]);
  };

  const renderHighlight = ({ item }: { item: Highlight }) => (
    <TouchableOpacity
      style={styles.highlightCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ArticleDetail', { slug: item.articleSlug })}
      onLongPress={() => handleRemove(item.id)}
    >
      <View style={styles.highlightBorder}>
        <Text style={styles.highlightText}>{item.text}</Text>
      </View>
      <Text style={styles.highlightSource} numberOfLines={1}>
        from "{item.articleTitle}"
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your library</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Highlights</Text>
        </View>
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#757575" />
        </View>
      ) : highlights.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="pencil-outline" size={48} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Belum ada highlight</Text>
          <Text style={styles.emptySubtitle}>
            Highlight teks di artikel untuk menyimpannya di sini
          </Text>
        </View>
      ) : (
        <FlatList
          data={highlights}
          keyExtractor={(item) => item.id}
          renderItem={renderHighlight}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#292929',
    fontFamily: 'Inter_700Bold',
  },

  // Tabs
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    maxHeight: 50,
  },
  tabBarContent: {
    paddingHorizontal: 20,
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
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Inter_400Regular',
  },
  activeTabText: {
    color: '#292929',
    fontWeight: '600',
  },

  // Content
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292929',
    marginTop: 16,
    fontFamily: 'Inter_700Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B3B3B7',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Highlight Card
  highlightCard: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  highlightBorder: {
    borderLeftWidth: 3,
    borderLeftColor: '#E8E8E8',
    paddingLeft: 16,
    paddingVertical: 4,
  },
  highlightText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#292929',
    fontFamily: 'Merriweather_400Regular',
  },
  highlightSource: {
    fontSize: 13,
    color: '#757575',
    marginTop: 12,
    paddingLeft: 19,
    fontFamily: 'Inter_400Regular',
  },
});

export default BookmarksScreen;
