
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StoryScreen() {
  const { title, id } = useLocalSearchParams<{
    title: string;
    id: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Volver a mi biblioteca</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.emoji}>📖</Text>
          <Text style={styles.title}>{title || 'Mi cuento'}</Text>
          <Text style={styles.description}>
            ¡Esta aventura está por comenzar!
          </Text>
          <Text style={styles.number}>
            Cuento número {id || '1'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: { flex: 1, padding: 24 },
  back: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  backText: { color: '#7553A6', fontSize: 15, fontWeight: '700' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emoji: { fontSize: 75 },
  title: {
    color: '#41344F',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: '#786D7C',
    fontSize: 16,
    textAlign: 'center',
  },
  number: { color: '#A99EAD', fontSize: 13, marginTop: 12 },
});
