import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  article: any;
  onPress: () => void;
  onPressAuthor?: (userId: string) => void;
}

const ArticleCard: React.FC<Props> = ({ article, onPress, onPressAuthor }) => {
  const handleAuthorPress = (e: any) => {
    e.stopPropagation();
    onPressAuthor && onPressAuthor(article.author?.id);
  };

  const likeCount = article.likeCount || 0;
  const commentCount = article.commentCount || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Author Row */}
      <TouchableOpacity
        style={styles.authorRow}
        onPress={handleAuthorPress}
      >
        {article.author?.avatarUrl ? (
          <Image source={{ uri: article.author.avatarUrl }} style={styles.authorAvatar} />
        ) : (
          <View style={styles.authorAvatarPlaceholder}>
            <Text style={styles.authorInitial}>{article.author?.name?.charAt(0) || '?'}</Text>
          </View>
        )}
        <Text style={styles.authorName}>
          {article.author?.fullName || article.author?.name || 'Anonymous'}
        </Text>
      </TouchableOpacity>

      {/* Content Row */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
          <Text style={styles.snippet} numberOfLines={2}>{article.content}</Text>
        </View>
        {article.coverImage && (
          <Image source={{ uri: article.coverImage }} style={styles.image} />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          <Ionicons name="sparkles" size={16} color="#FFC017" style={{ marginRight: 4 }} />
          <Text style={styles.footerText}>Viewed</Text>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#757575" />
            <Text style={styles.footerText}> {likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#757575" />
            <Text style={styles.footerText}> {commentCount}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#fff',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  authorAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    fontSize: 10,
    color: '#757575',
    fontWeight: '700',
  },
  authorName: {
    fontSize: 13,
    color: '#292929',
    fontWeight: '500',
    fontFamily: 'Inter_400Regular',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#292929',
    lineHeight: 22,
    marginBottom: 4,
    fontFamily: 'Merriweather_700Bold',
  },
  snippet: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  image: {
    width: 100,
    height: 64,
    borderRadius: 4,
    backgroundColor: '#F2F2F2',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#757575',
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 16,
  }
});

export default ArticleCard;
