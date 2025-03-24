document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-button");
  
    if (!logoutBtn) return;
  
    logoutBtn.addEventListener("click", async () => {
      const sessionToken = localStorage.getItem("sessionToken");
  
      if (!sessionToken) {
        alert("Nenhum usuário logado.");
        return;
      }
  
      try {
        const response = await fetch("https://parseapi.back4app.com/functions/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "N1NHQ0pZoF6c9SW1rsb7R5fhhPv5lHYFV3PsuWUe",
            "X-Parse-REST-API-Key": "AP4V9MLECbJZJcrBTPT9DXZ7be6OESA630S1f2Qr",
            "X-Parse-Session-Token": sessionToken
          }
        });
  
        const data = await response.json();
  
        if (response.ok) {
          localStorage.removeItem("sessionToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
  
          window.location.href = "login.html";
        } else {
          alert(data.error || "Erro ao fazer logout.");
        }
      } catch (error) {
        console.error("Erro ao chamar o logout:", error);
        alert("Falha na comunicação com o servidor.");
      }
    });
  });
  