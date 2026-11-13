import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSelectionScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver a bienvenida" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹  Volver</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.emoji}>🌟</Text>
          <Text style={styles.title}>¿Quién quiere leer?</Text>
          <Text style={styles.description}>Muy pronto podrás crear tu perfil y empezar una nueva aventura.</Text>
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📚</Text>
            <Text style={styles.cardTitle}>¡Tu rincón de lectura te espera!</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 16 },
  backText: { color: '#7553A6', fontSize: 16, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 64 },
  title: { color: '#41344F', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  description: { color: '#786D7C', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 330 },
  card: { width: '100%', maxWidth: 360, minHeight: 150, borderRadius: 28, backgroundColor: '#E9DFF6', alignItems: 'center', justifyContent: 'center', padding: 22, gap: 8, marginTop: 12 },
  cardEmoji: { fontSize: 42 },
  cardTitle: { color: '#594A6E', fontSize: 17, fontWeight: '800', textAlign: 'center' },
});
