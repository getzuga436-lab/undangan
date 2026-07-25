document.addEventListener("DOMContentLoaded", function () {
    const btnBuka = document.getElementById("btnBuka");
    const cover = document.getElementById("cover");
    const rightSide = document.getElementById("rightSide");

    // --- Buka undangan: buka kunci scroll, tetap di halaman-1, sembunyikan tombol saja ---
    btnBuka.addEventListener("click", function () {
        rightSide.style.overflowY = "auto"; // scroll diaktifkan, tapi posisi tetap di halaman-1
        btnBuka.classList.add("hilang");     // tombol sudah tidak diperlukan lagi
    });

    // --- Animasi muncul/hilang saat scroll (punya kamu, dipertahankan) ---
    const elemenAnimasi = document.querySelectorAll(".animasi-scroll");

    const opsi = {
        root: rightSide, // penting: root harus .right-side, karena itu yang discroll (bukan window)
        rootMargin: "0px 0px -70px 0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("muncul");
            } else {
                entry.target.classList.remove("muncul");
            }
            // tidak pakai unobserve() supaya animasi bisa berulang saat scroll naik-turun
        });
    }, opsi);

    elemenAnimasi.forEach(function (el) {
        observer.observe(el);
    });
});
