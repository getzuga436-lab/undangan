document.addEventListener("DOMContentLoaded", function () {
    const elemenAnimasi = document.querySelectorAll('.animasi-scroll');

    const opsi = {
        root: document.querySelector('.right-side'),
        rootMargin: "0px 0px -70px 0px", // trigger 80px sebelum batas bawah
        threshold: 0.15
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('muncul');    // → masuk: fade naik
            } else {
                entry.target.classList.remove('muncul'); // → keluar: fade turun balik
            }
            // ❌ Tidak ada unobserve() agar terus dipantau
        });
    }, opsi);

    elemenAnimasi.forEach(el => observer.observe(el));
});