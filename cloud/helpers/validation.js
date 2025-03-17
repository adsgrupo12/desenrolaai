function isValidPhoneNumber(phoneNumber) {
    // Remove caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Verifica se o número tem 10 ou 11 dígitos (com ou sem DDD)
    return /^(\d{10}|\d{11})$/.test(cleaned);
}

module.exports = { isValidPhoneNumber };
