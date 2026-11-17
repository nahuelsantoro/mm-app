function getWords(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function scoreReading(expectedText: string, spokenText: string) {
  const expectedWords = getWords(expectedText);
  const spokenWords = getWords(spokenText);
  let previousRow = new Array(spokenWords.length + 1).fill(0) as number[];

  for (const expectedWord of expectedWords) {
    const currentRow = new Array(spokenWords.length + 1).fill(0) as number[];

    for (let index = 1; index <= spokenWords.length; index += 1) {
      currentRow[index] = expectedWord === spokenWords[index - 1]
        ? previousRow[index - 1] + 1
        : Math.max(previousRow[index], currentRow[index - 1]);
    }

    previousRow = currentRow;
  }

  const matchedWords = previousRow[spokenWords.length] ?? 0;

  return {
    matchedWords,
    totalWords: expectedWords.length,
    accuracy: expectedWords.length === 0 ? 0 : matchedWords / expectedWords.length,
  };
}

export function mergeSpeechTranscript(previous: string, next: string) {
  const priorWords = previous.trim().split(/\s+/).filter(Boolean);
  const nextWords = next.trim().split(/\s+/).filter(Boolean);

  if (priorWords.length === 0) return next.trim();
  if (nextWords.length === 0) return previous.trim();

  const normalize = (word: string) => getWords(word)[0] ?? '';
  const priorNormalized = priorWords.map(normalize);
  const nextNormalized = nextWords.map(normalize);

  if (priorNormalized.join(' ') === nextNormalized.join(' ')) return previous.trim();
  if (nextNormalized.join(' ').startsWith(`${priorNormalized.join(' ')} `)) return next.trim();

  const maxOverlap = Math.min(priorWords.length, nextWords.length);
  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const priorSuffix = priorNormalized.slice(-overlap).join(' ');
    const nextPrefix = nextNormalized.slice(0, overlap).join(' ');

    if (priorSuffix === nextPrefix) {
      return [...priorWords, ...nextWords.slice(overlap)].join(' ');
    }
  }

  return [...priorWords, ...nextWords].join(' ');
}
