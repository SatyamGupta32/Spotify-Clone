// Get the necessary DOM elements
let playgreen = document.querySelector('.playgreen');
let showall = document.querySelector('.showall');
let closePlaylist = document.querySelector('.closeplaylist');
let cardContainer = document.querySelector('.card-container');
let playBar = document.querySelector('.playbar');
let currentSong = new Audio(); // Create a new Audio object

// Add Event Listner for Hamburger Menu Open
let hamburgerMenu = document.querySelector('.hamBurger');
hamburgerMenu.addEventListener('click', () => {
    document.querySelector('.left').style.left = "0%";
});

// Add Event Listner for Hamburger Menu Close
let Close = document.querySelector('.Close');
Close.addEventListener('click', () => {
    document.querySelector('.left').style.left = "-100%";
});

// Add Event Listner for Hamburger Menu Open
let Main = document.querySelector('.main');
Main.addEventListener('click', () => {
    document.querySelector('.left').style.left = "-100%";
});

let range = document.querySelector('#range');
range.addEventListener('change', (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
});

// Add Event  for volume button for mute or unmute
let volumeButton = document.querySelector('.volumeButton>img');

volumeButton.addEventListener('click', (e) => {
    if (e.target.src.includes('volume.svg')) {
        e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
        currentSong.volume = 0;
        range.value = 0;
    } else {
        e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
        currentSong.volume = 0.1; // Assuming volume range is from 0 to 1
        range.value = 10;
    }
});


cardContainer.style.width = '100%';
showall.addEventListener('click', () => {
    cardContainer.style.maxHeight = '83vh';
    cardContainer.style.overflowY = 'auto';
    showall.style.display = 'none';
    closePlaylist.style.display = 'block';
});

closePlaylist.addEventListener('click', () => {
    cardContainer.style.maxHeight = '240px';
    cardContainer.style.overflowY = 'hidden';
    showall.style.display = 'block';
    closePlaylist.style.display = 'none';
});

