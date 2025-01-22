const argon2 = require("argon2");

async function generateHash() {
    const password = "test123"; // Remplace par ton mot de passe
    try {
        const hash = await argon2.hash(password);
        console.log("Hash généré :", hash);
        const isMatch = await argon2.verify(hash, password);
        console.log("Le mot de passe correspond au hash :", isMatch);
    } catch (error) {
        console.error("Erreur lors de la génération du hash :", error);
    }
}

generateHash();
