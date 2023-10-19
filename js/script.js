// Elements
const popup = document.getElementById("popup");
const popupSourceLang = document.getElementById("sourceLanguage");
const popupTargetLanguage = document.getElementById("targetLanguage");
const sourceLangLabel = document.querySelector(".source_lang_label");
const targetLangLabel = document.querySelector(".target_lang_label");
const sourceInput = document.getElementById("source-input");
const targetInput = document.getElementById("target-input");
const score_popup = document.querySelector(".score-popup");
const timer = document.getElementById("timer");

// Buttons
const startButton = document.getElementById("startButton");
const correctTransButton = document.getElementById("correctTrans");
const nextQuestionButton = document.getElementById("nextQuestion");
const scoreButton = document.getElementById("btnScore");
const playAgain = document.getElementById("play-again");
const restartButton = document.getElementById("restartGame");

// Sound Effects
const correctSound = document.getElementById("correct_sound");
const wrongSound = document.getElementById("wrong_sound");
const resultSuccessSound = document.getElementById("success_sound");
const failureSuccessSound = document.getElementById("failure_sound");
const startSound = document.getElementById("start_game_sound");

let score = 0;
let duration = 59;
let timerInterval;

timer.innerHTML = duration;

function getSelectedLang(lang) {
  let langCode;

  switch (lang) {
    case "english":
      langCode = "en";
      break;
    case "spanish":
      langCode = "es";
      break;
    case "chinese":
      langCode = "zh";
      break;
    case "german":
      langCode = "de";
  }

  return langCode;
}

startButton.addEventListener("click", startGame);
function startGame() {
  timer.style.right = 0;
  clearInterval(timerInterval);
  countdown();

  startSound.play();

  const selectedSourceLang = popupSourceLang.value;
  const selectedTargetLang = popupTargetLanguage.value;

  sourceLangLabel.innerHTML =
    selectedSourceLang.charAt(0).toUpperCase() +
    selectedSourceLang.substring(1);
  targetLangLabel.innerHTML =
    selectedTargetLang.charAt(0).toUpperCase() +
    selectedTargetLang.substring(1);

  const xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", () => {
    if (xhr.status === 200 && xhr.readyState === 4) {
      sourceInput.value = JSON.parse(xhr.responseText)[0];
    }
  });

  xhr.open(
    "GET",
    `https://random-word-api.herokuapp.com/word?lang=${getSelectedLang(
      selectedSourceLang
    )}`
  );
  xhr.send();

  popup.classList.add("hidden");
}

correctTransButton.addEventListener("click", checkTranslation);
function checkTranslation() {
  fetch(
    `https://api.mymemory.translated.net/get?q=${
      sourceInput.value
    }!&langpair=${getSelectedLang(
      sourceLangLabel.innerText.toLowerCase()
    )}|${getSelectedLang(targetLangLabel.innerText.toLowerCase())}`
  )
    .then((response) => response.json())
    .then((data) => {
      const translation = data.responseData.translatedText;
      console.log(translation);
      if (
        targetInput.value.toLowerCase().trim() === translation.toLowerCase()
      ) {
        correctSound.play();
        displayNextQuestion();
        score++;
      } else {
        wrongSound.play();
      }
    });
}

nextQuestionButton.addEventListener("click", displayNextQuestion);
function displayNextQuestion() {
  timer.innerText = duration;
  clearInterval(timerInterval);
  countdown();

  const sourceLang = sourceLangLabel.innerText.toLowerCase();

  const xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", () => {
    if (xhr.status === 200 && xhr.readyState === 4) {
      sourceInput.value = JSON.parse(xhr.responseText)[0];
    }
  });

  xhr.open(
    "GET",
    `https://random-word-api.herokuapp.com/word?lang=${getSelectedLang(
      sourceLang
    )}`
  );
  xhr.send();

  targetInput.value = "";
}

scoreButton.addEventListener("click", displayResult);
function displayResult() {
  clearInterval(timerInterval);
  score_popup.classList.remove("hidden");

  document.getElementById("score").innerHTML = score;
  const msg = document.querySelector(".msg");

  if (score <= 5) {
    msg.innerHTML =
      "Oh no! You scored very low. Keep practicing and try again!";
    failureSuccessSound.play();
  } else if (score <= 10) {
    msg.innerHTML =
      "Not bad! You scored decently, but there's room for improvement. Keep playing!";
    resultSuccessSound.play();
  } else if (score <= 15) {
    msg.innerHTML =
      "Great job! You're doing well. Keep up the good work and aim for an even higher score!";
    resultSuccessSound.play();
  } else if (score <= 19) {
    msg.innerHTML =
      "Fantastic performance! You're almost there. Just a little more effort and you'll reach the top!";
    resultSuccessSound.play();
  } else {
    msg.innerHTML =
      "Congratulations! Perfect score! You're a true champion. Well done!";
    resultSuccessSound.play();
  }

  timer.innerHTML = duration;
}

playAgain.addEventListener("click", replay);
function replay() {
  score_popup.classList.add("hidden");
  popup.classList.remove("hidden");
  score = 0;
}

restartButton.addEventListener("click", restartGame);
function restartGame() {
  timer.innerText = duration;
  clearInterval(timerInterval);
  sourceInput.value = "";
  targetInput.value = "";
  score = 0;
  popup.classList.remove("hidden");
}

function countdown() {
  timerInterval = setInterval(() => {
    timer.innerText--;
    if (timer.innerText == 0) {
      clearInterval(timerInterval);
      displayNextQuestion();
    }
  }, 1000);
}

function randomNumbers(len) {
  let arr = [];
  while (arr.length < len) {
    const randomNumber = Math.floor(Math.random() * len);
    if (arr.indexOf(randomNumber) === -1) {
      arr.push(randomNumber);
    }
  }
}

document.addEventListener("keypress", ({ key }) => {
  if (key === "Enter") checkTranslation();
});

// Make the computer speak
document.querySelectorAll(".volume").forEach((volume) => {
  volume.addEventListener("click", ({ target }) => {
    if ("speechSynthesis" in window) {
      speakup(target.previousElementSibling);
    } else {
      const apiPopup = document.querySelector(".api-popup");
      apiPopup.classList.remove("hidden");
      const closeIcon = document.querySelector(".close-icon");
      closeIcon.addEventListener("click", () => {
        apiPopup.classList.add("hidden");
      });
    }
  });
});

function speakup(input) {
  if (input.value !== "") {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = input.value;

    switch (input.parentNode.previousElementSibling.children[0].innerText) {
      case "Chinese":
        utterance.lang = "zh";
        break;
      case "German":
        utterance.lang = "de";
        break;
      case "Spanish":
        utterance.lang = "es";
    }

    input.disabled = true;
    utterance.addEventListener("end", () => {
      input.disabled = false;
    });

    speechSynthesis.speak(utterance);
  }
}

// Check if the user has selected the same language
function isTheSame() {
  return popupSourceLang.value === popupTargetLanguage.value;
}

// If so we swap them
document.querySelectorAll("select").forEach((dropdown) => {
  dropdown.onclick = function () {
    const lang = this.value;
    dropdown.addEventListener("change", () => {
      if (isTheSame()) {
        if (dropdown.id === "sourceLanguage") {
          popupTargetLanguage.value = lang;
        } else {
          popupSourceLang.value = lang;
        }
      }
    });
  };
});
