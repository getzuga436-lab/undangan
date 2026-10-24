document.addEventListener("DOMContentLoaded", function () {
    const ambilKonten = function (jalur) {
        return jalur.split(".").reduce(function (nilai, bagian) {
            return nilai == null ? undefined : nilai[bagian];
        }, window.kontenUndangan);
    };

    document.querySelectorAll("[data-konten]").forEach(function (elemen) {
        const nilai = ambilKonten(elemen.dataset.konten);
        if (Array.isArray(nilai)) {
            elemen.replaceChildren();
            nilai.forEach(function (baris, index) {
                if (index > 0) {
                    elemen.appendChild(document.createElement("br"));
                }
                elemen.appendChild(document.createTextNode(baris));
            });
        } else if (typeof nilai === "string") {
            elemen.textContent = nilai;
        } else {
            throw new Error("Konten undangan tidak ditemukan: " + elemen.dataset.konten);
        }
    });

    document.querySelectorAll("[data-konten-href]").forEach(function (elemen) {
        const nilai = ambilKonten(elemen.dataset.kontenHref);
        if (typeof nilai !== "string") {
            throw new Error("URL konten undangan tidak ditemukan: " + elemen.dataset.kontenHref);
        }
        elemen.href = nilai;
    });

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
    const openingVideo = document.querySelector(".video-mempelai");
    let videoDimulai = false;
    
    // PERBAIKAN: Ubah "cover" menjadi "welcomeCover" agar sesuai dengan ID di HTML
    const cover = document.getElementById("welcomeCover"); 
    const rightSide = document.getElementById("rightSide");

    // --- Logika Buka Undangan Premium ---
    if (btnBuka) {
        btnBuka.addEventListener("click", function () {
            if (cover) {
                cover.classList.add("terbuka");
            }

            if (openingVideo) {
                videoDimulai = true;
                openingVideo.currentTime = 0;
                openingVideo.play().catch(function (error) {
                    console.error("Video pembuka gagal diputar:", error);
                });
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

    if (openingVideo) {
        const videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    openingVideo.pause();
                } else if (videoDimulai && openingVideo.paused) {
                    openingVideo.play().catch(function (error) {
                        console.error("Video pembuka gagal dilanjutkan:", error);
                    });
                }
            });
        }, {
            root: rightSide,
            threshold: 0.1
        });

        videoObserver.observe(openingVideo);
    }

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
let zoomScale = 1;
let zoomOffsetX = 0;
let zoomOffsetY = 0;
const zoomPointers = new Map();
let pinchStartDistance = 0;
let pinchStartScale = 1;
let panStartX = 0;
let panStartY = 0;
let panStartOffsetX = 0;
let panStartOffsetY = 0;
let swipeStartX = 0;
let swipeStartScale = 1;
let wasPinching = false;

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
        resetZoom();
        
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
        resetZoom();

        // 4. Hilangkan kelas animasi agar gambar kembali muncul mulus (fade-in)
        modalImage.classList.remove("ganti-slide");
    }, 150); // Jeda waktu 150 milidetik agar transisinya pas dan natural
}

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("imageModal");
    const modalBody = document.querySelector("#imageModal .modal-body");
    const modalImage = document.getElementById("modalImage");

    if (modalBody && modalImage) {
        modalImage.addEventListener("wheel", function (event) {
            event.preventDefault();
            ubahZoom(event.deltaY < 0 ? 0.25 : -0.25);
        }, { passive: false });

        modalImage.addEventListener("dblclick", function () {
            if (zoomScale > 1) {
                resetZoom();
            } else {
                setZoom(2);
            }
        });

        modalImage.addEventListener("pointerdown", function (event) {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            event.preventDefault();
            modalImage.setPointerCapture(event.pointerId);
            zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (zoomPointers.size === 1) {
                swipeStartX = event.clientX;
                swipeStartScale = zoomScale;
                panStartX = event.clientX;
                panStartY = event.clientY;
                panStartOffsetX = zoomOffsetX;
                panStartOffsetY = zoomOffsetY;
                wasPinching = false;
            } else if (zoomPointers.size === 2) {
                const [first, second] = zoomPointers.values();
                pinchStartDistance = Math.hypot(second.x - first.x, second.y - first.y);
                pinchStartScale = zoomScale;
                wasPinching = true;
            }
        });

        modalImage.addEventListener("pointermove", function (event) {
            if (!zoomPointers.has(event.pointerId)) return;
            zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (zoomPointers.size >= 2) {
                const [first, second] = zoomPointers.values();
                const distance = Math.hypot(second.x - first.x, second.y - first.y);
                if (pinchStartDistance > 0) {
                    setZoom(pinchStartScale * distance / pinchStartDistance);
                }
            } else if (zoomScale > 1) {
                const pointer = zoomPointers.get(event.pointerId);
                zoomOffsetX = panStartOffsetX + pointer.x - panStartX;
                zoomOffsetY = panStartOffsetY + pointer.y - panStartY;
                renderZoom();
            }
        });

        const endPointer = function (event) {
            if (!zoomPointers.has(event.pointerId)) return;
            const pointer = { x: event.clientX, y: event.clientY };
            zoomPointers.set(event.pointerId, pointer);
            zoomPointers.delete(event.pointerId);

            if (zoomPointers.size === 1) {
                const remaining = zoomPointers.values().next().value;
                panStartX = remaining.x;
                panStartY = remaining.y;
                panStartOffsetX = zoomOffsetX;
                panStartOffsetY = zoomOffsetY;
            } else if (zoomPointers.size === 0) {
                if (!wasPinching && swipeStartScale <= 1 && zoomScale <= 1 &&
                    Math.abs(pointer.x - swipeStartX) > 50) {
                    geserFoto(pointer.x < swipeStartX ? 1 : -1);
                }
                pinchStartDistance = 0;
            }
        };

        modalImage.addEventListener("pointerup", endPointer);
        modalImage.addEventListener("pointercancel", endPointer);
    }

    if (modal) {
        modal.addEventListener("hidden.bs.modal", resetZoom);
        modal.addEventListener("keydown", function (event) {
            if (event.key === "+" || event.key === "=") {
                event.preventDefault();
                ubahZoom(0.25);
            } else if (event.key === "-") {
                event.preventDefault();
                ubahZoom(-0.25);
            } else if (event.key === "0") {
                resetZoom();
            }
        });
    }
});

