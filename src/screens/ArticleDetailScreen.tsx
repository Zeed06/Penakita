import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, Image, TextInput, FlatList,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useArticleStore } from '../store/articleStore';
import { useCommentStore } from '../store/commentStore';
import { useHighlightStore } from '../store/highlightStore';
import BodyModelRenderer from '../components/BodyModelRenderer';

const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const { fetchArticleById, article, loading, likeArticle } = useArticleStore();
  const { comments, loading: commentsLoading, submitting, fetchComments, addComment } = useCommentStore();
  const { addHighlight } = useHighlightStore();

  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [highlightModal, setHighlightModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    fetchArticleById(slug);
  }, [slug]);

  useEffect(() => {
    if (article?.id) {
      fetchComments(article.id);
    }
  }, [article?.id]);

  const handleLike = async () => {
    if (!article) return;
    try {
      await likeArticle(article.id);
    } catch (e: any) {
      Alert.alert('Error', 'Tidak bisa like artikel');
    }
  };

  const handleSubmitComment = async () => {
    if (!article || !commentText.trim()) return;
    try {
      await addComment(article.id, commentText.trim());
      setCommentText('');
    } catch (e: any) {
      Alert.alert('Error', e.friendlyMessage || 'Gagal mengirim komentar');
    }
  };

  const handleTextSelect = () => {
    // Simulated highlight: user taps "Highlight" button, enters text manually
    // React Native doesn't support native text selection events easily
    setHighlightModal(true);
  };

  const handleSaveHighlight = async () => {
    if (!selectedText.trim() || !article) return;
    try {
      await addHighlight({
        text: selectedText.trim(),
        articleSlug: article.slug || slug,
        articleTitle: article.title,
      });
      setSelectedText('');
      setHighlightModal(false);
      Alert.alert('✅ Tersimpan', 'Highlight berhasil disimpan ke Library');
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan highlight');
    }
  };

  if (loading || !article) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const commentCount = comments.length || article.commentCount || 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Author Row */}
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => navigation.navigate('UserProfile', { userId: article.author?.id })}
        >
          {article.author?.avatarUrl ? (
            <Image source={{ uri: article.author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{article.author?.name?.charAt(0) || '?'}</Text>
            </View>
          )}
          <View>
            <Text style={styles.authorName}>
              {article.author?.fullName || article.author?.name || 'Anonymous'}
            </Text>
            <Text style={styles.metaText}>
              {new Date(article.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Divider with stats */}
        <View style={styles.statsBar}>
          <View style={styles.statsLeft}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#757575" />
              <Text style={styles.statText}>{article.likeCount || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#757575" />
              <Text style={styles.statText}>{commentCount}</Text>
            </View>
          </View>
          <View style={styles.statsRight}>
            <TouchableOpacity onPress={handleTextSelect} style={styles.statAction}>
              <Ionicons name="pencil" size={18} color="#757575" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cover Image */}
        {article.coverImage && (
          <Image source={{ uri: article.coverImage }} style={styles.coverImage} resizeMode="cover" />
        )}

        {/* Content */}
        {article.bodyModel?.paragraphs ? (
          <BodyModelRenderer paragraphs={article.bodyModel.paragraphs} />
        ) : (
          <Text style={styles.content} selectable>{article.content}</Text>
        )}

        {/* Bottom Actions */}
        <View style={styles.divider} />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={article.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={article.isLiked ? '#E74C3C' : '#757575'}
            />
            <Text style={[styles.actionLabel, article.isLiked && { color: '#E74C3C', fontWeight: '700' }]}>
              {article.likeCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
            <Ionicons name="chatbubble-outline" size={22} color="#757575" />
            <Text style={styles.actionLabel}>{commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleTextSelect}>
            <Ionicons name="pencil-outline" size={22} color="#757575" />
            <Text style={styles.actionLabel}>Highlight</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {showComments && (
          <View style={styles.commentSection}>
            <Text style={styles.commentSectionTitle}>Komentar ({commentCount})</Text>

            {/* Comment Input */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Tulis komentar..."
                placeholderTextColor="#B3B3B7"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {commentsLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color="#757575" />
            ) : comments.length === 0 ? (
              <Text style={styles.noComments}>Belum ada komentar. Jadilah yang pertama!</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    {comment.author?.avatarUrl ? (
                      <Image source={{ uri: comment.author.avatarUrl }} style={styles.commentAvatar} />
                    ) : (
                      <View style={styles.commentAvatarPlaceholder}>
                        <Text style={styles.commentAvatarInitial}>
                          {comment.author?.fullName?.charAt(0) || '?'}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.commentAuthor}>
                        {comment.author?.fullName || comment.author?.username || 'Anonymous'}
                      </Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{comment.content?.text || ''}</Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Highlight Modal */}
      <Modal visible={highlightModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✨ Simpan Highlight</Text>
            <Text style={styles.modalSubtitle}>
              Copy dan paste teks dari artikel yang ingin kamu highlight:
            </Text>
            <TextInput
              style={styles.highlightInput}
              placeholder="Paste teks di sini..."
              placeholderTextColor="#B3B3B7"
              value={selectedText}
              onChangeText={setSelectedText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setHighlightModal(false); setSelectedText(''); }}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, !selectedText.trim() && { opacity: 0.5 }]}
                onPress={handleSaveHighlight}
                disabled={!selectedText.trim()}
              >
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    color: '#292929',
    marginTop: 20,
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F2F2F2', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  avatarInitial: { fontSize: 16, color: '#757575', fontWeight: '700' },
  authorName: { fontSize: 15, color: '#292929', fontFamily: 'Inter_700Bold' },
  metaText: { fontSize: 13, color: '#757575', fontFamily: 'Inter_400Regular' },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F2F2F2',
    marginBottom: 20,
  },
  statsLeft: { flexDirection: 'row', alignItems: 'center' },
  statsRight: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 13, color: '#757575', marginLeft: 4, fontFamily: 'Inter_400Regular' },
  statAction: { padding: 4, marginLeft: 12 },

  coverImage: { width: '100%', height: 220, borderRadius: 8, marginBottom: 24 },
  content: {
    fontSize: 18, lineHeight: 30, color: '#292929',
    fontFamily: 'Merriweather_400Regular', textAlign: 'left',
  },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 24 },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 28,
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
    fontFamily: 'Inter_400Regular',
  },

  // Comments
  commentSection: { marginTop: 8 },
  commentSectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#292929',
    marginBottom: 16, fontFamily: 'Inter_700Bold',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: '#292929',
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 8,
  },
  sendBtn: {
    backgroundColor: '#1A8917',
    borderRadius: 20,
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { opacity: 0.4 },
  noComments: {
    textAlign: 'center', color: '#B3B3B7', fontSize: 14,
    marginTop: 20, fontFamily: 'Inter_400Regular',
  },
  commentItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 10 },
  commentAvatarPlaceholder: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F2F2F2', justifyContent: 'center',
    alignItems: 'center', marginRight: 10,
  },
  commentAvatarInitial: { fontSize: 12, color: '#757575', fontWeight: '700' },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: '#292929' },
  commentDate: { fontSize: 12, color: '#B3B3B7' },
  commentText: {
    fontSize: 15, lineHeight: 22, color: '#292929',
    fontFamily: 'Inter_400Regular', marginLeft: 38,
  },

  // Highlight Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20, fontWeight: '700', color: '#292929',
    marginBottom: 6, fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    fontSize: 14, color: '#757575', marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  highlightInput: {
    borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#292929', minHeight: 100,
    fontFamily: 'Inter_400Regular', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 20, marginRight: 12 },
  modalCancelText: { fontSize: 16, color: '#757575', fontFamily: 'Inter_400Regular' },
  modalSave: {
    backgroundColor: '#1A8917', paddingVertical: 12,
    paddingHorizontal: 24, borderRadius: 24,
  },
  modalSaveText: { fontSize: 16, color: '#fff', fontWeight: '700', fontFamily: 'Inter_700Bold' },
});

export default ArticleDetailScreen;
