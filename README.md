# memory-master
A memory card game that runs in the browser. Flip two cards at a time, find all the matching pairs before time runs out, and try to beat your own best score.

## Features

- Login and Register (accounts are saved in the browser)
- 4 levels: Easy 4×4 (90s), Medium 6×6 (180s), Hard 6×6 (120s), Expert 8×8 (240s)
- Memorize phase: all cards are shown for 3 seconds before each game
- Score system with combos for consecutive matches and a time bonus
- Wrong matches cost points, and the penalty grows on harder levels
- The cards shuffle once halfway through the time limit
- Peek (reveal the cards once per game) and Pause (button or the P key)
- 1 to 3 star rating based on the number of moves
- Sound effects with a mute button
- The Home page shows the result of your last game
- Responsive design for desktop and mobile

## How to play

1. Create an account and log in
2. Press START GAME and choose a level
3. Memorize the cards, then match all the pairs before the timer ends

## Run locally

Open the project folder in VS Code, then right-click `login.html` and choose "Open with Live Server".

## Built with

HTML, CSS and vanilla JavaScript (no frameworks). Data is saved with localStorage.

## Note

This is a learning project. There is no backend, so accounts and scores are stored only in each player's browser, and passwords are not encrypted.
