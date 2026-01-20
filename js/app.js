let chosenCharacter = -1;
let availableCharacterList = [];
let characterList = [];
let flags = {};
let guessNo = 1;
let guessMax = 10;

const green = '#66e722'
const yellow = '#ffeb3b'
const red = '#ff3333'

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('guess');
    const resultsList = document.getElementById('search-results');

    // Load characters from the generated JSON file
    Promise.all([
        fetch('src/characters.json').then(response => response.json()),
        fetch('src/flags.json').then(response => response.json())
    ])
    .then(([characterData, flagData]) => {
        characterList = characterData;
        availableCharacterList = characterData;
        flags = flagData;
        console.log('Data loaded');
        startGame();
    })
    .catch(error => console.error('Error loading data:', error));

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        resultsList.innerHTML = ''; // Clear previous results

        if (query.length < 2) {
            resultsList.style.display = 'none';
            return;
        }

        // Filter characters that match the query
        const matches = characterList.filter(character =>
            character.name.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            matches.forEach(character => {
                const div = document.createElement('div');
                div.classList.add('result-item');
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = character.name;
                div.appendChild(nameSpan);

                const flagSpan = document.createElement('span');
                flagSpan.classList.add('flag');
                flagSpan.textContent = flags[character.nationality] || "";
                div.appendChild(flagSpan);

                // Add click event to select the character
                div.addEventListener('click', () => {
                    searchInput.value = character.name;
                    resultsList.style.display = 'none';
                    console.log(`User selected: ${character.name}`);
                    handleGuess(character);
                    searchInput.value = '';
                    if (guessNo <= guessMax) {
                        searchInput.placeholder = `GUESS ${guessNo} OF ${guessMax}`;
                    }
                });

                resultsList.appendChild(div);
            });
            resultsList.style.display = 'block';
        } else {
            resultsList.style.display = 'none';
        }
    });

    // Close the dropdown if the user clicks outside the search box
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
            resultsList.style.display = 'none';
        }
    });

    searchInput.placeholder = `GUESS ${guessNo} OF ${guessMax}`;

    // View All Characters Modal Logic
    const viewAllBtn = document.getElementById('view-all-btn');
    const modal = document.getElementById('all-characters-modal');
    const closeBtn = document.querySelector('.close-btn');
    const allCharactersList = document.getElementById('all-characters-list');

    viewAllBtn.addEventListener('click', () => {
        allCharactersList.innerHTML = ''; // Clear previous list
        
        // Update heading with character count
        const heading = document.getElementById('all-characters-heading');
        heading.textContent = `All Characters (${characterList.length})`;
        
        // Sort alphabetically for the list
        const sortedList = [...characterList].sort((a, b) => a.name.localeCompare(b.name));

        sortedList.forEach(character => {
            const item = document.createElement('div');
            item.classList.add('character-list-item');
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = character.name;
            
            const flagSpan = document.createElement('span');
            flagSpan.textContent = flags[character.nationality] || character.nationality;
            
            item.appendChild(nameSpan);
            item.appendChild(flagSpan);
            allCharactersList.appendChild(item);
        });

        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
})

function startGame() {
    console.log('Game started!');
    chosenCharacter = availableCharacterList[Math.random() * availableCharacterList.length | 0];
    console.log(`Chosen character: ${chosenCharacter.name}`);
}

function handleGuess(characterGuess) {
    const guessesContainer = document.getElementById('guesses-container');

    const guessDiv = document.createElement('div');
    guessDiv.classList.add('guess');

    const guessName = document.createElement('h1');
    guessName.textContent = characterGuess.name;
    guessDiv.appendChild(guessName);

    const cluesContainer = document.createElement('div');
    cluesContainer.id = 'clues-container';
    cluesContainer.appendChild(compareGender(characterGuess));
    cluesContainer.appendChild(compareNationality(characterGuess));
    cluesContainer.appendChild(compareStatus(characterGuess));
    cluesContainer.appendChild(compareFirstAppearance(characterGuess));
    cluesContainer.appendChild(compareRelevance(characterGuess));
    cluesContainer.appendChild(compareEpisodes(characterGuess));

    guessDiv.appendChild(cluesContainer);
    guessesContainer.prepend(guessDiv);
    
    // CHECK EXACT MATCH
    if (chosenCharacter.id === characterGuess.id) {
        alert('You won!');
    } else {
        incrementGuessCount();
    }
}

