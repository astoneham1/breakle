let chosenCharacter = -1;
let availableCharacterList = [];
let characterList = [];
let guessNo = 1;
let guessMax = 5;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('guess');
    const resultsList = document.getElementById('search-results');

    // Load characters from the generated JSON file
    fetch('src/characters.json')
        .then(response => response.json())
        .then(data => {
            characterList = data;
            availableCharacterList = data;
            console.log('Characters loaded:', characterList);
            startGame();
        })
        .catch(error => console.error('Error loading characters:', error));

    const flags = {
        "USA": "🇺🇸",
        "PRI": "🇵🇷",
        "ITA": "🇮🇹"
    };

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
})

function startGame() {
    console.log('Game started!');
    chosenCharacter = availableCharacterList[Math.random() * availableCharacterList.length | 0];
    console.log(`Chosen character: ${chosenCharacter.name}`);
}

function handleGuess(characterGuess) {
    const guessesContainer = document.getElementById('guesses-container');
    
    const green = '#66e722'
    const yellow = '#ffeb3b'
    const red = '#ff3333'
    
    // Create a new guess element
    const guessDiv = document.createElement('div');
    guessDiv.classList.add('guess');
    
    const guessName = document.createElement('h1');
    guessName.textContent = characterGuess.name;
    guessDiv.appendChild(guessName);
    
    const cluesContainer = document.createElement('div');
    cluesContainer.id = 'clues-container';
    
    // GENDER
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
    cluesContainer.appendChild(genderClue);
    
    // NATIONALITY
    const nationalityClue = document.createElement('div');
    nationalityClue.classList.add('clue');
    
    const nationalityP = document.createElement('p');
    nationalityP.textContent = characterGuess.nationality;
    nationalityClue.appendChild(nationalityP);
    
    if (chosenCharacter.nationality === characterGuess.nationality) {
        nationalityClue.style.backgroundColor = green;
    } else {
        nationalityClue.style.backgroundColor = red;
    }
    cluesContainer.appendChild(nationalityClue);
    
    // FIRST APPEARANCE
    const firstAppearance = characterGuess.first_appearance
    const season = firstAppearance.split('.')[0]
    const episode = firstAppearance.split('.')[1]
    
    const firstAppearanceClue = document.createElement('div');
    firstAppearanceClue.classList.add('clue');
    
    const firstAppearanceP = document.createElement('p');
    firstAppearanceP.textContent = `S${season}E${episode}`;
    firstAppearanceClue.appendChild(firstAppearanceP);
    
    if (chosenCharacter.first_appearance === firstAppearance) {
        firstAppearanceClue.style.backgroundColor = green;
    } else if (chosenCharacter.first_appearance.split('.')[0] === season) {
        firstAppearanceClue.style.backgroundColor = yellow;
    } else {
        firstAppearanceClue.style.backgroundColor = red;
    }
    cluesContainer.appendChild(firstAppearanceClue);

    // EPISODES
    const episodesClue = document.createElement('div');
    episodesClue.classList.add('clue');
    
    const episodesP = document.createElement('p');
    episodesP.textContent = characterGuess.total_episodes;
    episodesClue.appendChild(episodesP);
    
    const difference = chosenCharacter.total_episodes - characterGuess.total_episodes
    if (difference === 0) {
        episodesClue.style.backgroundColor = green;
    } else if (difference <= 10 && difference >= -10) {
        episodesClue.style.backgroundColor = yellow; 
    } else {
        episodesClue.style.backgroundColor = red;
    }
    cluesContainer.appendChild(episodesClue);

    // RELEVANCE
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
        relevanceP.textContent = specificOverlap.join(', ');
    } else if (broadOverlap.length > 0) {
        relevanceClue.style.backgroundColor = yellow;
        relevanceP.textContent = broadOverlap.join(', ');
    } else {
        relevanceClue.style.backgroundColor = red;
        relevanceP.textContent = guessedBroad.join(', ');
    }
    
    relevanceClue.appendChild(relevanceP);
    cluesContainer.appendChild(relevanceClue);

    guessDiv.appendChild(cluesContainer);
    guessesContainer.prepend(guessDiv);
    
    // CHECK EXACT MATCH
    if (chosenCharacter.id === characterGuess.id) {
        alert('You won!');
    } else {
        incrementGuessCount();
    }
}

function incrementGuessCount() {
    guessNo++;
    if (guessNo > guessMax) {
        alert(`Game Over! The character was ${chosenCharacter.name}`);
        location.reload();
    }
}