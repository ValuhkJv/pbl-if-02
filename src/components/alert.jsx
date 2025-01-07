// Code to display alert messages
import Swal from "sweetalert2";

const Alert = {
  success: (title, text) => {
    Swal.fire({
      title: title || "Berhasil!",
      text: text || "Operasi berhasil dilakukan.",
      icon: "success",
      confirmButtonText: "OK",
    });
  },
  error: (title, text) => {
    Swal.fire({
      title: title || "Gagal!",
      text: text || "Terjadi kesalahan.",
      icon: "error",
      confirmButtonText: "Coba Lagi",
    });
  },
  warning: (title, text) => {
    Swal.fire({
      title: title || "Peringatan!",
      text: text || "Harap periksa kembali data Anda.",
      icon: "warning",
      confirmButtonText: "Mengerti",
    });
  },
  // Menambahkan Toast untuk sukses
  successToast: (title) => {
    Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    }).fire({
      icon: "success",
      title: title || "Signed in successfully",
    });
  },
  // Menambahkan konfirmasi dialog sebelum menghapus
  confirmDelete: (onConfirm) => {
    Swal.fire({
      title: "Apakah anda yakin ingin menghapus?",
      text: "Anda tidak akan bisa mengembalikannya!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Callback untuk melakukan aksi penghapusan
        if (typeof onConfirm === "function") {
          onConfirm();
        }
        Swal.fire({
          title: "Deleted!",
          text: "File anda telah terhapus.",
          icon: "success",
        });
      }
    });
  },
  confirmCancel: (onConfirm) => {
    Swal.fire({
      title: "Batalkan Peminjaman?",
      text: "Anda yakin ingin membatalkan peminjaman ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, batalkan!",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        if (typeof onConfirm === "function") {
          onConfirm();
        }
      }
    });
  }
};
export default Alert;
