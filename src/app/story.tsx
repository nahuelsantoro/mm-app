import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const story = {
  id: 'bosque-01',
  title: 'La aventura del bosque',
  pages: [
    {
      id: 'page-1',
      illustration: '🌳',
      sentences: ['MORA Y MAILO VAN AL BOSQUE.', 'EL SOL BRILLA ENTRE LOS ÁRBOLES.'],
    },
    {
      id: 'page-2',
      illustration: '🐦',
      sentences: ['UN PÁJARO CANTA EN UNA RAMA.', 'MORA Y MAILO ESCUCHAN FELICES.'],
    },
    {
      id: 'page-3',
      illustration: '🍎',
      sentences: ['MAILO ENCUENTRA UNA MANZANA.', 'MORA LA COMPARTE CON SU AMIGO.'],
    },
    {
      id: 'page-4',
      illustration: '🏡',
      sentences: ['EL CIELO SE PINTA DE ROSA.', 'MORA Y MAILO VUELVEN A CASA.'],
    },
  ],
};

type StoryPage = (typeof story.pages)[number];

export default function StoryScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const [pageIndex, setPageIndex] = useState(0);
  const [uppercase, setUppercase] = useState(true);
  const [finished, setFinished] = useState(false);
  const page: StoryPage | undefined = story.pages[pageIndex];

  const displayText = (text: string) => uppercase ? text.toLocaleUpperCase('es') : text.toLocaleLowerCase('es');
  const goBack = () => {
    if (finished) setFinished(false);
    else if (pageIndex > 0) setPageIndex(pageIndex - 1);
    else router.back();
  };
  const goForward = () => {
    if (pageIndex < story.pages.length - 1) setPageIndex(pageIndex + 1);
    else setFinished(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>‹ Volver</Text>
          </Pressable>
          <Text style={styles.brand}>M&M</Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Cambiar entre mayúsculas y minúsculas"
            accessibilityState={{ checked: uppercase }}
            onPress={() => setUppercase((value) => !value)}
            style={styles.caseButton}>
            <Text style={styles.caseText}>{uppercase ? 'Aa' : 'AA'}</Text>
          </Pressable>
        </View>

        <View style={styles.storyHeading}>
          <Text style={styles.eyebrow}>UN CUENTO PARA LEER JUNTOS</Text>
          <Text style={styles.title}>{title || story.title}</Text>
        </View>

        <View style={styles.pageCard}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>{finished ? '🌟' : page?.illustration}</Text>
          </View>
          {finished ? (
            <View style={styles.sentences}>
              <Text style={styles.sentence}>¡TERMINASTE EL CUENTO!</Text>
              <Text style={styles.encouragement}>¡QUÉ BIEN LEÍSTE CON MORA Y MAILO!</Text>
            </View>
          ) : (
            <View style={styles.sentences}>
              {page?.sentences.map((sentence) => (
                <Text key={sentence} style={styles.sentence}>{displayText(sentence)}</Text>
              ))}
            </View>
          )}
          <View style={styles.pageFooter}>
            <Text style={styles.pageLabel}>{finished ? 'FIN' : `PÁGINA ${pageIndex + 1} DE ${story.pages.length}`}</Text>
            <View style={styles.dots} accessibilityLabel={`Página ${pageIndex + 1} de ${story.pages.length}`}>
              {story.pages.map((item, index) => (
                <View key={item.id} style={[styles.dot, index === pageIndex && !finished && styles.activeDot]} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          {!finished && pageIndex > 0 ? (
            <Pressable accessibilityRole="button" onPress={goBack} style={styles.previousButton}>
              <Text style={styles.previousText}>‹ Anterior</Text>
            </Pressable>
          ) : <View style={styles.controlSpacer} />}
          <Pressable
            accessibilityRole="button"
            onPress={finished ? () => { setFinished(false); setPageIndex(0); } : goForward}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
            <Text style={styles.nextText}>{finished ? 'Leer otra vez' : pageIndex === story.pages.length - 1 ? 'Terminar' : 'Siguiente'}</Text>
            {!finished && <Text style={styles.nextArrow}>→</Text>}
          </Pressable>
        </View>
        <Text style={styles.footer}>Leé a tu ritmo ✨</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: { flex: 1, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12, gap: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minWidth: 80, minHeight: 42, justifyContent: 'center' },
  backText: { color: '#7553A6', fontSize: 15, fontWeight: '800' },
  brand: { color: '#7553A6', fontSize: 21, fontWeight: '900' },
  caseButton: { backgroundColor: '#E9DFF6', borderRadius: 15, minWidth: 48, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  caseText: { color: '#594A6E', fontSize: 17, fontWeight: '900' },
  storyHeading: { alignItems: 'center', gap: 5 },
  eyebrow: { color: '#A294A9', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#41344F', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  pageCard: { flex: 1, maxHeight: 600, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, justifyContent: 'space-between', shadowColor: '#7553A6', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  illustration: { flex: 1, minHeight: 130, borderRadius: 22, backgroundColor: '#E8F3E4', alignItems: 'center', justifyContent: 'center' },
  illustrationEmoji: { fontSize: 88 },
  sentences: { flex: 1, justifyContent: 'center', gap: 15, paddingHorizontal: 4 },
  sentence: { color: '#41344F', fontSize: 24, lineHeight: 34, fontWeight: '800', textAlign: 'center' },
  encouragement: { color: '#7553A6', fontSize: 19, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  pageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  pageLabel: { color: '#A294A9', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E6DFEB' },
  activeDot: { width: 20, backgroundColor: '#7553A6' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  controlSpacer: { minWidth: 80 },
  previousButton: { minHeight: 54, minWidth: 80, justifyContent: 'center' },
  previousText: { color: '#7553A6', fontSize: 15, fontWeight: '800' },
  nextButton: { flex: 1, minHeight: 56, maxWidth: 260, alignSelf: 'center', borderRadius: 20, backgroundColor: '#F07861', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  nextArrow: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  footer: { color: '#B0A1AF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
