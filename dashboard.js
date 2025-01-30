
// Menyimpan rincian pesanan
let orders = [];

// Fungsi untuk memperbarui rincian pesanan di tabel
function updateOrderDetails() {
    const tableBody = document.getElementById("order-details");
    tableBody.innerHTML = "";

    let total = 0;

    orders.forEach((order, index) => {
        const subtotal = order.harga * order.jumlah;
        total += subtotal;

        const row = `
            <tr>
                <td class="px-4 py-2">${order.menu}</td>
                <td class="px-4 py-2">Rp ${order.harga.toLocaleString()}</td>
                <td class="px-4 py-2">
                    <input type="number" min="1" value="${order.jumlah}" class="w-16 border rounded-md text-center"
                        onchange="updateQuantity(${index}, this.value)">
                </td>
                <td class="px-4 py-2">Rp ${subtotal.toLocaleString()}</td>
                <td class="px-4 py-2">
                    <button class="text-red-500 hover:underline" onclick="removeOrder(${index})">Hapus</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById("total").value = total.toFixed(2);
}

// Fungsi untuk menambahkan pesanan
function addOrder(menu, harga) {
    const existingOrder = orders.find(order => order.menu === menu);

    if (existingOrder) {
        existingOrder.jumlah++;
    } else {
        orders.push({ menu, harga, jumlah: 1 });
    }
    updateOrderDetails();
}

// Fungsi untuk memperbarui jumlah pesanan
function updateQuantity(index, jumlah) {
    orders[index].jumlah = parseInt(jumlah) || 1;
    updateOrderDetails();
}

// Fungsi untuk menghapus pesanan
function removeOrder(index) {
    orders.splice(index, 1);
    updateOrderDetails();
}

// Event listener untuk memilih menu
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
        const menu = item.getAttribute("data-menu");
        const harga = parseInt(item.getAttribute("data-harga"));
        addOrder(menu, harga);
    });
});

// Form submit
const form = document.getElementById("sheetdb-form");
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const menuList = orders.map(order => order.menu).join(", "); // Gabungkan nama menu dengan koma
    const formData = new FormData();
    formData.append("data[Tanggal]", document.getElementById("tanggal").value);
    formData.append("data[Nama]", document.getElementById("nama").value);
    formData.append("data[Menu]", menuList);
    formData.append("data[Total]", parseInt(document.getElementById("total").value));

    fetch(form.action, {
        method: "POST",
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        alert("Data berhasil ditambahkan!");
        console.log("Response:", data);
        orders = []; // Reset pesanan setelah sukses
        updateOrderDetails();
        form.reset();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Gagal mengirim data. Silakan coba lagi.");
    });
});


const SHEETDB_URL = "https://sheetdb.io/api/v1/hwq4sltaz3xba";
let rowsPerPage = window.innerWidth < 768 ? 7 : 15;
let currentPage = 1;
let totalPages = 1;
let allData = [];

function fetchData() {
    fetch(SHEETDB_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Gagal mengambil data");
            }
            return response.json();
        })
        .then((data) => {
            allData = data;
            applyFilters();
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Gagal mengambil data. Silakan coba lagi.");
        });
}

function applyFilters() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    
    let filteredData = allData;
    if (startDate && endDate) {
        filteredData = allData.filter(row => {
            const rowDate = new Date(row.Tanggal);
            return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
        });
    }
    
    totalPages = Math.ceil(filteredData.length / rowsPerPage);
    currentPage = 1;
    renderTable(filteredData);
    updatePagination(filteredData);
}

function renderTable(data) {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rows = data.slice(start, end);

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="border px-4 py-2">${row.Tanggal || "-"}</td>
            <td class="border px-4 py-2">${row.Menu || "-"}</td>
            <td class="border px-4 py-2">${row.Total || "-"}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function updatePagination(data) {
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    const pageNumber = document.getElementById("pageNumber");

    pageNumber.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(data);
            updatePagination(data);
        }
    };

    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(data);
            updatePagination(data);
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
    document.getElementById("startDate").addEventListener("change", applyFilters);
    document.getElementById("endDate").addEventListener("change", applyFilters);
    
    window.addEventListener("resize", () => {
        rowsPerPage = window.innerWidth < 768 ? 10 : 5;
        fetchData();
    });
});

var pengeluaranForm = document.getElementById("pengeluaran-form");

pengeluaranForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Mencegah reload halaman
    fetch(pengeluaranForm.action, {
        method: "POST",
        body: new FormData(pengeluaranForm),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => {
        alert("Pengeluaran berhasil ditambahkan!");
        pengeluaranForm.reset(); // Reset form setelah berhasil
        console.log("Response:", data);
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("Gagal mengirim data pengeluaran. Silakan coba lagi.");
    });
});

document.addEventListener("DOMContentLoaded", fetchData);

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.add("hidden"));

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 768) {
        sidebar.classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showPage("inputPesanan");

    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");
    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
    });
});

// URL SheetDB untuk Penjualan dan Pengeluaran (ganti dengan URL Anda)
const SHEETDB_PENJUALAN_URL = "https://sheetdb.io/api/v1/hwq4sltaz3xba";
const SHEETDB_PENGELUARAN_URL = "https://sheetdb.io/api/v1/hwq4sltaz3xba";

// Fungsi untuk menghitung pendapatan harian
async function hitungPendapatanHarian() {
    const tanggalInput = document.getElementById("tanggalHarian").value;
    const pendapatanHarianEl = document.getElementById("pendapatanHarian");

    if (!tanggalInput) {
        pendapatanHarianEl.textContent = "Harap pilih tanggal!";
        return;
    }

    try {
        // Fetch data dari kedua API
        const [penjualanResponse, pengeluaranResponse] = await Promise.all([
            fetch(SHEETDB_PENJUALAN_URL),
            fetch(SHEETDB_PENGELUARAN_URL)
        ]);

        const penjualanData = await penjualanResponse.json();
        const pengeluaranData = await pengeluaranResponse.json();

        // Hitung total penjualan dan pengeluaran pada tanggal tertentu
        const totalPenjualan = penjualanData
            .filter(item => item.Tanggal === tanggalInput)
            .reduce((sum, item) => sum + parseFloat(item.Total || 0), 0);

        const totalPengeluaran = pengeluaranData
            .filter(item => item.Tanggal === tanggalInput)
            .reduce((sum, item) => sum + parseFloat(item.Total || 0), 0);

        // Hitung pendapatan (Penjualan - Pengeluaran)
        const pendapatan = totalPenjualan - totalPengeluaran;

        // Tampilkan hasil
        pendapatanHarianEl.textContent = `Rp ${pendapatan.toLocaleString("id-ID")}`;
    } catch (error) {
        pendapatanHarianEl.textContent = "Gagal menghitung pendapatan harian.";
        console.error(error);
    }
}

// Fungsi untuk menghitung pendapatan bulanan
async function hitungPendapatanBulanan() {
    const bulanInput = document.getElementById("bulanPendapatan").value;
    const pendapatanBulananEl = document.getElementById("pendapatanBulanan");

    if (!bulanInput) {
        pendapatanBulananEl.textContent = "Harap pilih bulan!";
        return;
    }

    try {
        // Fetch data dari kedua API
        const [penjualanResponse, pengeluaranResponse] = await Promise.all([
            fetch(SHEETDB_PENJUALAN_URL),
            fetch(SHEETDB_PENGELUARAN_URL)
        ]);

        const penjualanData = await penjualanResponse.json();
        const pengeluaranData = await pengeluaranResponse.json();

        // Hitung total penjualan dan pengeluaran untuk bulan tertentu
        const totalPenjualan = penjualanData
            .filter(item => item.Tanggal && item.Tanggal.startsWith(bulanInput))
            .reduce((sum, item) => sum + parseFloat(item.Total || 0), 0);

        const totalPengeluaran = pengeluaranData
            .filter(item => item.Tanggal && item.Tanggal.startsWith(bulanInput))
            .reduce((sum, item) => sum + parseFloat(item.Nominal || 0), 0);

        // Hitung pendapatan (Penjualan - Pengeluaran)
        const pendapatan = totalPenjualan - totalPengeluaran;

        // Tampilkan hasil
        pendapatanBulananEl.textContent = `Rp ${pendapatan.toLocaleString("id-ID")}`;
    } catch (error) {
        pendapatanBulananEl.textContent = "Gagal menghitung pendapatan bulanan.";
        console.error(error);
    }
}



const apiPenjualan = "https://sheetdb.io/api/v1/hwq4sltaz3xba";
const apiPengeluaran = "https://sheetdb.io/api/v1/hwq4sltaz3xba";
let chart;

// Fungsi untuk mengganti halaman
function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach((page) => page.classList.add("hidden"));
    document.getElementById(pageId).classList.remove("hidden");
}

// Fungsi untuk memuat data grafik
async function loadChartData() {
    const dataType = document.getElementById("dataSelector").value;
    const selectedMonth = document.getElementById("bulanChart").value;

    if (!selectedMonth) {
        alert("Silakan pilih bulan terlebih dahulu.");
        return;
    }

    const yearMonth = selectedMonth.split("-");
    const year = yearMonth[0];
    const month = yearMonth[1];

    let labels = [];
    let data = [];

    if (dataType === "penjualan") {
        const response = await fetch(apiPenjualan);
        const penjualan = await response.json();

        const filtered = penjualan.filter(item => {
            const date = new Date(item.Tanggal);
            return date.getFullYear() == year && date.getMonth() + 1 == month;
        });

        const grouped = filtered.reduce((acc, item) => {
            if (!acc[item.Tanggal]) {
                acc[item.Tanggal] = 0;
            }
            acc[item.Tanggal] += Number(item.Total || 0);
            return acc;
        }, {});

        labels = Object.keys(grouped).sort();
        data = labels.map(label => grouped[label]);
    } else if (dataType === "penghasilan") {
        const penjualanResponse = await fetch(apiPenjualan);
        const pengeluaranResponse = await fetch(apiPengeluaran);

        const penjualan = await penjualanResponse.json();
        const pengeluaran = await pengeluaranResponse.json();

        const penjualanFiltered = penjualan.filter(item => {
            const date = new Date(item.Tanggal);
            return date.getFullYear() == year && date.getMonth() + 1 == month;
        });

        const pengeluaranFiltered = pengeluaran.filter(item => {
            const date = new Date(item.Tanggal);
            return date.getFullYear() == year && date.getMonth() + 1 == month;
        });

        const groupedPenjualan = penjualanFiltered.reduce((acc, item) => {
            if (!acc[item.Tanggal]) {
                acc[item.Tanggal] = 0;
            }
            acc[item.Tanggal] += Number(item.Total || 0);
            return acc;
        }, {});

        labels = Object.keys(groupedPenjualan).sort();

        labels.forEach(date => {
            const totalPenjualan = groupedPenjualan[date] || 0;
            const totalPengeluaran = pengeluaranFiltered
                .filter(item => item.Tanggal === date)
                .reduce((sum, item) => sum + Number(item.Nominal || 0), 0);

            // Penghasilan dapat bernilai negatif jika pengeluaran lebih besar
            data.push(totalPenjualan - totalPengeluaran);
        });
    }

    renderChart(labels, data, dataType);
}



// Fungsi untuk merender grafik menggunakan Chart.js
function renderChart(labels, data, type) {
    const ctx = document.getElementById("chartCanvas").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: type === "penjualan" ? "Penjualan" : "Penghasilan",
                data: data,
                backgroundColor: "rgba(99, 102, 241, 0.2)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Grafik akan menyesuaikan container
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
            },
        },
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.add("hidden"));

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    // Menghapus kelas 'bg-indigo-800' dari semua tombol menu
    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.remove("bg-indigo-800");
    });

    // Menambahkan kelas 'bg-indigo-800' ke tombol menu yang aktif
    const activeMenu = document.getElementById(`menu-${pageId}`);
    if (activeMenu) {
        activeMenu.classList.add("bg-indigo-800");
    }

    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 768) {
        sidebar.classList.add("hidden");
    }
}

// Panggil fungsi ini setelah DOM dimuat untuk memastikan halaman awal sudah di-highlight
document.addEventListener("DOMContentLoaded", () => {
    showPage("inputPesanan"); // Set halaman awal yang aktif
});

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.add("hidden"));

    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    // Menghapus kelas 'bg-indigo-800' dari semua tombol menu
    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.remove("bg-indigo-800");
    });

    // Menambahkan kelas 'bg-indigo-800' ke tombol menu yang aktif
    const activeMenu = document.getElementById(`menu-${pageId}`);
    if (activeMenu) {
        activeMenu.classList.add("bg-indigo-800");
    }

    // Panggil fungsi untuk refresh atau fetch data setiap kali berganti menu
    if (pageId === "inputPesanan") {
        fetchData(); // Refresh data untuk menu Input Pesanan
    } else if (pageId === "lihatPenjualan") {
        fetchData(); // Atau fungsi lain yang diperlukan untuk menu ini
    }

    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 768) {
        sidebar.classList.add("hidden");
    }
}
