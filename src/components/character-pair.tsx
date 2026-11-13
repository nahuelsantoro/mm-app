import { StyleSheet, Text, View } from 'react-native';

const characters = [
  { name: 'Mora', emoji: '🐻', color: '#FFB9A7', tilt: '-5deg' as const },
  { name: 'Mailo', emoji: '🐰', color: '#A9DDF4', tilt: '5deg' as const },
];

export function CharacterPair() {
  return (
    <View style={styles.scene} accessibilityLabel="Mora, una osita, y Mailo, un conejito">
      <View style={styles.sun} />
      <View style={[styles.cloud, styles.cloudLeft]} />
      <View style={[styles.cloud, styles.cloudRight]} />
      <View style={styles.characters}>
        {characters.map((character) => (
          <View key={character.name} style={styles.character}>
            <View style={[styles.avatar, { backgroundColor: character.color, transform: [{ rotate: character.tilt }] }]}>
              <Text style={styles.emoji} accessibilityElementsHidden>{character.emoji}</Text>
            </View>
            <View style={styles.nameTag}>
              <Text style={styles.name}>{character.name}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.star}><Text style={styles.starText}>✦</Text></View>
      <View style={styles.butterfly}><Text style={styles.butterflyText}>✿</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: '100%',
    maxWidth: 370,
    aspectRatio: 1.32,
    borderRadius: 36,
    backgroundColor: '#FFF0D4',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sun: { position: 'absolute', width: 74, height: 74, borderRadius: 40, backgroundColor: '#FFD66B', top: 22, right: 30 },
  cloud: { position: 'absolute', width: 68, height: 24, borderRadius: 20, backgroundColor: '#FFFDF7' },
  cloudLeft: { top: 48, left: 24 },
  cloudRight: { bottom: 42, right: 18, width: 48 },
  characters: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, paddingTop: 10 },
  character: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 126,
    height: 142,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    shadowColor: '#885C43',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  emoji: { fontSize: 84 },
  nameTag: { backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 6, borderRadius: 15 },
  name: { color: '#594A5E', fontWeight: '800', fontSize: 15 },
  star: { position: 'absolute', top: 20, left: '48%' },
  starText: { color: '#F1A64A', fontSize: 24 },
  butterfly: { position: 'absolute', bottom: 27, left: 28 },
  butterflyText: { color: '#E989A3', fontSize: 25 },
});
