import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Text, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useArticleStore } from '../store/articleStore';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const CreateArticleScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const { createArticle, loading } = useArticleStore();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your gallery to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Don't crop
      quality: 0.6,
    });

    if (!result.canceled) {
      try {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: 'base64',
        });
        setImage(`data:image/jpeg;base64,${base64}`);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to process image');
      }
    }
  };

  const handleCreate = async () => {
    try {
      if (!title || !content) return Alert.alert('Error', 'Title and content are required');
      await createArticle({ title, content, coverImage: image });
      Alert.alert('Success', 'Story published!');
      navigation.goBack();
    } catch (e: any) {
      const msg = e.friendlyMessage || 'Failed to publish story. Please check your inputs.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.publishBtn, (!title || !content) && styles.disabledBtn]} 
            onPress={handleCreate}
            disabled={loading || !title || !content}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishText}>Publish</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageLabel}>+ Add cover image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          multiline
          placeholderTextColor="#B3B3B7"
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="Tell your story..."
          multiline
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#B3B3B7"
          scrollEnabled={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#292929',
    fontFamily: 'Inter_400Regular',
  },
  publishBtn: {
    backgroundColor: '#1A8917',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  publishText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F2',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  imageLabel: {
    color: '#757575',
    fontFamily: 'Inter_400Regular',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  titleInput: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#292929',
    fontFamily: 'Inter_700Bold',
    marginBottom: 10,
  },
  contentInput: { 
    fontSize: 20, 
    lineHeight: 30,
    color: '#292929',
    fontFamily: 'Merriweather_400Regular',
    textAlignVertical: 'top',
    minHeight: 300,
  },
});

export default CreateArticleScreen;
