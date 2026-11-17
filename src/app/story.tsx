import { router, useFocusEffect, useIsFocused, useLocalSearchParams } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stories } from '@/constants/stories';
import {
  awardReadingStar,
  getProfileStarCount,
  getStoryProgress,
  saveStoryProgress,
} from '@/services/reading-storage';
import { mergeSpeechTranscript, scoreReading } from '@/utils/reading-score';

const starAccuracyThreshold = 0.65;

export default function StoryScreen() {
  const { id, profileId } = useLocalSearchParams<{
    id?: string;
    profileId?: string;
  }>();
  const story = stories.find((item) => item.id === id) ?? stories[0];
  const [pageIndex, setPageIndex] = useState(0);
  const [uppercase, setUppercase] = useState(true);
  const [finished, setFinished] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isStartingRecognition, setIsStartingRecognition] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [readingFeedback, setReadingFeedback] = useState('');
  const [readingWasSuccessful, setReadingWasSuccessful] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const finalTranscriptParts = useRef<string[]>([]);
  const startAttempt = useRef(0);
  const shouldEvaluateReading = useRef(false);
  const isRecognizingRef = useRef(false);
  const isFocused = useIsFocused();
  const page = story.pages[pageIndex];
  const profileIdNumber = Number(profileId);
  const hasProfileId = Number.isInteger(profileIdNumber) && profileIdNumber > 0;
  const storyId = story.id;

  useEffect(() => {
    let isActive = true;

    if (!hasProfileId) return;

    Promise.all([
      getStoryProgress(profileIdNumber, storyId),
      getProfileStarCount(profileIdNumber),
    ])
      .then(([progress, totalStars]) => {
        if (!isActive) return;
        setStarCount(totalStars);
        if (isActive && progress && !progress.completed) {
          setPageIndex(Math.min(progress.pageIndex, story.pages.length - 1));
        }
      })
      .catch(() => {
        Alert.alert('No pudimos recuperar el progreso', 'El cuento se abrirá desde el comienzo.');
      })
      .finally(() => {
        if (isActive) setIsProgressLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [hasProfileId, profileIdNumber, story, storyId]);

  async function evaluateReading(spokenText: string) {
    const expectedText = page.sentences.join(' ');
    const result = scoreReading(expectedText, spokenText);

    setTranscript(spokenText);
    setReadingWasSuccessful(result.accuracy >= starAccuracyThreshold);

    if (result.accuracy < starAccuracyThreshold) {
      setReadingFeedback(
        `¡Buen intento! Reconocimos ${result.matchedWords} de ${result.totalWords} palabras. Leé otra vez con calma.`
      );
      return;
    }

    if (hasProfileId) {
      try {
        const reward = await awardReadingStar(profileIdNumber, storyId, pageIndex);
        setStarCount(reward.totalStars);
        setReadingFeedback(
          reward.awarded
            ? '¡Lo lograste! Ganaste una estrella por esta página.'
            : '¡Muy bien leído! Ya habías ganado la estrella de esta página.'
        );
      } catch {
        setReadingFeedback('¡Leíste muy bien! No pudimos guardar tu estrella esta vez.');
      }
      return;
    }

    setStarCount((current) => current + 1);
    setReadingFeedback('¡Lo lograste! Ganaste una estrella.');
  }

  useSpeechRecognitionEvent('start', () => {
    if (!isFocused) return;
    isRecognizingRef.current = true;
    setIsRecognizing(true);
    setIsStartingRecognition(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (!isFocused || !shouldEvaluateReading.current) return;

    const recognizedText = event.results[0]?.transcript.trim();
    if (!recognizedText) return;

    if (event.isFinal) {
      finalTranscriptParts.current = [
        mergeSpeechTranscript(finalTranscriptParts.current.join(' '), recognizedText),
      ];
    }

    const finalText = finalTranscriptParts.current.join(' ');
    setTranscript(event.isFinal ? finalText : mergeSpeechTranscript(finalText, recognizedText));
  });

  useSpeechRecognitionEvent('end', () => {
    isRecognizingRef.current = false;
    setIsRecognizing(false);
    setIsStartingRecognition(false);
    if (!isFocused) {
      shouldEvaluateReading.current = false;
      return;
    }
    if (!shouldEvaluateReading.current) return;

    shouldEvaluateReading.current = false;
    const finalText = finalTranscriptParts.current.join(' ').trim();
    if (finalText) {
      void evaluateReading(finalText);
    } else {
      setReadingFeedback('No escuchamos palabras esta vez. Probá de nuevo cuando estés listo.');
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    isRecognizingRef.current = false;
    setIsRecognizing(false);
    setIsStartingRecognition(false);
    shouldEvaluateReading.current = false;

    if (!isFocused || event.error === 'aborted') return;
    setReadingFeedback(
      event.error === 'not-allowed'
        ? 'Hace falta permitir el micrófono para leer en voz alta.'
        : event.error === 'language-not-supported' || event.error === 'service-not-allowed'
          ? 'El reconocimiento de voz en español no está disponible en este dispositivo.'
          : event.error === 'no-speech' || event.error === 'speech-timeout'
            ? 'No escuchamos palabras esta vez. Probá de nuevo cuando estés listo.'
            : 'Tuvimos un problema al escuchar. Probá una vez más.'
    );
  });

  useFocusEffect(useCallback(() => () => {
    startAttempt.current += 1;
    shouldEvaluateReading.current = false;
    finalTranscriptParts.current = [];
    if (isRecognizingRef.current) ExpoSpeechRecognitionModule.abort();
    isRecognizingRef.current = false;
    setIsRecognizing(false);
    setIsStartingRecognition(false);
  }, []));

  async function toggleVoiceReading() {
    if (isRecognizing) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    if (isStartingRecognition) return;

    const currentAttempt = startAttempt.current + 1;
    startAttempt.current = currentAttempt;
    setIsStartingRecognition(true);
    setTranscript('');
    setReadingFeedback('');
    setReadingWasSuccessful(false);

    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setReadingFeedback('El reconocimiento de voz no está disponible en este dispositivo.');
        return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (currentAttempt !== startAttempt.current || !permission.granted) {
        if (currentAttempt === startAttempt.current) {
          setReadingFeedback('Hace falta permitir el micrófono para leer en voz alta.');
        }
        return;
      }

      finalTranscriptParts.current = [];
      shouldEvaluateReading.current = true;
      isRecognizingRef.current = true;
      ExpoSpeechRecognitionModule.start({
        lang: 'es-AR',
        interimResults: true,
        continuous: true,
        contextualStrings: page.sentences.flatMap((sentence) => sentence.split(/\s+/)),
      });
    } catch {
      isRecognizingRef.current = false;
      if (currentAttempt === startAttempt.current) {
        setReadingFeedback('No pudimos iniciar el micrófono. Probá otra vez.');
      }
    } finally {
      if (currentAttempt === startAttempt.current) {
        setIsStartingRecognition(false);
      }
    }
  }

  function cancelVoiceReading() {
    startAttempt.current += 1;
    shouldEvaluateReading.current = false;
    finalTranscriptParts.current = [];
    if (isRecognizingRef.current) ExpoSpeechRecognitionModule.abort();
    isRecognizingRef.current = false;
    setIsRecognizing(false);
    setIsStartingRecognition(false);
  }

  function persistProgress(nextPageIndex: number, isCompleted = false) {
    if (!hasProfileId) return;

    void saveStoryProgress(profileIdNumber, storyId, nextPageIndex, isCompleted).catch(() => {
      Alert.alert('No pudimos guardar el progreso', 'Revisá tu espacio disponible e intentá otra vez.');
    });
  }

  const displayText = (text: string) => uppercase ? text.toLocaleUpperCase('es') : text.toLocaleLowerCase('es');
  const goBack = () => {
    cancelVoiceReading();
    if (finished) setFinished(false);
    else if (pageIndex > 0) {
      const previousPage = pageIndex - 1;
      setPageIndex(previousPage);
      persistProgress(previousPage);
    }
    else router.back();
  };
  const goForward = () => {
    if (hasProfileId && isProgressLoading) return;
    cancelVoiceReading();
    if (pageIndex < story.pages.length - 1) {
      const nextPage = pageIndex + 1;
      setPageIndex(nextPage);
      persistProgress(nextPage);
    } else {
      setFinished(true);
      persistProgress(pageIndex, true);
    }
  };
  const restartStory = () => {
    cancelVoiceReading();
    setFinished(false);
    setPageIndex(0);
    persistProgress(0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.title}>{story.title}</Text>
        </View>

        <View style={styles.pageCard}>
          <View style={[styles.illustration, { backgroundColor: story.sceneColor }]}>
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
              {story.pages.map((_, index) => (
                <View key={`${story.id}-${index}`} style={[styles.dot, index === pageIndex && !finished && styles.activeDot]} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.voicePanel}>
          <View style={styles.voiceHeading}>
            <Text style={styles.voiceTitle}>¡Leé en voz alta!</Text>
            <Text style={styles.voiceHint}>
              {hasProfileId && isProgressLoading
                ? 'Cargando tu lectura...'
                : 'Cuando termines las frases, tocá «Terminé».'}
            </Text>
          </View>
          <View style={styles.voiceActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isRecognizing ? 'Terminar lectura en voz alta' : 'Leer en voz alta'}
              accessibilityState={{ disabled: isStartingRecognition || (hasProfileId && isProgressLoading) }}
              disabled={isStartingRecognition || (hasProfileId && isProgressLoading)}
              onPress={toggleVoiceReading}
              style={({ pressed }) => [
                styles.voiceButton,
                isRecognizing && styles.voiceButtonActive,
                pressed && styles.pressed,
                isStartingRecognition && styles.voiceButtonDisabled,
              ]}>
              <Text style={styles.voiceButtonEmoji}>{isRecognizing ? '⏹️' : '🎙️'}</Text>
              <Text style={styles.voiceButtonText}>
                {isStartingRecognition
                  ? 'Preparando...'
                  : isRecognizing
                    ? 'Terminé'
                    : 'Leer conmigo'}
              </Text>
            </Pressable>
            <View style={styles.starPill}>
              <Text style={styles.starPillEmoji}>⭐</Text>
              <Text style={styles.starPillCount}>{starCount}</Text>
            </View>
          </View>
          {transcript ? (
            <Text style={styles.transcript} accessibilityLiveRegion="polite">
              Te escuchamos: «{transcript}»
            </Text>
          ) : null}
          {readingFeedback ? (
            <View style={[styles.rewardMessage, readingWasSuccessful ? styles.rewardSuccess : styles.rewardTryAgain]}>
              <Text style={styles.rewardMessageText} accessibilityLiveRegion="polite">
                {readingFeedback}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.controls}>
          {!finished && pageIndex > 0 ? (
            <Pressable accessibilityRole="button" onPress={goBack} style={styles.previousButton}>
              <Text style={styles.previousText}>‹ Anterior</Text>
            </Pressable>
          ) : <View style={styles.controlSpacer} />}
          <Pressable
            accessibilityRole="button"
            disabled={hasProfileId && isProgressLoading}
            onPress={finished ? restartStory : goForward}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
            <Text style={styles.nextText}>{finished ? 'Leer otra vez' : pageIndex === story.pages.length - 1 ? 'Terminar' : 'Siguiente'}</Text>
            {!finished && <Text style={styles.nextArrow}>→</Text>}
          </Pressable>
        </View>
        <Text style={styles.footer}>Leé a tu ritmo ✨</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9EF' },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12, gap: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minWidth: 80, minHeight: 42, justifyContent: 'center' },
  backText: { color: '#7553A6', fontSize: 15, fontWeight: '800' },
  brand: { color: '#7553A6', fontSize: 21, fontWeight: '900' },
  caseButton: { backgroundColor: '#E9DFF6', borderRadius: 15, minWidth: 48, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  caseText: { color: '#594A6E', fontSize: 17, fontWeight: '900' },
  storyHeading: { alignItems: 'center', gap: 5 },
  eyebrow: { color: '#A294A9', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#41344F', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  pageCard: { flex: 1, minHeight: 300, maxHeight: 600, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, justifyContent: 'space-between', shadowColor: '#7553A6', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
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
  voicePanel: { gap: 8 },
  voiceHeading: { alignItems: 'center', gap: 2 },
  voiceTitle: { color: '#594A6E', fontSize: 16, fontWeight: '900' },
  voiceHint: { color: '#887B91', fontSize: 11, textAlign: 'center' },
  voiceActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voiceButton: { flex: 1, minHeight: 48, borderRadius: 18, backgroundColor: '#7553A6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  voiceButtonActive: { backgroundColor: '#D65F55' },
  voiceButtonDisabled: { opacity: 0.7 },
  voiceButtonEmoji: { fontSize: 19 },
  voiceButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  starPill: { minWidth: 72, minHeight: 48, borderRadius: 18, backgroundColor: '#FFF0C2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 13 },
  starPillEmoji: { fontSize: 18 },
  starPillCount: { color: '#8B5A18', fontSize: 16, fontWeight: '900' },
  transcript: { color: '#786D7C', fontSize: 12, lineHeight: 17, textAlign: 'center' },
  rewardMessage: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  rewardSuccess: { backgroundColor: '#E5F5DE' },
  rewardTryAgain: { backgroundColor: '#FFF2D7' },
  rewardMessageText: { color: '#594A6E', fontSize: 13, fontWeight: '800', lineHeight: 18, textAlign: 'center' },
});
