const namaFotoGaleri = [
    "prewed1_result.webp",
    "prewed2_result.webp",
    "prewed3_result.webp",
    "prewed4_result.webp",
    "prewed5_result.webp",
    "prewed6_result.webp",
    "prewed7_result.webp",
    "prewed8_result.webp",
    "prewed9_result.webp",
    "prewed10_result.webp",
    "prewed11_result.webp",
    "prewed12_result.webp",
    "prewed13_result.webp",
    "prewed14_result.webp",
    "prewed15_result.webp",
    "prewed16_result.webp",
    "prewed17_result.webp"
];

function renderGaleriOtomatis(totalFoto = namaFotoGaleri.length) {
    const container = document.getElementById("galeriGrid");
    if (!container) return;

    let htmlFoto = "";
    for (const [index, namaFoto] of namaFotoGaleri.slice(0, totalFoto).entries()) {
        htmlFoto += `
            <div class="galeri-item item-${index + 1} animasi-scroll animasi-zoom" onclick="bukaModal(this)">
                <img src="img/Galeri/${namaFoto.replace("_result.webp", "_thumb.jpg")}" data-full-src="img/Galeri/${namaFoto}" alt="Prewedding ${index + 1}" loading="lazy" decoding="async">
            </div>
        `;
    }

    container.innerHTML = htmlFoto;
}

renderGaleriOtomatis();