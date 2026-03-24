const UI = {
    screens: {
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-screen')
    },
    inputs: {
        name: document.getElementById('userName'),
        item: document.getElementById('itemInput')
    },
    elements: {
        greeting: document.getElementById('greeting'),
        feedback: document.getElementById('feedback-msg'),
        suitcase: document.getElementById('visual-suitcase')
    },

    switchScreen: function(toGame) {
        this.screens.setup.classList.toggle('hidden', toGame);
        this.screens.game.classList.toggle('hidden', !toGame);
    },

    showFeedback: function(esValido, nombre, mensajePersonalizado) {
        const msgDefault = esValido ? `✅ ¡Ese objeto entra perfecto, ${nombre}!` : `❌ ${mensajePersonalizado}`;
        
        this.elements.feedback.innerText = mensajePersonalizado || msgDefault;
        this.elements.feedback.style.color = esValido ? '#47D16E' : '#FF6B6B';

        if (!esValido) {
            this.elements.suitcase.classList.add('error-shake');
            setTimeout(() => this.elements.suitcase.classList.remove('error-shake'), 400);
        } else {
            this.elements.suitcase.classList.add('success-bounce');
            setTimeout(() => this.elements.suitcase.classList.remove('success-bounce'), 300);
            this.inputs.item.value = "";
        }
    }
};