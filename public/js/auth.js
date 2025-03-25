// auth.js

// Salva os dados do usuário no localStorage
function salvarSessao(dadosUsuario) {
    localStorage.setItem("sessionToken", dadosUsuario.sessionToken);
    localStorage.setItem("userId", dadosUsuario.objectId);
    localStorage.setItem("fullName", dadosUsuario.fullName);
}

// Redireciona para página principal após login
function redirecionarParaHome() {
    window.location.href = "home.html";
}

async function realizarLogin(email, password) {
    const alertMessage = document.getElementById("alert-message");
  
    if (!email || !password) {
      alertMessage.textContent = "Usuário e senha são obrigatórios.";
      alertMessage.className = "alert alert-danger";
      return;
    }
  
    try {
      const response = await fetch("https://parseapi.back4app.com/functions/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           "X-Parse-Application-Id": "N1NHQ0pZoF6c9SW1rsb7R5fhhPv5lHYFV3PsuWUe",
           "X-Parse-REST-API-Key": "AP4V9MLECbJZJcrBTPT9DXZ7be6OESA630S1f2Qr"
        },
        body: JSON.stringify({
          username: email, // <- aqui é o segredo
          password: password,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer login.");
      }
  
      // Salvar sessão
      localStorage.setItem("sessionToken", result.result.sessionToken);
      localStorage.setItem("userId", result.result.objectId);
      localStorage.setItem("fullName", result.result.fullName);
  
      window.location.href = "home.html";
    } catch (error) {
      alertMessage.textContent = error.message;
      alertMessage.className = "alert alert-danger";
    }
  }
  