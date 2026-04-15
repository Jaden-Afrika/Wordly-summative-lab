const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const definitionEl = document.querySelector('.definition-placeholder');
const exampleEl = document.querySelector('.example-placeholder');
const synonymsEl = document.querySelector('.synonyms-placeholder');
const audioContainer = document.querySelector('.audio-placeholder');

function fetchDictionaryData(word) {
  const url = `${API_BASE_URL}/${encodeURIComponent(word.trim())}`;
  return fetch(url).then((response) => {
    if (!response.ok) {
      return response.json().then((errorData) => {
        const message = errorData?.title || 'Unable to fetch word data.';
        throw new Error(message);
      });
    }
    return response.json();
  });
}

function parseDictionaryData(data) {
  const entry = Array.isArray(data) ? data[0] : data;
  const meaning = entry?.meanings?.[0] || {};
  const definitionItem = meaning.definitions?.[0] || {};
  const phonetic = entry?.phonetics?.find((p) => p.audio) || entry?.phonetics?.[0] || {};

  return {
    word: entry.word || '',
    partOfSpeech: meaning.partOfSpeech || '',
    definition: definitionItem.definition || 'Definition not available.',
    example: definitionItem.example || 'Example sentence not available.',
    synonyms: definitionItem.synonyms?.length ? definitionItem.synonyms : meaning.synonyms || [],
    audioUrl: phonetic.audio || '',
    phoneticText: phonetic.text || entry.phonetic || '',
  };
}

function updateSearchResults(result) {
  definitionEl.textContent = result.definition;
  exampleEl.textContent = result.example;

  synonymsEl.textContent = result.synonyms.length
    ? result.synonyms.join(', ')
    : 'No synonyms found.';

  audioContainer.innerHTML = '';

  if (result.audioUrl) {
    const audioLabel = document.createElement('p');
    audioLabel.textContent = result.phoneticText
      ? `Pronunciation: ${result.phoneticText}`
      : 'Pronunciation:';
    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.src = result.audioUrl;
    audioContainer.appendChild(audioLabel);
    audioContainer.appendChild(audioPlayer);
  } else {
    audioContainer.textContent = 'Audio playback not available for this word.';
  }
}

function showError(message) {
  definitionEl.textContent = message;
  exampleEl.textContent = '';
  synonymsEl.textContent = '';
  audioContainer.textContent = '';
}

function handleSearch(event) {
  event.preventDefault();
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    showError('Please enter a word to search.');
    return;
  }

  fetchDictionaryData(searchTerm)
    .then(parseDictionaryData)
    .then(updateSearchResults)
    .catch((error) => {
      showError(error.message || 'The word could not be found.');
    });
}

if (searchForm) {
  searchForm.addEventListener('submit', handleSearch);
}