function compareGender(characterGuess) {
    const genderWrapper = document.createElement('div');
    genderWrapper.classList.add('clue-wrapper');
    const genderClue = document.createElement('div');
    genderClue.classList.add('clue');

    const genderP = document.createElement('p');
    genderP.textContent = characterGuess.gender;
    genderClue.appendChild(genderP);

    if (chosenCharacter.gender === characterGuess.gender) {
        genderClue.style.backgroundColor = green;
    } else {
        genderClue.style.backgroundColor = red;
    }
    genderWrapper.appendChild(genderClue);
    const genderLabel = document.createElement('span');
    genderLabel.classList.add('clue-label');
    genderLabel.textContent = 'GENDER';
    genderWrapper.appendChild(genderLabel);
    
    return genderWrapper;
}

function compareNationality(characterGuess) {
    const nationalityWrapper = document.createElement('div');
    nationalityWrapper.classList.add('clue-wrapper');
    const nationalityClue = document.createElement('div');
    nationalityClue.classList.add('clue');

    const nationalityP = document.createElement('p');
    const flag = flags[characterGuess.nationality];
    if (flag) {
        nationalityP.textContent = flag;
        nationalityP.classList.add('emoji');
    } else {
        nationalityP.textContent = characterGuess.nationality;
    }
    nationalityClue.appendChild(nationalityP);

    if (chosenCharacter.nationality === characterGuess.nationality) {
        nationalityClue.style.backgroundColor = green;
    } else {
        nationalityClue.style.backgroundColor = red;
    }
    nationalityWrapper.appendChild(nationalityClue);
    const nationalityLabel = document.createElement('span');
    nationalityLabel.classList.add('clue-label');
    nationalityLabel.textContent = 'NATIONALITY';
    nationalityWrapper.appendChild(nationalityLabel);
    
    return nationalityWrapper;
}

function compareStatus(characterGuess) {
    const statusWrapper = document.createElement('div');
    statusWrapper.classList.add('clue-wrapper');
    const statusClue = document.createElement('div');
    statusClue.classList.add('clue');

    const statusP = document.createElement('p');
    statusP.textContent = characterGuess.status;
    statusClue.appendChild(statusP);

    if (chosenCharacter.status === characterGuess.status) {
        statusClue.style.backgroundColor = green;
    } else if (chosenCharacter.status === 'UNKNOWN' && (characterGuess.status === 'Dead' || characterGuess.status === 'Alive')) {
        statusClue.style.backgroundColor = yellow;
    } else {
        statusClue.style.backgroundColor = red;
    }
    statusWrapper.appendChild(statusClue);
    const statusLabel = document.createElement('span');
    statusLabel.classList.add('clue-label');
    statusLabel.textContent = 'STATUS';
    statusWrapper.appendChild(statusLabel);
    
    return statusWrapper;
}

