import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterPair } from '@/components/character-pair';

export default function WelcomeScreen() {
  const { height } = useWindowDimensions();
  const compact = height < 740;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, compact && styles.compactContent]} bounces={false}>
        <View style={styles.brand}>
          <View style={styles.logoMark}><Text style={styles.logoText}>M&M</Text></View>
          <Text style={styles.brandCaption}>MORA & MAILO</Text>
        </View>

        <CharacterPair />

        <View style={styles.copy}>
          <Text style={styles.title}>Aprender a leer...{'\n'}<Text style={styles.titleAccent}>¡es una aventura!</Text></Text>
          <Text style={styles.subtitle}>Pequeñas historias, grandes aventuras</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Comenzar"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Comenzar</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
        <Text style={styles.footer}>Una aventura para compartir ✨</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 18, gap: 18 },
  compactContent: { paddingTop: 4, paddingBottom: 8, gap: 10 },
  brand: { alignItems: 'center', gap: 3 },
  logoMark: { backgroundColor: '#7553A6', borderRadius: 18, paddingHorizontal: 17, paddingVertical: 5, transform: [{ rotate: '-3deg' }] },
  logoText: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  brandCaption: { color: '#8B7798', fontSize: 10, fontWeight: '800', letterSpacing: 2.4 },
  copy: { alignItems: 'center', gap: 9 },
  title: { color: '#41344F', fontSize: 30, lineHeight: 37, textAlign: 'center', fontWeight: '900', letterSpacing: -0.5 },
  titleAccent: { color: '#F07861' },
  subtitle: { color: '#786D7C', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  button: { width: '100%', maxWidth: 370, minHeight: 58, borderRadius: 22, backgroundColor: '#F07861', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#B84838', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  buttonText: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  buttonArrow: { color: '#FFFFFF', fontSize: 23, fontWeight: '700', marginTop: -2 },
  footer: { color: '#B0A1AF', fontSize: 12, fontWeight: '600' },
});
