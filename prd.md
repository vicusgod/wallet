Ringkasan Aplikasi: Personal Finance Wallet

Dokumen ini merangkum ide, fitur, alur pengguna, dan desain database untuk aplikasi pencatat keuangan pribadi (Personal Finance Wallet).

1. Ringkasan & Tujuan Aplikasi

Nama Ide Aplikasi: (Misal: "DompetKu", "CatatUang", "FinTrackID")

Tujuan Utama:
Aplikasi ini bertujuan untuk menjadi alat bantu yang sederhana dan intuitif bagi pengguna untuk mencatat, melacak, dan menganalisis pemasukan serta pengeluaran mereka. Fokus utamanya adalah memberikan kesadaran finansial (financial awareness) dengan visualisasi data yang mudah dipahami.

Target Pengguna:
Individu (pelajar, mahasiswa, pekerja) yang ingin mengelola keuangan pribadi mereka dengan lebih baik, memantau pengeluaran harian, dan mengatur anggaran (budgeting) bulanan.

2. Fitur Utama (Core Features)

Berikut adalah fitur-fitur esensial yang akan dibangun:

Autentikasi Pengguna:

Registrasi (Email/Password, Google Sign-in).

Login & Logout.

Reset Password.

Manajemen Dompet (Wallet):

Membuat lebih dari satu dompet (misal: "Dompet Pribadi", "Dompet Usaha", "Tabungan").

Setiap dompet memiliki saldo awal dan mata uang (misal: IDR).

Saldo dompet akan ter-update secara otomatis setiap ada transaksi baru.

Pencatatan Transaksi:

Menambah transaksi Pemasukan (Income) dan Pengeluaran (Expense).

Input data: Jumlah (Amount), Tanggal, Kategori, Catatan/Deskripsi, dan Dompet mana yang digunakan.

Edit dan Hapus transaksi yang sudah ada.

Manajemen Kategori:

Menyediakan kategori default (misal: Makanan, Transportasi, Tagihan, Gaji).

Pengguna bisa menambah, mengedit, atau menghapus kategori kustom mereka sendiri.

Setiap kategori memiliki tipe (Pemasukan atau Pengeluaran).

Budgeting (Anggaran):

Pengguna dapat mengatur batas anggaran (budget limit) bulanan untuk kategori pengeluaran tertentu (misal: Budget "Makanan" Rp 2.000.000/bulan).

Melacak progres pengeluaran terhadap budget yang telah ditetapkan.

Dashboard & Laporan:

Dashboard Utama: Menampilkan ringkasan total saldo, total pemasukan, dan total pengeluaran bulan ini.

Grafik Pie Chart: Visualisasi persentase pengeluaran berdasarkan kategori.

Grafik Bar Chart: Perbandingan pemasukan vs. pengeluaran selama 6 bulan terakhir.

Riwayat Transaksi: Daftar semua transaksi dengan fitur filter (per tanggal, per kategori, per dompet).

3. Alur Aplikasi (User Flow)

Berikut adalah alur dasar penggunaan aplikasi dari perspektif pengguna:

Onboarding & Setup Awal:

User membuka aplikasi -> Melakukan Registrasi atau Login.

Saat login pertama kali, user diminta membuat Dompet pertama (misal: "Dompet Utama") dan memasukkan saldo awal (jika ada).

Aplikasi sudah menyediakan Kategori Default.

Mencatat Transaksi Harian:

User berada di Dashboard.

User menekan tombol "Tambah Transaksi" (+).

User memilih tipe: Pengeluaran atau Pemasukan.

User memasukkan Jumlah (misal: 50000).

User memilih Kategori (misal: "Makanan & Minuman").

User memilih Dompet (misal: "Dompet Utama").

User (opsional) menambahkan Catatan (misal: "Makan siang di warteg").

User menekan "Simpan".

Aplikasi menyimpan data, lalu saldo di "Dompet Utama" otomatis berkurang 50000.

Dashboard me-refresh data (total pengeluaran bertambah).

Review Mingguan/Bulanan:

User membuka menu "Laporan" atau "Dashboard".

User melihat ringkasan bulan ini.

User melihat Grafik Pie Chart dan menyadari bahwa 40% pengeluaran habis untuk "Makanan & Minuman".

User membuka menu "Budget".

User melihat bahwa budget "Makanan & Minuman" (Rp 2jt) sudah terpakai Rp 1.8jt (90%), padahal baru pertengahan bulan.

User mendapat insight untuk lebih hemat.

4. Skema Database (PostgreSQL)

Berikut adalah draf skema database menggunakan sintaks PostgreSQL. Skema ini menormalisasi data untuk menghindari redundansi dan menjaga integritas data.

-- Ekstensi untuk menghasilkan UUID (Primary Key yang lebih modern)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel 1: Pengguna (Users)
-- Menyimpan data login pengguna
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabel 2: Dompet (Wallets)
-- Setiap pengguna bisa memiliki banyak dompet
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'IDR',
    -- Saldo saat ini akan di-update oleh logic aplikasi (trigger atau backend)
    -- setiap kali ada transaksi baru.
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- User tidak boleh punya nama dompet yang sama
    UNIQUE(user_id, name)
);

-- Tabel 3: Kategori (Categories)
-- Kategori untuk transaksi, bisa default (user_id IS NULL) atau kustom
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Jika user_id NULL, ini adalah kategori default (milik sistem)
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    -- Tipe kategori: 'expense' (pengeluaran) atau 'income' (pemasukan)
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    
    -- User tidak boleh punya nama kategori & tipe yang sama
    -- (nulls_not_distinct untuk handle user_id yang NULL)
    UNIQUE(user_id, name, type)
);

-- Tabel 4: Transaksi (Transactions)
-- Ini adalah tabel inti yang mencatat semua pergerakan uang
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    -- Jika kategori dihapus, set ke NULL (Uncategorized)
    category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
    
    -- Jumlah selalu positif. Tipe (income/expense) ditentukan oleh kategori.
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabel 5: Anggaran (Budgets)
-- Menyimpan data budget bulanan per kategori per dompet
CREATE TABLE budgets (
    budget_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    -- Budget harus terkait dengan kategori 'expense'
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    
    -- Jumlah batas anggaran
    amount_limit DECIMAL(15, 2) NOT NULL,
    
    -- Periode budget (misal: bulan 11, tahun 2025)
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Hanya boleh ada 1 budget per kategori/dompet/bulan/tahun
    UNIQUE(wallet_id, category_id, month, year)
);

-- --- INDEXES ---
-- Membuat index untuk mempercepat query (SELECT)
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_budgets_wallet_period ON budgets(wallet_id, month, year);
CREATE INDEX idx_categories_user ON categories(user_id);
