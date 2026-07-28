/**
 * Data referensi guru dari JadwalGuruABBS.
 * Mapping email (username dari LMS) → displayName (nama dari jadwalguruabbs).
 * Nama diambil dari repo jadwalguruabbs agar konsisten dengan jadwal mengajar.
 */
const TEACHER_NAMES = {
  // Guru yang sudah ada di chat app
  "muamar.fariq@examfilq.dev": "Muamar Fariq Salafy",
  "andi.wijayanto@examfilq.dev": "Andi Wijayanto",
  "muhammad.fahmi@examfilq.dev": "Muhammad Fahmi Aziz",
  "amien.nur@examfilq.dev": "Amien Nur Wicaksono",
  "sharih.shadri@examfilq.dev": "Sharih Abdan Syakuran",
  "siti.khoimah@examfilq.dev": "Khoirunnisa Khoim",
  "yona.puspa@examfilq.dev": "Yona Kurnia",
  "adila.rahmah@examfilq.dev": "Dila Nuha Aldila",
  "daffa.danendra@examfilq.dev": "Daffa Danendra Rizqi Nugraha",
  "iin.indah@examfilq.dev": "Iin Indah Saputri",

  // Guru 7C yang belum ada di chat app (akan ditambahkan nanti)
  // "ifan.destya@examfilq.dev": "Ifan Destya Adi Tama",
  // "arfian.moneter@examfilq.dev": "Arfian Moneter Pratama",
  // "ida.aryani@examfilq.dev": "Ida Aryani S",
};

export default TEACHER_NAMES;
