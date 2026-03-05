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

    searchInput.addEventListener('keydown', function(e) {
        const items = resultsList.querySelectorAll('.result-item');
        let activeIndex = -1;

        items.forEach((item, index) => {
            if (item.classList.contains('active')) {
                activeIndex = index;
            }
        });

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIndex < items.length - 1) {
                if (activeIndex >= 0) items[activeIndex].classList.remove('active');
                items[activeIndex + 1].classList.add('active');
                items[activeIndex + 1].scrollIntoView({ block: 'nearest' });
            } else if (activeIndex === -1 && items.length > 0) {
                items[0].classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIndex > 0) {
                items[activeIndex].classList.remove('active');
                items[activeIndex - 1].classList.add('active');
                items[activeIndex - 1].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0) {
                e.preventDefault();
                items[activeIndex].click();
            }
        }
    });

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
                const flagEmoji = flags[character.nationality] || "";
                flagSpan.textContent = flagEmoji;
                if (flagEmoji) {
                    twemoji.parse(flagSpan);
                }
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

    const playAgainBtn = document.getElementById('play-again-btn');
    playAgainBtn.addEventListener('click', () => {
        resetGame();
    });

    // View All Characters Modal Logic
    const viewAllBtn = document.getElementById('view-all-btn');
    const viewAllBtnEnd = document.getElementById('view-all-btn-end');
    const modal = document.getElementById('all-characters-modal');
    const closeBtn = document.querySelector('.close-btn');
    const allCharactersList = document.getElementById('all-characters-list');

    const openModal = () => {
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
            flagSpan.classList.add('flag');
            flagSpan.textContent = flags[character.nationality] || character.nationality;
            if (flags[character.nationality]) {
                twemoji.parse(flagSpan);
            }
            
            item.appendChild(nameSpan);
            item.appendChild(flagSpan);
            allCharactersList.appendChild(item);
        });

        modal.style.display = 'block';
    };

    viewAllBtn.addEventListener('click', openModal);
    viewAllBtnEnd.addEventListener('click', openModal);

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
    // chosenCharacter = availableCharacterList[0];
    chosenCharacter = availableCharacterList[Math.random() * availableCharacterList.length | 0];
    console.log(`Chosen character: ${chosenCharacter.name}`);
}

function handleGuess(characterGuess) {
    const dots = document.querySelectorAll('.clue-dot');
    const guessesContainer = document.getElementById('guesses-container');

    const guessDiv = document.createElement('div');
    guessDiv.classList.add('guess');

    if (characterGuess.image_url) {
        const guessImage = document.createElement('img');
        guessImage.src = characterGuess.image_url;
        guessImage.classList.add('guess-image');
        guessDiv.appendChild(guessImage);
    }

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
        // Hide the final guess card to avoid redundancy with the summary
        guessDiv.style.display = 'none';
        gameOver(true);
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
        const dot = document.querySelectorAll('.clue-dot')[0];
        dot.classList.add('correct');
        dot.innerHTML = `<p>${characterGuess.gender}</p>`;
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
        twemoji.parse(nationalityP);
    } else {
        nationalityP.textContent = characterGuess.nationality;
    }
    nationalityClue.appendChild(nationalityP);

    if (chosenCharacter.nationality === characterGuess.nationality) {
        nationalityClue.style.backgroundColor = green;
        const dot = document.querySelectorAll('.clue-dot')[1];
        dot.classList.add('correct');
        const flag = flags[characterGuess.nationality];
        if (flag) {
            dot.innerHTML = `<p>${flag}</p>`;
            twemoji.parse(dot);
        } else {
            dot.innerHTML = `<p>${characterGuess.nationality}</p>`;
        }
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
        const dot = document.querySelectorAll('.clue-dot')[2];
        dot.classList.add('correct');
        const statusAbbreviation = characterGuess.status === 'Alive' ? 'A' : (characterGuess.status === 'Deceased' ? 'D' : characterGuess.status);
        dot.innerHTML = `<p>${statusAbbreviation}</p>`;
    } else if (chosenCharacter.status === 'UNKNOWN' && (characterGuess.status === 'Deceased' || characterGuess.status === 'Alive')) {
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
        const dot = document.querySelectorAll('.clue-dot')[3];
        dot.classList.add('correct');
        dot.innerHTML = `<p>S${season}E${episode}</p>`;
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
        const dot = document.querySelectorAll('.clue-dot')[4];
        dot.classList.add('correct');
        if (specificOverlap.length > 1) {
            relevanceP.textContent = `x${specificOverlap.length}`;
            dot.innerHTML = `<p>x${specificOverlap.length}</p>`;
        } else {
            relevanceP.textContent = specificOverlap[0];
            dot.innerHTML = `<p>${specificOverlap[0]}</p>`;
        }
    } else if (broadOverlap.length > 0) {
        relevanceClue.style.backgroundColor = yellow;
        relevanceP.textContent = '';
    } else {
        relevanceClue.style.backgroundColor = red;
        relevanceP.textContent = '';
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
        const dot = document.querySelectorAll('.clue-dot')[5];
        dot.classList.add('correct');
        dot.innerHTML = `<p>${characterGuess.total_episodes}</p>`;
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
        gameOver(false);
    }
}

