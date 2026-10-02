document.addEventListener("DOMContentLoaded", function () {

    const sceneMusic = {
        main: {
            label: "Tera Naam Doon",
            file: "song/Tera Naam Doon Entertainment 128 Kbps.mp3"
        },

        final: {
            label: "Pehli Nazar Mein",
            file: "song/Pehli Nazar Mein Race 128 Kbps.mp3",
        }
    };


    const questions = [
        {
            question: "What's your perfect meal? 🍗",
            answers: ["Biryani 🍚", "Rolls 🌯", "Shawarma 🥙", "Fried Chicken 🍗"],
            accepted: [0]
        },
        {
            question: "What would you choose right now? 👀",
            answers: ["Food 🍕", "Me ❤️", "Sleep 😴", "Game 🎮"],
            accepted: [0, 1, 2, 3]
        },
        {
            question: "Your most-used phrase? 😂",
            answers: ["\"Gadhi h tu.\"", "\"Murkha.\"", "\"Kaleshi aurat.\"", "All three. 💀"],
            accepted: [0, 1, 2, 3]
        },
        {
            question: "Your current obsession? 🎮",
            answers: ["Game 🎮", "Sleep 😴", "Food 🍗", "Annoying me 😌"],
            accepted: [0, 1, 2, 3]
        },
        {
            question: "Biggest weakness? 😏",
            answers: ["Food 🍗", "Sleep 😴", "Games 🎮", "Me kissing your neck ❤️"],
            accepted: [0, 1, 2, 3]
        }
    ];

    const sections = Array.from(document.querySelectorAll(".screen"));
    const startButton = document.getElementById("start-btn");
    const introTitle = document.getElementById("intro-title");
    const introNote = document.getElementById("intro-note");
    const nextButton = document.getElementById("next-btn");
    const quizQuestion = document.getElementById("quiz-question");
    const answersContainer = document.getElementById("answers");
    const questionNumber = document.getElementById("question-number");
    const quizProgress = document.getElementById("quiz-progress");
    const musicToggle = document.getElementById("music-toggle");
    const musicLabel = document.getElementById("music-label");
    const musicState = document.getElementById("music-state");
    const song = document.getElementById("our-song");
    const progressKey = "boyfriend-day-progress-v1";
    const sectionIds = sections.map(function (section) { return section.id; });
    const navigationEntry = window.performance && typeof window.performance.getEntriesByType === "function"
        ? window.performance.getEntriesByType("navigation")[0]
        : null;
    const isPageReload = navigationEntry && navigationEntry.type === "reload";
    let savedProgress = {};
    try {
        if (isPageReload) {
            localStorage.removeItem(progressKey);
        } else {
            const storedProgress = JSON.parse(localStorage.getItem(progressKey) || "{}");
            if (storedProgress && typeof storedProgress === "object" && !Array.isArray(storedProgress)) {
                savedProgress = storedProgress;
            }
        }
    } catch (error) {
        savedProgress = {};
    }
    let currentSectionId = sectionIds.indexOf(savedProgress.sectionId) !== -1 ? savedProgress.sectionId : "intro-section";
    let currentQuestion = Number.isInteger(savedProgress.currentQuestion)
        ? Math.max(0, Math.min(savedProgress.currentQuestion, questions.length - 1))
        : 0;
    let quizAnswers = Array.isArray(savedProgress.quizAnswers)
        ? questions.map(function (question, index) {
            const answer = savedProgress.quizAnswers[index];
            return Number.isInteger(answer) && answer >= 0 && answer < question.answers.length ? answer : null;
        })
        : questions.map(function () { return null; });
    let selectedAnswer = quizAnswers[currentQuestion];
    let introOpened = savedProgress.introOpened === true;
    let mainMusicStarted = false;
    let resumeMusicOnUnmute = false;

    function setIntroTitle(text) {
        introTitle.replaceChildren();
        introTitle.setAttribute("aria-label", text);
        Array.from(text).forEach(function (character, index) {
            const letter = document.createElement("span");
            letter.className = "title-letter";
            letter.setAttribute("aria-hidden", "true");
            letter.textContent = character === " " ? "\u00a0" : character;
            letter.style.animationDelay = (index * 38) + "ms";
            introTitle.appendChild(letter);
        });
    }

    setIntroTitle(introOpened ? "TOO LATE. 😭" : "HEY, BOYFRIEND.");

    function saveProgress() {
        try {
            localStorage.setItem(progressKey, JSON.stringify({
                sectionId: currentSectionId,
                currentQuestion: currentQuestion,
                quizAnswers: quizAnswers,
                introOpened: introOpened
            }));
        } catch (error) {
            // Continue normally when browser storage is unavailable.
        }
    }

    const restartButton = document.getElementById("restart-btn");
    let restartCountdown = null;
    restartButton.addEventListener("click", function () {
        if (restartCountdown) {
            window.clearInterval(restartCountdown);
            restartCountdown = null;
            restartButton.textContent = "Restart";
            restartButton.setAttribute("aria-label", "Restart website from the beginning");
            return;
        }

        let secondsRemaining = 5;
        restartButton.textContent = "Cancel (5)";
        restartButton.setAttribute("aria-label", "Cancel restart countdown");
        restartCountdown = window.setInterval(function () {
            secondsRemaining--;
            if (secondsRemaining > 0) {
                restartButton.textContent = "Cancel (" + secondsRemaining + ")";
                return;
            }
            window.clearInterval(restartCountdown);
            restartCountdown = null;
            try {
                localStorage.removeItem(progressKey);
            } catch (error) {
                // Reload still returns to the intro when browser storage is unavailable.
            }
            window.location.reload();
        }, 1000);
    });

    function updateStarterPack() {
        const starterChoices = [
            { 0: { icon: "🍚", title: "Biryani", note: "Emergency food supply" } },
            {
                0: { icon: "🍕", title: "Food", note: "A very understandable choice" },
                1: { icon: "♥", title: "Me", note: "Chosen over everything else. Correct answer. ♥" },
                2: { icon: "😴", title: "Sleep", note: "Available 24/7" },
                3: { icon: "🎮", title: "Game", note: "Please give me thoda sa priority kabhi kabhi" }
            },
            {
                0: { icon: "🗣️", title: "Gadhi", note: "One of his classics" },
                1: { icon: "🗣️", title: "Murkha", note: "Another one of his classics" },
                2: { icon: "🗣️", title: "Kaleshi aurat", note: "A very specific classic" },
                3: { icon: "🗣️", title: "All three", note: "Gadhi • Murkha • Kaleshi Aurat" }
            },
            {
                0: { icon: "🎮", title: "Game", note: "Do not disturb" },
                3: { icon: "😌", title: "Annoying me", note: "Your favorite hobby, apparently" }
            },
            {
                0: { icon: "🍗", title: "Food", note: "Can solve approximately 87% of problems" },
                1: { icon: "😴", title: "Sleep", note: "Available 24/7" },
                2: { icon: "🎮", title: "Games", note: "Do not disturb" },
                3: { icon: "♥", title: "Me", note: "Your biggest weakness. Obviously. ♥" }
            }
        ];

        ["meal", "choice", "phrase", "obsession", "weakness"].forEach(function (item, questionIndex) {
            const selectedIndex = quizAnswers[questionIndex];
            const content = selectedIndex === null ? null : starterChoices[questionIndex][selectedIndex];
            if (!content) return;
            const card = document.querySelector('[data-starter="' + item + '"]');
            card.querySelector("[data-starter-icon]").textContent = content.icon;
            card.querySelector("[data-starter-title]").textContent = content.title;
            card.querySelector("[data-starter-note]").textContent = content.note;
        });
    }

    function updateMusicToggle(name, muted) {
        if (musicLabel) musicLabel.textContent = "♫ " + name;
        if (musicState) musicState.textContent = muted ? "🔇" : "🔊";
    }

    function stopSceneAudio() {
        if (!song) return;
        song.pause();
        song.currentTime = 0;
        song.loop = false;
        playToken++;
    }

    // Builds every filename spelling that might exist on disk
    // ("Iktara Wake Up Sid.mp3" and "Iktara_Wake_Up_Sid.mp3")
    function variants(file, extra) {
        const list = [file, file.replace(/[ ()]/g, "_")];
        (extra ? [].concat(extra) : []).forEach(function (f) { list.push(f, f.replace(/[ ()]/g, "_")); });
        return list.filter(function (v, i) { return list.indexOf(v) === i; });
    }

    let playToken = 0;
    function tryPlay(sources, onPlaying, onFail) {
        const token = ++playToken;
        let i = 0;
        (function next() {
            if (token !== playToken) return;
            if (i >= sources.length) { if (onFail) onFail(); return; }
            song.src = sources[i++];
            song.load();
            const promise = song.play();
            if (!promise) return;
            promise.then(function () {
                if (token === playToken && onPlaying) onPlaying();
            }).catch(function (err) {
                if (token !== playToken) return;
                if (err && err.name === "NotAllowedError") { if (onFail) onFail(err); } else { next(); }
            });
        })();
    }

    function playMainMusic() {
        if (!song || song.muted || mainMusicStarted) return;
        mainMusicStarted = true;
        song.loop = true;
        updateMusicToggle(sceneMusic.main.label, song.muted);
        tryPlay(variants(sceneMusic.main.file), null, function () {
            mainMusicStarted = false;
        });
    }

    function showSection(sectionId) {
        sections.forEach(function (section) {
            section.classList.toggle("is-hidden", section.id !== sectionId);
        });
        currentSectionId = sectionId;
        saveProgress();
        if (sectionId === "starter-section") updateStarterPack();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const target = document.getElementById(sectionId);
        if (target && target.hasAttribute("data-slow")) runSlow(target);
        if (target && target.dataset.music === "final") {
            stopSceneAudio();
            mainMusicStarted = false;
            resumeMusicOnUnmute = false;
            updateMusicToggle(sceneMusic.final.label, song && song.muted);
            playFinalMusic();
        } else {
            updateMusicToggle(sceneMusic.main.label, song && song.muted);
        }
    }

    function runSlow(section) {
        const lines = section.querySelectorAll(".slow-line");
        const end = section.querySelector(".slow-end");
        lines.forEach(function (line) { line.classList.remove("shown"); });
        end.classList.add("is-hidden");
        lines.forEach(function (line, i) {
            window.setTimeout(function () { line.classList.add("shown"); }, 800 + i * 2000);
        });
        window.setTimeout(function () { end.classList.remove("is-hidden"); }, 1600 + lines.length * 2000);
    }

    startButton.addEventListener("click", function () {
        if (!introOpened) {
            introOpened = true;
            saveProgress();
            playMainMusic();
            setIntroTitle("TOO LATE. 😭");
            introNote.innerHTML = "Okay fine.<br>Happy Boyfriend's Day. <span aria-hidden=\"true\">♥</span>";
            startButton.innerHTML = "ENTER <span aria-hidden=\"true\">→</span>";
            return;
        }
        playMainMusic();
        showQuestion();
        showSection("quiz-section");
    });

    function showQuestion() {
        const question = questions[currentQuestion];
        quizQuestion.textContent = question.question;
        questionNumber.textContent = currentQuestion + 1;
        quizProgress.style.width = ((currentQuestion + 1) / questions.length * 100) + "%";
        answersContainer.innerHTML = "";
        const quizReaction = document.getElementById("quiz-reaction");
        selectedAnswer = quizAnswers[currentQuestion];
        quizReaction.textContent = getQuizFeedback(currentQuestion, selectedAnswer, question);
        nextButton.disabled = selectedAnswer === null || question.accepted.indexOf(selectedAnswer) === -1;
        nextButton.innerHTML = currentQuestion === questions.length - 1
            ? "Submit <span aria-hidden=\"true\">→</span>"
            : "Next <span aria-hidden=\"true\">→</span>";

        question.answers.forEach(function (answer, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-btn";
            button.innerHTML = "<span class=\"answer-index\">0" + (index + 1) + "</span><span>" + answer + "</span>";
            button.setAttribute("aria-pressed", index === selectedAnswer ? "true" : "false");
            if (index === selectedAnswer) button.classList.add("selected");
            button.addEventListener("click", function () {
                answersContainer.querySelectorAll(".answer-btn").forEach(function (answerButton) {
                    answerButton.classList.remove("selected");
                    answerButton.setAttribute("aria-pressed", "false");
                });
                button.classList.add("selected");
                button.setAttribute("aria-pressed", "true");
                selectedAnswer = index;
                quizAnswers[currentQuestion] = index;
                quizReaction.textContent = getQuizFeedback(currentQuestion, index, question);
                nextButton.disabled = question.accepted.indexOf(index) === -1;
                saveProgress();
            });
            answersContainer.appendChild(button);
        });
    }

    function getQuizFeedback(questionIndex, answerIndex, question) {
        if (answerIndex === null) return "";
        if (questionIndex === 1 && answerIndex !== 1) return "Please give me thoda sa priority kabhi kabhi";
        if (questionIndex === 2) return "I love youuuu";
        return question.accepted.indexOf(answerIndex) === -1 ? "Nope, try again 😌" : "";
    }

    nextButton.addEventListener("click", function () {
        if (selectedAnswer === null || questions[currentQuestion].accepted.indexOf(selectedAnswer) === -1) return;
        currentQuestion++;
        if (currentQuestion < questions.length) {
            selectedAnswer = quizAnswers[currentQuestion];
            saveProgress();
            showQuestion();
        } else {
            showSection("result-section");
        }
    });

    document.querySelectorAll(".next-screen").forEach(function (button) {
        button.addEventListener("click", function () {
            showSection(button.dataset.next);
        });
    });

    if (musicToggle) {
        musicToggle.addEventListener("click", function () {
            if (!song) return;
            song.muted = !song.muted;
            updateMusicToggle(currentSceneMusicLabel(), song.muted);
            if (song.muted) {
                resumeMusicOnUnmute = !song.paused;
                song.pause();
            } else if (resumeMusicOnUnmute) {
                resumeMusicOnUnmute = false;
                if (!document.getElementById("final-section").classList.contains("is-hidden")) {
                    playFinalMusic();
                } else {
                    song.play().catch(function () {});
                }
            } else if (document.getElementById("final-section").classList.contains("is-hidden")) {
                playMainMusic();
            }
        });
    }

    function currentSceneMusicLabel() {
        const activeSection = document.querySelector(".screen:not(.is-hidden)");
        return activeSection && activeSection.dataset.music === "final"
            ? sceneMusic.final.label
            : sceneMusic.main.label;
    }

    const awards = [
        ["🏆", "BEST BOYFRIEND", "Somehow won this without even applying."],
        ["🎤", "PROFESSIONAL TEASER", "Nobody does it better."],
        ["✨", "CEO OF MAKING ME SMILE", "Position permanently occupied."],
        ["🥇", "MOST ANNOYING PERSON I STILL CHOOSE", "Unfortunately, it's you."],
        ["♥", "WORLD'S MOST WANTED BOYFRIEND", "Wanted by: me."]
    ];
    let awardIndex = 0;
    const revealAwardButton = document.getElementById("reveal-award-btn");
    revealAwardButton.addEventListener("click", function () {
        const award = awards[awardIndex];
        document.getElementById("award-icon").textContent = award[0];
        document.getElementById("award-name").textContent = award[1];
        document.getElementById("award-note").textContent = award[2];
        const awardCard = document.getElementById("award-card");
        awardCard.classList.remove("award-pop");
        void awardCard.offsetWidth;
        awardCard.classList.add("award-pop");
        awardIndex++;
        if (awardIndex === awards.length) {
            revealAwardButton.classList.add("is-hidden");
            document.getElementById("awards-next-btn").classList.remove("is-hidden");
        }
    });
    document.getElementById("awards-next-btn").addEventListener("click", function () {
        showSection("photo-two-section");
    });

    const giftMessages = {
        food: "🍗 Correct answer. We both know food makes everything better.",
        gaming: "🎮 Of course you picked gaming. I should've known.",
        me: "😌 Interesting choice. Very wise."
    };
    document.querySelectorAll(".gift-option").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll(".gift-option").forEach(function (option) {
                option.classList.remove("chosen");
            });
            button.classList.add("chosen");
            document.getElementById("gift-result").textContent = giftMessages[button.dataset.gift];
            document.getElementById("gift-next-btn").classList.remove("is-hidden");
        });
    });
    document.getElementById("gift-next-btn").addEventListener("click", function () {
        showSection("final-section");
    });

    document.querySelectorAll(".reveal-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            button.parentElement.querySelectorAll(".reveal-target").forEach(function (el) { el.classList.remove("is-hidden"); });
            button.classList.add("is-hidden");
            makeHearts();
        });
    });

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (finePointer && !reducedMotion) {
        const cursor = document.getElementById("heart-cursor");
        document.addEventListener("pointermove", function (event) {
            cursor.style.left = event.clientX + "px";
            cursor.style.top = event.clientY + "px";
            document.body.style.setProperty("--pointer-x", event.clientX + "px");
            document.body.style.setProperty("--pointer-y", event.clientY + "px");
            document.body.classList.add("has-heart-cursor");
            const target = event.target instanceof Element
                ? event.target.closest("button, a, .answer-btn, .gift-option, .trait")
                : null;
            cursor.classList.toggle("is-over-target", Boolean(target));
        });
        document.addEventListener("pointerout", function (event) {
            if (!event.relatedTarget) document.body.classList.remove("has-heart-cursor");
        });

        document.querySelectorAll(".trait").forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                const bounds = card.getBoundingClientRect();
                const horizontal = (event.clientX - bounds.left) / bounds.width;
                const vertical = (event.clientY - bounds.top) / bounds.height;
                card.style.setProperty("--tilt-x", ((0.5 - vertical) * 6) + "deg");
                card.style.setProperty("--tilt-y", ((horizontal - 0.5) * 6) + "deg");
                card.classList.add("is-tilting");
            });
            card.addEventListener("pointerleave", function () {
                card.style.removeProperty("--tilt-x");
                card.style.removeProperty("--tilt-y");
                card.classList.remove("is-tilting");
            });
        });
    }

    document.querySelectorAll(".photo-frame img").forEach(function (image) {
        function showPhotoPlaceholder() {
            const placeholder = document.createElement("div");
            placeholder.className = "photo-placeholder";
            placeholder.innerHTML = "<span aria-hidden=\"true\">✦</span><strong>" + image.dataset.fallback + "</strong>";
            image.replaceWith(placeholder);
        }
        image.addEventListener("error", showPhotoPlaceholder, { once: true });
        if (image.complete && image.naturalWidth === 0) showPhotoPlaceholder();
    });

    const playButton = document.getElementById("play-song-btn");

    function playFinalMusic() {
        if (!song) return;
        song.muted = false;
        song.loop = false;
        updateMusicToggle(sceneMusic.final.label, false);
        tryPlay(variants(sceneMusic.final.file), function () {
            playButton.innerHTML = "<span aria-hidden=\"true\">Ⅱ</span> Pause";
            document.getElementById("song-status").textContent = "Playing Pehli Nazar Mein. ♥";
            document.getElementById("happy-message").classList.remove("is-hidden");
            window.setTimeout(function () { document.getElementById("love-line").classList.remove("is-hidden"); }, 6000);
            document.body.classList.add("song-playing");
            makeHearts();
        }, function (error) {
            document.getElementById("song-status").textContent = error && error.name === "NotAllowedError"
                ? "Tap Play to start Pehli Nazar Mein. ♥"
                : "Couldn't play the song. Check that the mp3 files are inside the song folder. ♥";
        });
    }

    playButton.addEventListener("click", function () {
        if (!song) return;
        if (song.paused) {
            playFinalMusic();
        } else {
            song.pause();
            song.currentTime = 0;
            try {
                localStorage.removeItem(progressKey);
            } catch (error) {
                // Reload still starts at the intro when browser storage is unavailable.
            }
            window.location.reload();
        }
    });
    song.addEventListener("pause", function () {
        playButton.innerHTML = "<span aria-hidden=\"true\">▶</span> Play";
        document.body.classList.remove("song-playing");
    });
    song.addEventListener("ended", function () {
        document.body.classList.remove("song-playing");
        playButton.innerHTML = "<span aria-hidden=\"true\">▶</span> Play";
    });

    if (introOpened) {
        setIntroTitle("TOO LATE. 😭");
        introNote.innerHTML = "Okay fine.<br>Happy Boyfriend's Day. <span aria-hidden=\"true\">♥</span>";
        startButton.innerHTML = "ENTER <span aria-hidden=\"true\">→</span>";
    }
    if (currentSectionId === "quiz-section") showQuestion();
    showSection(currentSectionId);

    function makeHearts() {
        const layer = document.getElementById("heart-layer");
        layer.innerHTML = "";
        for (let index = 0; index < 7; index++) {
            const heart = document.createElement("span");
            heart.textContent = index % 2 === 0 ? "♥" : "✦";
            heart.style.left = (8 + Math.random() * 84) + "%";
            heart.style.animationDelay = (Math.random() * 3) + "s";
            layer.appendChild(heart);
        }
        window.setTimeout(function () { layer.innerHTML = ""; }, 9000);
    }
});