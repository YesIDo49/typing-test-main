import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRef, setCaretRef } from "store/actions";
import { State } from "store/reducer";
import "stylesheets/Test.scss";

export default function Test() {
    const {
        word: { typedWord, currWord, wordList, typedHistory },
        time: { timer },
    } = useSelector((state: State) => state);
    const dispatch = useDispatch();
    const extraLetters = typedWord.slice(currWord.length).split("");
    const activeWord = useRef<HTMLDivElement>(null);
    const caretRef = useRef<HTMLSpanElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        dispatch(setRef(activeWord));
        dispatch(setCaretRef(caretRef));
    }, [dispatch]);

    useEffect(() => {
        const audio = new Audio("/music/audio.mp3"); // Utiliser le chemin relatif du dossier public
        audioRef.current = audio;

        const playAudio = () => {
            audio.play().catch(error => {
                console.error("Error playing audio:", error);
            });
            setIsPlaying(true);
        };

        const handleUserInteraction = () => {
            playAudio();
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
        };

        if (!isPlaying) {
            document.addEventListener("click", handleUserInteraction, { once: true });
            document.addEventListener("keydown", handleUserInteraction, { once: true });
        }

        return () => {
            if (audio) {
                audio.pause(); // Arrêter la musique lorsque le composant se démonte
                audio.currentTime = 0; // Réinitialiser la musique au début
            }
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
        };
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            if (timer > 0) {
                audioRef.current.play().catch(error => {
                    console.error("Error playing audio:", error);
                });
            } else {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [timer]);

    return (
        <div className="test">
            <audio ref={audioRef} src="/music/audio.mp3" />
            <div className="timer">{timer}</div>
            <div className="box">
                {wordList.map((word, idx) => {
                    const isActive =
                        currWord === word && typedHistory.length === idx;
                    return (
                        <div
                            key={word + idx}
                            className="word"
                            ref={isActive ? activeWord : null}>
                            {isActive ? (
                                <span
                                    ref={caretRef}
                                    id="caret"
                                    className="blink"
                                    style={{
                                        left: typedWord.length * 14.5833,
                                    }}>
                                    |
                                </span>
                            ) : null}
                            {word.split("").map((char, charId) => {
                                return <span key={char + charId}>{char}</span>;
                            })}
                            {isActive
                                ? extraLetters.map((char, charId) => {
                                    return (
                                        <span
                                            key={char + charId}
                                            className="wrong extra">
                                              {char}
                                          </span>
                                    );
                                })
                                : typedHistory[idx]
                                    ? typedHistory[idx]
                                        .slice(wordList[idx].length)
                                        .split("")
                                        .map((char, charId) => {
                                            return (
                                                <span
                                                    key={char + charId}
                                                    className="wrong extra">
                                                  {char}
                                              </span>
                                            );
                                        })
                                    : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
