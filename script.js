document.addEventListener("DOMContentLoaded", function () {
    // === 🛠️ SCRIPT TAMBAHAN: AMBIL NAMA DARI LINK URL ===
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    const elemenNama = document.getElementById('nama-tamu');

    if (namaTamu && elemenNama) {
        // decodeURIComponent mengubah karakter seperti %20 menjadi spasi asli
        elemenNama.innerText = decodeURIComponent(namaTamu);
    }
    // ====================================================

    const btnBuka = document.getElementById("btnBuka");
    
    // PERBAIKAN: Ubah "cover" menjadi "welcomeCover" agar sesuai dengan ID di HTML
    const cover = document.getElementById("welcomeCover"); 
    const rightSide = document.getElementById("rightSide");

    // --- Logika Buka Undangan Premium ---
    if (btnBuka) {
        btnBuka.addEventListener("click", function () {
            // Sekarang variabel 'cover' sudah sukses mengambil elemen dari HTML
            if (cover) {
                cover.classList.add("terbuka");
            }
            
            // 2. Aktifkan kemampuan scroll halaman ke bawah
            if (rightSide) {
                rightSide.style.overflowY = "auto"; 
            }
        });
    }

    // --- Animasi muncul/hilang saat scroll (Tetap dipertahankan) ---
    const elemenAnimasi = document.querySelectorAll(".animasi-scroll");
    const opsi = {
        root: rightSide,
        rootMargin: "0px 0px -80px 0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // 1. Saat elemen masuk ke layar -> TAMPILKAN (Muncul)
                    entry.target.classList.add("muncul");
                } else {
                    // 2. Saat elemen keluar dari layar, kita cek posisinya
                    // Jika "top" lebih besar dari 0, berarti elemen tersebut terdorong ke BAWAH layar (Anda men-scroll ke atas).
                    // Maka HAPUS class 'muncul' agar siap dianimasikan lagi nanti.
                    if (entry.boundingClientRect.top > 0) {
                        entry.target.classList.remove("muncul");
                    }
                    // Jika elemen keluar di ATAS layar (Anda lanjut men-scroll jauh ke bawah),
                    // class 'muncul' tidak akan dihapus, sehingga elemennya "tetap ada".
                }
            });
        }, opsi);

    elemenAnimasi.forEach(function (el) {
        observer.observe(el);
    });
});

// Variabel untuk melacak urutan foto yang sedang aktif
let currentIndex = 0;
let galeriImages = [];

document.addEventListener("DOMContentLoaded", function () {
    // Ambil semua elemen gambar yang ada di dalam galeri-grid
    const imgElements = document.querySelectorAll(".galeri-item img");
    galeriImages = Array.from(imgElements).map(img => img.src);
});

// Fungsi untuk membuka modal berdasarkan foto yang diklik
function bukaModal(element) {
    const imgElement = element.querySelector("img");
    const modalImage = document.getElementById("modalImage");
    
    if (imgElement && modalImage) {
        // Cari posisi index gambar saat ini di dalam array galeri
        currentIndex = galeriImages.indexOf(imgElement.src);
        
        // Tampilkan gambar ke modal
        modalImage.src = imgElement.src;
        
        // Tampilkan modal Bootstrap 5
        const myModal = new bootstrap.Modal(document.getElementById('imageModal'));
        myModal.show();
    }
}

// Fungsi untuk menggeser foto ke depan (+1) atau ke belakang (-1) dengan animasi halus
function geserFoto(arah) {
    const modalImage = document.getElementById("modalImage");
    if (!modalImage) return;

    // 1. Jalankan animasi keluar (fade-out / sedikit mengecil)
    modalImage.classList.add("ganti-slide");

    setTimeout(() => {
        // 2. Ubah index foto setelah animasi setengah jalan
        currentIndex += arah;

        if (currentIndex >= galeriImages.length) {
            currentIndex = 0; // Putar balik ke awal
        } else if (currentIndex < 0) {
            currentIndex = galeriImages.length - 1; // Pindah ke akhir
        }

        // 3. Ganti sumber gambar
        modalImage.src = galeriImages[currentIndex];

        // 4. Hilangkan kelas animasi agar gambar kembali muncul mulus (fade-in)
        modalImage.classList.remove("ganti-slide");
    }, 150); // Jeda waktu 150 milidetik agar transisinya pas dan natural
}

// ==========================================
// FITUR SWIPE (SENTUHAN LAYAR HP) PADA MODAL
// ==========================================
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", function () {
    const modalBody = document.querySelector("#imageModal .modal-body");

    if (modalBody) {
        // Deteksi awal sentuhan jari di layar
        modalBody.addEventListener("touchstart", function (event) {
            touchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        // Deteksi saat jari diangkat dari layar
        modalBody.addEventListener("touchend", function (event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipeGesture();
        }, { passive: true });
    }
});

// Menghitung arah geseran (kiri atau kanan)
function handleSwipeGesture() {
    const batasGeser = 50; // Minimal jarak geser dalam piksel agar terdeteksi

    if (touchEndX < touchStartX - batasGeser) {
        // Geser ke Kiri -> Tampilkan foto berikutnya (Next)
        geserFoto(1);
    } 
    if (touchEndX > touchStartX + batasGeser) {
        // Geser ke Kanan -> Tampilkan foto sebelumnya (Previous)
        geserFoto(-1);
    }
}

