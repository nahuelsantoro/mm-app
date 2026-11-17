
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type Companion = 'Mora' | 'Mailo';

type ChildProfile = {
  id: number;
  name: string;
  companion: Companion;
};

export default function ProfileSelectionScreen() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [childName, setChildName] = useState('');
  const [companion, setCompanion] = useState<Companion>('Mora');

  function createProfile() {
    const name = childName.trim();

    if (!name) {
      Alert.alert('¡Un momento!', 'Escribí el nombre del niño o niña.');
      return;
    }

    const newProfile: ChildProfile = {
      id: Date.now(),
      name,
      companion,
    };

    setProfiles((current) => [...current, newProfile]);
    setChildName('');
    setCompanion('Mora');
    setShowForm(false);
  }

function selectProfile(profile: ChildProfile) {
  router.push({
    pathname: '/library',
    params: {
      name: profile.name,
      companion: profile.companion,
    },
  });
}

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Volver</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.emoji}>🌟</Text>
          <Text style={styles.title}>¿Quién quiere leer?</Text>
          <Text style={styles.description}>
            Elegí tu perfil y preparate para vivir una aventura.
          </Text>
        </View>

        {profiles.map((profile) => (
          <Pressable
            key={profile.id}
            onPress={() => selectProfile(profile)}
            style={styles.profileCard}
          >
            <Text style={styles.profileEmoji}>
              {profile.companion === 'Mora' ? '🐶' : '🐕'}
            </Text>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileCompanion}>
                Acompañado por {profile.companion}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        {showForm ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>¡Creemos tu perfil!</Text>

            <Text style={styles.label}>¿Cómo te llamás?</Text>
            <TextInput
              value={childName}
              onChangeText={setChildName}
              placeholder="Escribí tu nombre"
              placeholderTextColor="#A99EAD"
              style={styles.input}
              maxLength={20}
              autoFocus
            />

            <Text style={styles.label}>¿Quién te va a acompañar?</Text>

            <View style={styles.companions}>
              <Pressable
                onPress={() => setCompanion('Mora')}
                style={[
                  styles.companionOption,
                  companion === 'Mora' && styles.companionSelected,
                ]}
              >
                <Text style={styles.companionEmoji}>🐶</Text>
                <Text style={styles.companionName}>Mora</Text>
              </Pressable>

              <Pressable
                onPress={() => setCompanion('Mailo')}
                style={[
                  styles.companionOption,
                  companion === 'Mailo' && styles.companionSelected,
                ]}
              >
                <Text style={styles.companionEmoji}>🐕</Text>
                <Text style={styles.companionName}>Mailo</Text>
              </Pressable>
            </View>

            <Pressable style={styles.createButton} onPress={createProfile}>
              <Text style={styles.createButtonText}>Crear perfil</Text>
            </Pressable>

            <Pressable onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowForm(true)}
            style={styles.addButton}
          >
            <Text style={styles.addIcon}>＋</Text>
            <Text style={styles.addText}>Agregar perfil</Text>
          </Pressable>
        )}

        <Text style={styles.footer}>
          Cada lector tiene su propia aventura ✨
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 12,
    gap: 18,
  },
  back: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  backText: { color: '#7553A6', fontSize: 16, fontWeight: '700' },
  header: { alignItems: 'center', gap: 12, marginVertical: 20 },
  emoji: { fontSize: 58 },
  title: {
    color: '#41344F',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: '#786D7C',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: '#E9DFF6',
  },
  profileEmoji: { fontSize: 38 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { color: '#41344F', fontSize: 18, fontWeight: '800' },
  profileCompanion: { color: '#887B91', fontSize: 13 },
  arrow: { color: '#7553A6', fontSize: 28 },
  addButton: {
    minHeight: 76,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#D8C9E9',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  addIcon: { color: '#7553A6', fontSize: 27, fontWeight: '700' },
  addText: { color: '#7553A6', fontSize: 17, fontWeight: '800' },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  formTitle: {
    color: '#41344F',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  label: { color: '#594A6E', fontSize: 14, fontWeight: '800' },
  input: {
    backgroundColor: '#FFF9EF',
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    color: '#41344F',
    borderWidth: 1,
    borderColor: '#E9DFF6',
  },
  companions: { flexDirection: 'row', gap: 12 },
  companionOption: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF9EF',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 5,
  },
  companionSelected: { borderColor: '#7553A6', backgroundColor: '#F2EAFB' },
  companionEmoji: { fontSize: 36 },
  companionName: { color: '#594A6E', fontSize: 15, fontWeight: '800' },
  createButton: {
    backgroundColor: '#F07861',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginTop: 5,
  },
  createButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  cancelText: {
    textAlign: 'center',
    color: '#887B91',
    fontWeight: '700',
    padding: 8,
  },
  footer: {
    color: '#B0A1AF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
});