function gameOver(win) {
    const resultMessage = document.getElementById('result-message');
    const resultStatus = document.getElementById('result-status');
    const resultName = document.getElementById('result-character-name');
    const resultGuessCount = document.getElementById('result-guess-count');
    const searchInput = document.getElementById('guess');
    const guessContainer = document.getElementById('guess-container');
    const characterImage = document.getElementById('character-image');
    const viewAllBtnMain = document.getElementById('view-all-btn');

    resultMessage.style.display = 'flex';
    guessContainer.style.display = 'none';
    viewAllBtnMain.style.display = 'none';
    searchInput.disabled = true;

    // Show character image if available
    if (chosenCharacter.image_url) {
        characterImage.src = chosenCharacter.image_url;
    }

    resultName.textContent = chosenCharacter.name;

    if (win) {
        resultStatus.textContent = "Victory!";
        resultStatus.style.color = green;
        resultGuessCount.textContent = `You got it in ${guessNo} guess${guessNo === 1 ? '' : 'es'}!`;
        resultGuessCount.style.display = 'block';
        characterImage.style.border = `4px solid ${green}`;
        // Ensure indicators are visible on victory
        document.getElementById('clue-indicators').style.display = 'flex';
    } else {
        resultStatus.textContent = "Game Over";
        resultStatus.style.color = red;
        resultGuessCount.style.display = 'none';
        characterImage.style.border = `4px solid ${red}`;
        // Hide indicators on game over as they are incomplete/misleading
        document.getElementById('clue-indicators').style.display = 'none';
    }
}

function resetGame() {
    guessNo = 1;
    const guessesContainer = document.getElementById('guesses-container');
    const resultMessage = document.getElementById('result-message');
    const searchInput = document.getElementById('guess');
    const guessContainer = document.getElementById('guess-container');
    const characterImage = document.getElementById('character-image');
    const viewAllBtnMain = document.getElementById('view-all-btn');

    guessesContainer.innerHTML = '';
    resultMessage.style.display = 'none';
    guessContainer.style.display = 'flex';
    viewAllBtnMain.style.display = 'block';
    searchInput.disabled = false;
    searchInput.value = '';
    searchInput.placeholder = `GUESS ${guessNo} OF ${guessMax}`;
    characterImage.src = 'assets/images/question.png';
    characterImage.style.border = 'none';

    const indicators = document.getElementById('clue-indicators');
    indicators.style.display = 'flex';
    indicators.querySelectorAll('.clue-dot').forEach(dot => {
        dot.classList.remove('correct');
        dot.innerHTML = '';
    });

    startGame();
}