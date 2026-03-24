import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState('');
  const { login, googleLogin, loading } = useAuthStore();

  const handleLogin = async () => {
    setGeneralError('');
    setErrorFields([]);

    try {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');

      if (missing.length > 0) {
        setErrorFields(missing);
        setGeneralError('Please fill all fields');
        return;
      }

      await login({ email, password });
    } catch (e: any) {
      const msg = e.friendlyMessage || 'Login failed. Please check your credentials.';
      setGeneralError(msg);
      Alert.alert('Login Error', msg);
      
      const fields = [];
      if (msg.toLowerCase().includes('email')) fields.push('email');
      if (msg.toLowerCase().includes('password')) fields.push('password');
      setErrorFields(fields);
    }
  };

  const isError = (field: string) => errorFields.includes(field);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back.</Text>

        {generalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{generalError}</Text>
            {(generalError.toLowerCase().includes('verifikasi') || generalError.toLowerCase().includes('verify')) && (
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    await useAuthStore.getState().resendVerification(email);
                    Alert.alert('Success', 'Verification email sent!');
                  } catch (e) {
                    Alert.alert('Error', 'Failed to resend email');
                  }
                }}
                style={{ marginTop: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#1A8917', fontWeight: 'bold', textDecorationLine: 'underline' }}>
                  Resend verification email
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isError('email') && styles.errorLabel]}>Email address</Text>
          <TextInput 
            style={[styles.input, isError('email') && styles.errorInput]} 
            placeholder="you@email.com" 
            value={email} 
            onChangeText={(text) => {
              setEmail(text);
              if (isError('email')) setErrorFields(prev => prev.filter(f => f !== 'email'));
            }} 
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#B3B3B7"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isError('password') && styles.errorLabel]}>Password</Text>
          <TextInput 
            style={[styles.input, isError('password') && styles.errorInput]} 
            placeholder="Enter your password" 
            value={password} 
            onChangeText={(text) => {
              setPassword(text);
              if (isError('password')) setErrorFields(prev => prev.filter(f => f !== 'password'));
            }} 
            secureTextEntry 
            placeholderTextColor="#B3B3B7"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign-In */}
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.disabledButton]}
          onPress={async () => {
            try {
              await googleLogin();
            } catch (e: any) {
              const msg = e.friendlyMessage || e.message || 'Google Sign-In failed';
              Alert.alert('Google Sign-In Error', msg);
            }
          }}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#292929" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>
            No account? <Text style={styles.linkText}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    fontFamily: 'Inter_700Bold', 
    marginBottom: 30, 
    color: '#292929',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#292929',
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  errorLabel: {
    color: '#f44336',
  },
  input: { 
    borderBottomWidth: 1, 
    borderColor: '#F2F2F2', 
    paddingVertical: 10, 
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#292929',
  },
  errorInput: {
    borderColor: '#f44336',
  },
  button: { 
    backgroundColor: '#000', 
    padding: 16, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  footerText: { 
    textAlign: 'center', 
    fontSize: 14, 
    color: '#757575',
    fontFamily: 'Inter_400Regular',
  },
  linkText: {
    color: '#1A8917',
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F2F2F2',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#B3B3B7',
    fontFamily: 'Inter_400Regular',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    padding: 14,
    marginBottom: 20,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#292929',
    fontFamily: 'Inter_400Regular',
  },
});

export default LoginScreen;
