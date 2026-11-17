
import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const stories = [
  {
    id: 1,
    title: 'La aventura del bosque',
    description: 'Un paseo lleno de sorpresas.',
    emoji: '🌳',
    color: '#DDF1D8',
    level: 'Principiante',
  },
  {
    id: 2,
    title: 'El tesoro escondido',
    description: 'Una búsqueda muy especial.',
    emoji: '🗺️',
    color: '#FCE6C8',
    level: 'Principiante',
  },
  {
    id: 3,
    title: 'Un amigo de las estrellas',
    description: 'Una historia que viene del cielo.',
    emoji: '🚀',
    color: '#E9DFF6',
    level: 'Principiante',
  },
  {
    id: 4,
    title: 'El misterio del jardín',
    description: 'Pequeños detectives en acción.',
    emoji: '🌻',
    color: '#F9DFE2',
    level: 'Principiante',
  },
];

export default function LibraryScreen() {
  const { name, companion } = useLocalSearchParams<{
    name: string;
    companion: string;
  }>();

  const companionEmoji = companion === 'Mailo' ? '🐕' : '🐶';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>M&M</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Perfiles</Text>
          </Pressable>
        </View>

        <View style={styles.welcome}>
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>¡Hola, {name || 'aventurero'}!</Text>
            <Text style={styles.subtitle}>
              ¿Qué historia vamos a descubrir hoy?
            </Text>
          </View>
          <View style={styles.companion}>
            <Text style={styles.companionEmoji}>{companionEmoji}</Text>
            <Text style={styles.companionName}>{companion || 'Mora'}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mi biblioteca 📚</Text>
          <Text style={styles.sectionDescription}>
            Elegí un cuento y comencemos la aventura.
          </Text>
        </View>

        <View style={styles.stories}>
          {stories.map((story) => (
            <Pressable
              key={story.id}
              onPress={() =>
                router.push({
                  pathname: '/story',
                  params: { id: story.id.toString(), title: story.title },
                })
              }
              style={({ pressed }) => [
                styles.storyCard,
                { backgroundColor: story.color },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.storyIllustration}>
                <Text style={styles.storyEmoji}>{story.emoji}</Text>
              </View>

              <View style={styles.storyInfo}>
                <Text style={styles.storyLevel}>{story.level}</Text>
                <Text style={styles.storyTitle}>{story.title}</Text>
                <Text style={styles.storyDescription}>
                  {story.description}
                </Text>
              </View>

              <Text style={styles.storyArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerEmoji}>✨</Text>
          <Text style={styles.footerTitle}>Cada página es una aventura</Text>
          <Text style={styles.footerText}>
            Leé, imaginá y descubrí un mundo nuevo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: { padding: 22, paddingBottom: 35, gap: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { color: '#7553A6', fontSize: 25, fontWeight: '900' },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  backText: { color: '#7553A6', fontSize: 14, fontWeight: '800' },
  welcome: {
    backgroundColor: '#E9DFF6',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  welcomeText: { flex: 1, gap: 7 },
  greeting: { color: '#41344F', fontSize: 23, fontWeight: '900' },
  subtitle: { color: '#786D7C', fontSize: 14, lineHeight: 21 },
  companion: { alignItems: 'center', gap: 3 },
  companionEmoji: { fontSize: 42 },
  companionName: { color: '#594A6E', fontSize: 12, fontWeight: '800' },
  sectionHeader: { gap: 6 },
  sectionTitle: { color: '#41344F', fontSize: 23, fontWeight: '900' },
  sectionDescription: { color: '#887B91', fontSize: 14 },
  stories: { gap: 13 },
  storyCard: {
    minHeight: 112,
    borderRadius: 22,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  storyIllustration: {
    width: 76,
    height: 76,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyEmoji: { fontSize: 39 },
  storyInfo: { flex: 1, gap: 4 },
  storyLevel: {
    color: '#887B91',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  storyTitle: { color: '#41344F', fontSize: 15, fontWeight: '900' },
  storyDescription: { color: '#786D7C', fontSize: 12 },
  storyArrow: { color: '#7553A6', fontSize: 27, fontWeight: '700' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  footerCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    gap: 7,
  },
  footerEmoji: { fontSize: 30 },
  footerTitle: { color: '#594A6E', fontSize: 16, fontWeight: '900' },
  footerText: { color: '#887B91', fontSize: 13, textAlign: 'center' },
});
