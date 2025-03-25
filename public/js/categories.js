document.addEventListener("DOMContentLoaded", function() {
    fetch("https://parseapi.back4app.com/parse/functions/get-categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": "N1NHQ0pZoF6c9SW1rsb7R5fhhPv5lHYFV3PsuWUe",
            "X-Parse-REST-API-Key": "AP4V9MLECbJZJcrBTPT9DXZ7be6OESA630S1f2Qr"
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.result && data.result.categories) {
            const categoriesContainer = document.getElementById("categories-container");

            data.result.categories.forEach(category => {
                const card = document.createElement("div");
                card.className = "col-md-3 mb-4";
                card.innerHTML = `
                    <div class="card shadow-sm">
                        <img src="${category.photoUrl || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${category.name}">
                        <div class="card-body">
                            <h5 class="card-title">${category.name}</h5>
                            <p class="card-text">${category.description}</p>
                            <a href="#" class="btn btn-success">Ver anúncios</a>
                        </div>
                    </div>
                `;
                categoriesContainer.appendChild(card);
            });
        }
    })
    .catch(error => console.error("Erro ao buscar categorias:", error));
});
