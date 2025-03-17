function isValidPhoneNumber(phoneNumber) {
    // Remove caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Verifica se o número tem 10 ou 11 dígitos (com ou sem DDD)
    return /^(\d{10}|\d{11})$/.test(cleaned);
}

function isValidAddress(params) {
    const requiredFields = ["street", "number", "district", "city", "state", "postalCode", "country"]; // Corrigido para incluir os campos obrigatórios

    for (const field of requiredFields) {
        if (!params[field]) {
            return `Campo obrigatório ausente: ${field}`;
        }
    }
    
    return null; // Retorna `null` se estiver tudo certo
}

// Exportando todas as funções corretamente
module.exports = { isValidPhoneNumber, isValidAddress };