// UCAPAN, DOA & RSVP GABUNGAN
document.addEventListener("DOMContentLoaded", function () {
    const SHEETDB_URL = "https://sheetdb.io/api/v1/uz1s2ehtu3l54"; 
    
    // 1. Ambil nama dari parameter URL (?to=...) dan masukkan ke kotak input nama secara otomatis
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamuUrl = urlParams.get('to');
    const inputNamaPengirim = document.getElementById('namaPengirim');

    if (inputNamaPengirim) {
        if (namaTamuUrl) {
            inputNamaPengirim.value = decodeURIComponent(namaTamuUrl);
        } else {
            inputNamaPengirim.value = ""; // Kosong jika dibuka tanpa link khusus
        }
    }

    const formGabungan = document.getElementById("formGabungan");
    const daftarUcapan = document.getElementById("daftarUcapan");
    const btnKirim = document.getElementById("btnKirimSemua");

    // Muat daftar ucapan saat halaman pertama kali dibuka
    muatUcapan();

    // 2. Proses saat tombol kirim ditekan
    if (formGabungan) {
        formGabungan.addEventListener("submit", function (e) {
            e.preventDefault();

            // Mengambil data nama langsung dari kotak input yang diisi/dibaca dari URL
            let nama = inputNamaPengirim ? inputNamaPengirim.value.trim() : "Tamu Undangan";
            let kehadiran = document.getElementById("rsvpStatus").value;
            let pesan = document.getElementById("pesanUcapan").value.trim();
            
            // Format tanggal Indonesia
            let tanggal = new Date().toLocaleDateString("id-ID", {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            if (!nama || !kehadiran || !pesan) {
                alert("Semua kolom harus diisi!");
                return;
            }

            btnKirim.disabled = true;
            btnKirim.innerText = "Mengirim...";

            // Kirim data ke Google Sheets
            fetch(SHEETDB_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [
                        { 'nama': nama, 'kehadiran': kehadiran, 'pesan': pesan, 'tanggal': tanggal }
                    ]
                })
            })
            .then(response => response.json())
            .then(data => {
                alert("Terima kasih! Konfirmasi kehadiran dan ucapan Anda berhasil dikirim.");
                formGabungan.reset();
                
                // Jika ingin setelah reset nama dari URL tetap muncul kembali di kotak input:
                if (namaTamuUrl && inputNamaPengirim) {
                    inputNamaPengirim.value = decodeURIComponent(namaTamuUrl);
                }

                btnKirim.disabled = false;
                btnKirim.innerText = "Kirim Konfirmasi & Ucapan";
                muatUcapan(); // Segera perbarui daftar ucapan di layar
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Gagal mengirim data, silakan coba lagi.");
                btnKirim.disabled = false;
                btnKirim.innerText = "Kirim Konfirmasi & Ucapan";
            });
        });
    }

    // 3. Fungsi untuk mengambil data dari Google Sheets dan menampilkannya ke web
    function muatUcapan() {
        if (!daftarUcapan) return;

        fetch(SHEETDB_URL)
            .then(response => response.json())
            .then(data => {
                daftarUcapan.innerHTML = "";
                
                if (!data || data.length === 0) {
                    daftarUcapan.innerHTML = "<p class='text-center text-muted small'>Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>";
                    return;
                }

                // Urutkan dari yang paling baru dikirim (dibalik)
                data.reverse().forEach(item => {
                    if (!item.pesan) return; // Lewatkan jika baris kosong
                    
                    // Tentukan warna badge berdasarkan status kehadiran
                    let badgeWarna = 'secondary';
                    if (item.kehadiran === 'Hadir') badgeWarna = 'success';
                    else if (item.kehadiran === 'Tidak Hadir') badgeWarna = 'danger';
                    else if (item.kehadiran === 'Masih Ragu-ragu') badgeWarna = 'warning';

                    let card = document.createElement("div");
                    card.className = "card mb-2 p-3 border-0 shadow-sm";
                    card.style.backgroundColor = "#fdfbfb";
                    card.style.borderRadius = "12px";
                    card.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong style="font-size: 0.9rem; color: #333;"><i class="bi bi-person-circle"></i> ${escapeHtml(item.nama)}</strong>
                            <span class="badge bg-${badgeWarna}" style="font-size: 0.65rem;">${escapeHtml(item.kehadiran || 'Hadir')}</span>
                        </div>
                        <p class="mb-1 text-secondary" style="font-size: 0.85rem; line-height: 1.4; word-break: break-word;">${escapeHtml(item.pesan)}</p>
                        <small class="text-muted" style="font-size: 0.7rem; display: block; text-align: right;">${item.tanggal || ''}</small>
                    `;
                    daftarUcapan.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Error memuat ucapan:', error);
                daftarUcapan.innerHTML = "<p class='text-center text-danger small'>Gagal memuat daftar ucapan.</p>";
            });
    }

    // Fungsi pengaman teks agar terhindar dari script berbahaya (XSS)
    function escapeHtml(text) {
        if (!text) return "";
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
});