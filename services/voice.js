const addToSpeachQueue = (newSpeach) => {
    state.speach_queue.push(newSpeach);
    if (state.speaking == false) {
        sayText();
    }
};

const sayText = () => {
    state.speaking = true;
    const utterance = new SpeechSynthesisUtterance(state.speach_queue.shift());
    window.speechSynthesis.speak(utterance)

    utterance.onend = () => {
        if (state.speach_queue.length > 0) {
            return sayText()
        }
        state.speaking = false;
    };
};