function ubahZoom(perubahan) {
    setZoom(zoomScale + perubahan);
}

function setZoom(skala) {
    zoomScale = Math.min(4, Math.max(1, skala));
    if (zoomScale === 1) {
        zoomOffsetX = 0;
        zoomOffsetY = 0;
    }
    renderZoom();
}

function renderZoom() {
    const modalImage = document.getElementById("modalImage");
    if (!modalImage) return;

    modalImage.style.transform = `translate3d(${zoomOffsetX}px, ${zoomOffsetY}px, 0) scale(${zoomScale})`;
    modalImage.style.cursor = zoomScale > 1 ? "grab" : "zoom-in";
}

function resetZoom() {
    zoomScale = 1;
    zoomOffsetX = 0;
    zoomOffsetY = 0;
    renderZoom();
}

// UCAPAN, DOA & RSVP GABUNGAN (VERSI GOOGLE APPS SCRIPT)
document.addEventListener("DOMContentLoaded", function () {
    // 1. GANTI URL INI DENGAN URL APPS SCRIPT ANDA NANTI
    const GAS_URL = "https://script.google.com/macros/s/AKfycbx_k7EC2-ZZBWfB8PsyqJ0HFkALO1MxU8nhIjpYYgHm3K_0bP17IsIuzzYi4XR9z7E/exec"; 
    
    // Ambil nama dari parameter URL (?to=...)
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamuUrl = urlParams.get('to');
    const inputNamaPengirim = document.getElementById('namaPengirim');

    if (inputNamaPengirim) {
        if (namaTamuUrl) {
            inputNamaPengirim.value = decodeURIComponent(namaTamuUrl);
        } else {
            inputNamaPengirim.value = ""; 
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

            let nama = inputNamaPengirim ? inputNamaPengirim.value.trim() : "Tamu Undangan";
            let kehadiran = document.getElementById("rsvpStatus").value;
            let pesan = document.getElementById("pesanUcapan").value.trim();
            
            let tanggal = new Date().toLocaleDateString("id-ID", {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            if (!nama || !kehadiran || !pesan) {
                alert("Semua kolom harus diisi!");
                return;
            }

            btnKirim.disabled = true;
            btnKirim.innerText = "Mengirim...";

            // PERUBAHAN DI SINI: Menggunakan FormData agar tidak terkena blokir CORS Google
            let formData = new FormData();
            formData.append("nama", nama);
            formData.append("kehadiran", kehadiran);
            formData.append("pesan", pesan);
            formData.append("tanggal", tanggal);

            // Kirim data ke Google Sheets
            fetch(GAS_URL, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert("Terima kasih! Konfirmasi kehadiran dan ucapan Anda berhasil dikirim.");
                formGabungan.reset();
                
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

    // 3. Fungsi untuk mengambil data dari Google Sheets (GET)
    function muatUcapan() {
        if (!daftarUcapan) return;

        // Mengambil data dari GAS
        fetch(GAS_URL)
            .then(response => response.json())
            .then(data => {
                daftarUcapan.innerHTML = "";
                
                if (!data || data.length === 0) {
                    daftarUcapan.innerHTML = "<p class='text-center text-muted small'>Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>";
                    return;
                }

                // Urutkan dari yang paling baru dikirim (dibalik)
                data.reverse().forEach(item => {
                    if (!item.pesan) return; 
                    
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

    function escapeHtml(text) {
        if (text === null || text === undefined) return "";
        
        // Paksa konversi ke String agar tidak error jika menerima data angka/tanggal
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});