async function getSongs(folder) {

    let fetchSong = await fetch(`http://127.0.0.1:5500/assets/songs/${folder}/`);
    if (!fetchSong.ok) {
        throw new Error('Network response was not ok');
    }
    let fetchSongtext = await fetchSong.text();
    let div = document.createElement('div');
    div.innerHTML = fetchSongtext;
    let a = div.getElementsByTagName('a');
    let songs = []; // Array to store song URLs
    for (let index = 0; index < a.length; index++) {
        const element = a[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return songs;
}




function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function main() {

    async function displayAlbums() {
        let a = await fetch('http://127.0.0.1:5500/assets/songs/');
        let response = await a.text();

        // Create a temporary div to parse the response
        let div1 = document.createElement("div");
        div1.innerHTML = response;

        // Extract all anchor tags
        let anchors = div1.getElementsByTagName("a");

        // Iterate over each anchor tag
        cardContainer.innerHTML = '';
        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes('assets/songs/')) {
                let folder = e.href.split('/').slice(-2)[1];
                // Get Metadata of the folder
                let a = await fetch(`http://127.0.0.1:5500/assets/songs/${folder}/info.json`);
                let response = await a.json();

                cardContainer.innerHTML = cardContainer.innerHTML +
                    `<div data-folder="${folder}" class="card">
                                    <div class="images">
                                        <img
                                        class="album"
                                        height="150"
                                        src="assets/songs/${folder}/cover.jpg"
                                        alt="cover"
                                        />
                                        <div class="playgreen">
                                        <img
                                        class="playgreen-img"
                                        src="assets/images/playgreen.svg"
                                        alt=""
                                        />
                                    </div>
                                    </div>
                                    <div class="heading-details">
                                        <p class="heading">${response.title}</p>
                                        <p class="details">${response.description}</p>
                                    </div>
                                </div>`;
            }
        };

        // Load Songs from selected Card from Card List
        Array.from(document.getElementsByClassName('card')).forEach(element => {
            element.addEventListener('click', async item => {

                const folder = item.currentTarget.dataset.folder; // Update this with the correct folder name
                let songs = await getSongs(folder);
                if (songs.length === 0) {
                    console.log('No songs found');
                    return;
                }

                let songList = document.querySelector('.songList').getElementsByTagName('ul')[0];
                let playNowButtonSeekbar = document.querySelector('.playNowSeekbar');
                let currentSongName = document.querySelector('.currentSongName');
                let currentSongTime = document.querySelector('.currentSongTime');
                let totalSongTime = document.querySelector('.totalSongTime');
                let seekBar_progress = document.querySelector('.seekBar_progress');

                songList.innerHTML = '';

                // Populate the song list
                for (let i = 0; i < songs.length; i++) {
                    let li = document.createElement('li');
                    li.innerHTML = `
                        <div class="musicImage">
                            <img src="./assets/images/music.svg" alt="music"/>
                        </div>
                        <div class="songname">${songs[i].replaceAll('%20', ' ').replaceAll('%5D', ' ').replaceAll('%5B', ' ').replaceAll('.mp3', ' ')}</div>
                    `;
                    songList.appendChild(li);

                    // Attach click event listener to play the song when song name is clicked
                    li.querySelector('.songname').addEventListener('click', () => {
                        playMusic(songs[i], li);
                    });
                }

                playMusic(songs[0], songList.children[0]);
                updatePlayPauseButton(playNowButtonSeekbar, 'pause');

                currentSongName.textContent = songs[0].replaceAll('%20', ' ').replaceAll('%5D', ' ').replaceAll('%5B', ' ').replaceAll('.mp3', ' ');
                // Attach event listener to seekBar play button
                playNowButtonSeekbar.addEventListener('click', () => {
                    if (currentSong.paused) {
                        currentSong.play();
                        updatePlayPauseButton(playNowButtonSeekbar, 'pause');
                    } else {
                        currentSong.pause();
                        updatePlayPauseButton(playNowButtonSeekbar, 'play');
                    }
                });

                function playMusic(track, songElement) {

                    currentSong.src = `assets/songs/${folder}/${track}`;
                    currentSong.play();

                    // Diplay the current time and duration of the song
                    currentSong.addEventListener('timeupdate', () => {
                        currentSongTime.textContent = formatTime(currentSong.currentTime);
                        totalSongTime.textContent = formatTime(currentSong.duration);

                        seekBar_progress.style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
                    });

                    updatePlayPauseButton(playNowButtonSeekbar, 'pause');
                    currentPlayingElement = songElement;

                    // Update the current song name
                    currentSongName.textContent = track.replaceAll('%20', ' ').replaceAll('%5D', ' ').replaceAll('%5B', ' ');

                    // seek the song from it's is current time 
                    document.querySelector('.seekBar').addEventListener('click', e => {
                        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                        seekBar_progress.style.left = `${percent}%`;
                        currentSong.currentTime = (currentSong.duration * percent) / 100;
                    })
                }

                function updatePlayPauseButton(button, state) {
                    button.innerHTML = state === 'pause'
                        ? '<img src="./assets/images/pause.svg" alt="pause"/>'
                        : '<img src="./assets/images/play.svg" alt="play"/>';
                }

                // Attach event listener to previousSong button
                let previousSongButton = document.querySelector('.previousSong');
                previousSongButton.addEventListener('click', () => {
                    let currentIndex = songs.indexOf(currentSong.src.split('/').pop());
                    if (currentIndex > 0) {
                        playMusic(songs[currentIndex - 1], songList.children[currentIndex - 1]);
                    } else {
                        // If at the first song and previous is clicked, loop to the last song
                        playMusic(songs[songs.length - 1], songList.children[songs.length - 1]);
                    }
                });

                // Attach event listener to nextSong button
                let nextSongButton = document.querySelector('.nextSong');
                nextSongButton.addEventListener('click', () => {
                    let currentIndex = songs.indexOf(currentSong.src.split('/').pop());
                    if (currentIndex < songs.length - 1) {
                        playMusic(songs[currentIndex + 1], songList.children[currentIndex + 1]);
                    } else {
                        // If at the last song, loop back to the first song
                        playMusic(songs[0], songList.children[0]);
                    }
                });
            });
        });

    }
    displayAlbums();
}

main();