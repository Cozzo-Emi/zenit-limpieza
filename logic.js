/**
 * Lógica del juego: Valida la primera letra y la existencia del objeto en ESPAÑOL.
 */
const GameLogic = {
    validarObjetoReal: async function(nombre, objeto) {
        if (!nombre || !objeto) return { valido: false, razon: "vacio" };

        const letraNombre = nombre.trim().charAt(0).toLowerCase();
        const palabra = objeto.trim().toLowerCase();

        // REGLA 1: Validación de letra inicial
        if (palabra.charAt(0) !== letraNombre) {
            return { valido: false, razon: "letra_incorrecta" };
        }

        // REGLA 2: Validación en Español (Datamuse API)
        try {
            // Buscamos la palabra exacta en español con metadatos 
            const url = `https://api.datamuse.com/words?sp=${palabra}&v=es&md=p&max=1`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Error en la API");

            const data = await response.json();

            // Si la API no devuelve nada, la palabra no existe o está mal escrita
            if (data.length === 0 || data[0].word !== palabra) {
                return { valido: false, razon: "palabra_inexistente" };
            }

            // Verifica si es un sustantivo (n = noun/sustantivo )
            const tags = data[0].tags || [];
            const esSustantivo = tags.includes("n");

            return esSustantivo 
                ? { valido: true } 
                : { valido: false, razon: "no_es_objeto" };

        } catch (error) {
            console.error("Error validando en español:", error);
            // Fallback: si falla el internet, dejamos pasar por letra inicial
            return { valido: true }; 
        }
    }
};