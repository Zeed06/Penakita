import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore } from '../store/authStore';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateProfile, loading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your gallery to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Allow cropping for avatars
      aspect: [1, 1], // Square aspect ratio
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: 'base64',
        });
        setAvatarUrl(`data:image/jpeg;base64,${base64}`);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to process image');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) return Alert.alert('Error', 'Name is required');
      await updateProfile({ name: name.trim(), bio: bio.trim(), avatarUrl: avatarUrl });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      const msg = e.friendlyMessage || 'Failed to update profile';
      Alert.alert('Error', msg);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{name.charAt(0) || '?'}</Text>
              </View>
            )}
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholder="Your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={bio} 
              onChangeText={setBio} 
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24 },
  avatarSection: { 
    alignItems: 'center', 
    marginBottom: 30,
    marginTop: 10,
  },
  avatarPreview: { 
    width: 100, 
    height: 100, 
    borderRadius: 50 
  },
  avatarPlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { 
    fontSize: 32, 
    fontFamily: 'Inter_700Bold', 
    color: '#757575' 
  },
  changePhotoText: { 
    marginTop: 10, 
    color: '#1A8917', 
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  form: { marginTop: 0 },
  inputGroup: { marginBottom: 24 },
  label: { 
    fontSize: 14, 
    fontFamily: 'Inter_700Bold', 
    color: '#292929', 
    marginBottom: 8 
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#F2F2F2',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#292929',
    paddingVertical: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1A8917',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { opacity: 0.7 },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontFamily: 'Inter_700Bold' 
  },
});

export default EditProfileScreen;