function compareFirstAppearance(characterGuess) {
    const firstAppearance = characterGuess.first_appearance
    const season = parseInt(firstAppearance.split('.')[0])
    const episode = parseInt(firstAppearance.split('.')[1])

    const chosenFirstAppearance = chosenCharacter.first_appearance;
    const chosenSeason = parseInt(chosenFirstAppearance.split('.')[0]);
    const chosenEpisode = parseInt(chosenFirstAppearance.split('.')[1]);

    const firstAppearanceWrapper = document.createElement('div');
    firstAppearanceWrapper.classList.add('clue-wrapper');
    const firstAppearanceClue = document.createElement('div');
    firstAppearanceClue.classList.add('clue');

    const firstAppearanceP = document.createElement('p');
    let firstAppearanceArrow = '';
    if (chosenSeason > season || (chosenSeason === season && chosenEpisode > episode)) {
        firstAppearanceArrow = ' ↑';
    } else if (chosenSeason < season || (chosenSeason === season && chosenEpisode < episode)) {
        firstAppearanceArrow = ' ↓';
    }
    firstAppearanceP.textContent = `S${season}E${episode}${firstAppearanceArrow}`;
    firstAppearanceClue.appendChild(firstAppearanceP);

    if (chosenCharacter.first_appearance === firstAppearance) {
        firstAppearanceClue.style.backgroundColor = green;
    } else if (chosenSeason === season) {
        firstAppearanceClue.style.backgroundColor = yellow;
    } else {
        firstAppearanceClue.style.backgroundColor = red;
    }
    firstAppearanceWrapper.appendChild(firstAppearanceClue);
    const firstAppearanceLabel = document.createElement('span');
    firstAppearanceLabel.classList.add('clue-label');
    firstAppearanceLabel.textContent = 'FIRST SEEN';
    firstAppearanceWrapper.appendChild(firstAppearanceLabel);
    
    return firstAppearanceWrapper;
}

function compareRelevance(characterGuess) {
    const relevanceWrapper = document.createElement('div');
    relevanceWrapper.classList.add('clue-wrapper');
    const relevanceClue = document.createElement('div');
    relevanceClue.classList.add('clue');

    const relevanceP = document.createElement('p');

    const guessedBroad = characterGuess.broad_archetypes;
    const chosenBroad = chosenCharacter.broad_archetypes;
    const guessedSpecific = characterGuess.specific_groups;
    const chosenSpecific = chosenCharacter.specific_groups;

    const specificOverlap = guessedSpecific.filter(val => chosenSpecific.includes(val));
    const broadOverlap = guessedBroad.filter(val => chosenBroad.includes(val));

    if (specificOverlap.length > 0) {
        relevanceClue.style.backgroundColor = green;
        //relevanceP.textContent = specificOverlap.join(', ');
    } else if (broadOverlap.length > 0) {
        relevanceClue.style.backgroundColor = yellow;
        //relevanceP.textContent = broadOverlap.join(', ');
    } else {
        relevanceClue.style.backgroundColor = red;
        //relevanceP.textContent = guessedBroad.join(', ');
    }

    relevanceClue.appendChild(relevanceP);
    relevanceWrapper.appendChild(relevanceClue);
    const relevanceLabel = document.createElement('span');
    relevanceLabel.classList.add('clue-label');
    relevanceLabel.textContent = 'RELATION';
    relevanceWrapper.appendChild(relevanceLabel);
    
    return relevanceWrapper;
}

function compareEpisodes(characterGuess) {
    const episodesWrapper = document.createElement('div');
    episodesWrapper.classList.add('clue-wrapper');
    const episodesClue = document.createElement('div');
    episodesClue.classList.add('clue');

    const episodesP = document.createElement('p');
    let episodesArrow = '';
    if (chosenCharacter.total_episodes > characterGuess.total_episodes) {
        episodesArrow = ' ↑';
    } else if (chosenCharacter.total_episodes < characterGuess.total_episodes) {
        episodesArrow = ' ↓';
    }
    episodesP.textContent = `${characterGuess.total_episodes}${episodesArrow}`;
    episodesClue.appendChild(episodesP);

    const difference = chosenCharacter.total_episodes - characterGuess.total_episodes
    if (difference === 0) {
        episodesClue.style.backgroundColor = green;
    } else if (difference <= 10 && difference >= -10) {
        episodesClue.style.backgroundColor = yellow;
    } else {
        episodesClue.style.backgroundColor = red;
    }
    episodesWrapper.appendChild(episodesClue);
    const episodesLabel = document.createElement('span');
    episodesLabel.classList.add('clue-label');
    episodesLabel.textContent = 'EPISODES';
    episodesWrapper.appendChild(episodesLabel);
    
    return episodesWrapper;
}

function incrementGuessCount() {
    guessNo++;
    if (guessNo > guessMax) {
        alert(`Game Over! The character was ${chosenCharacter.name}`);
        location.reload();
    }
}