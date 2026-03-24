let usuarioActual = "";


document.getElementById('btn-start').addEventListener('click', () => {
    const nombre = UI.inputs.name.value.trim();
    if (nombre.length > 1) {
        usuarioActual = nombre;
        UI.elements.greeting.innerText = `¡Hola, ${usuarioActual}! ✈️`;
        UI.switchScreen(true);
    } else {
        alert("Por favor, ingresá tu nombre.");
    }
});

// Validación de objeto 
document.getElementById('btn-check').addEventListener('click', async () => {
    const objeto = UI.inputs.item.value.trim();
    
    if (objeto) {
        UI.elements.feedback.innerText = "Revisando equipaje...";
        
        const resultado = await GameLogic.validarObjetoReal(usuarioActual, objeto);
        
        if (resultado.valido) {
            UI.showFeedback(true, usuarioActual);
        } else {
            let mensaje = "No podés llevar eso...";
            if (resultado.razon === "letra_incorrecta") mensaje = `¡Debe empezar con la letra "${usuarioActual[0].toUpperCase()}"!`;
            if (resultado.razon === "palabra_inexistente") mensaje = "Ese objeto no parece existir.";
            
            UI.showFeedback(false, usuarioActual, mensaje);
        }
    }
});

// Reiniciar
document.getElementById('btn-reset').addEventListener('click', () => {
    usuarioActual = "";
    UI.inputs.name.value = "";
    UI.inputs.item.value = "";
    UI.elements.feedback.innerText = "";
    UI.switchScreen(false);
});