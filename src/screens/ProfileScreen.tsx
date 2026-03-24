import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useArticleStore } from '../store/articleStore';
import ArticleCard from '../components/ArticleCard';
import axiosClient from '../api/axiosClient';

const ProfileScreen = ({ navigation, route }: any) => {
  const { user: currentUser, logout } = useAuthStore();
  const { articles, fetchArticles } = useArticleStore();
  const [refreshing, setRefreshing] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const targetUserId = route.params?.userId;
  const isOwnProfile = !targetUserId || targetUserId === currentUser?.id;

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        // Own profile uses settings endpoint
        const res = await axiosClient.get('/api/settings/profile');
        setProfileUser(res.data.data || res.data);
      } else {
        // For other users, production API doesn't have a clear endpoint in contract.
        // We'll try the old one or show limited info if we have it.
        // For now, we use the old path and catch errors.
        try {
          const res = await axiosClient.get(`/api/users/${targetUserId}`);
          setProfileUser(res.data.data || res.data.user || res.data);
        } catch (e) {
          Alert.alert('Info', 'Full profile for other users is not supported by this API version.');
        }
      }

      await fetchArticles();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [targetUserId, isOwnProfile, currentUser, fetchArticles]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  }, [fetchProfileData]);

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: logout }
      ]
    );
  };

  const userArticles = articles.filter(a => a.author?.id === profileUser?.id);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{profileUser?.fullName || profileUser?.name}</Text>
            <Text style={styles.username}>@{profileUser?.username}</Text>
          </View>
          {profileUser?.avatarUrl ? (
            <Image source={{ uri: profileUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{(profileUser?.fullName || profileUser?.name || '?').charAt(0)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.bio}>{profileUser?.bio || (isOwnProfile ? "Manage your profile in settings." : "")}</Text>

        {/* Following/Followers - Production API Contract doesn't mention these endpoints yet */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{followersCount} <Text style={{ color: '#757575' }}>Followers</Text></Text>
          <View style={styles.dot} />
          <Text style={styles.statsText}>{followingCount} <Text style={{ color: '#757575' }}>Following</Text></Text>
        </View>

        <View style={styles.actionRow}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Sign out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.followBtn, isFollowing && styles.followingBtn]} 
              disabled={true} // Disabled because no endpoint in contract
            >
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.articlesSection}>
        <Text style={styles.sectionTitle}>Stories</Text>
        {userArticles.length > 0 ? (
          userArticles.map(art => (
            <ArticleCard 
              key={art.id || art.slug} 
              article={art} 
              onPress={() => navigation.navigate('ArticleDetail', { slug: art.slug })} 
              onPressAuthor={isOwnProfile ? undefined : (userId) => navigation.navigate('UserProfile', { userId })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{isOwnProfile ? "You haven't written any stories yet." : "This user hasn't written any stories yet."}</Text>
          </View>
        )}
      </View>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { padding: 24, paddingTop: 40 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  infoContainer: { flex: 1, marginRight: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#292929', marginBottom: 4 },
  username: { fontSize: 16, color: '#757575' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 32, color: '#757575', fontWeight: 'bold' },
  bio: { fontSize: 15, color: '#292929', lineHeight: 22, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statsText: { fontSize: 14, fontWeight: 'bold', color: '#292929' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#757575', marginHorizontal: 12 },
  actionRow: { flexDirection: 'row', gap: 12 },
  editBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#292929' },
  editBtnText: { fontSize: 14, color: '#292929' },
  logoutBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#cc0000' },
  logoutBtnText: { fontSize: 14, color: '#cc0000' },
  followBtn: { backgroundColor: '#1A8917', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20 },
  followBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  followingBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#1A8917' },
  followingBtnText: { color: '#1A8917' },
  divider: { height: 1, backgroundColor: '#F2F2F2' },
  articlesSection: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#292929', marginBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#757575', textAlign: 'center' },
});

export default ProfileScreen;
