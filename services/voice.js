const addToSpeachQueue = (newSpeach) => {
    if (state.speach_enabled == false) {
        return;
    }

    state.speach_queue.push(newSpeach);
    if (state.speaking == false) {
        sayText();
    }
};

const sayText = () => {
    if (state.speach_enabled == false) {
        return;
    }

    state.speaking = true;
    const utterance = new SpeechSynthesisUtterance(state.speach_queue.shift());
    window.speechSynthesis.speak(utterance)

    utterance.onend = () => {
        state.speaking = false;
        if (state.speach_queue.length > 0) {
            return sayText()
        }
    };
};