import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  listMahasiswa: any[] = [];
  listMahasiswaFiltered: any[] = [];
  
  // Form variables
  inputNim = '';
  inputNama = '';
  inputProdi = '';
  inputJenisKelamin = '';
  
  idEdit: number | null = null;

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // Load data dari backend
  loadData() {
    this.api.getMahasiswa().subscribe({
      next: (res) => {
        this.listMahasiswa = res;
        this.listMahasiswaFiltered = res;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.tampilkanToast('Gagal memuat data!', 'danger');
      }
    });
  }

  // Live Search
  filterData(event: any) {
    const searchValue = event.target.value.toLowerCase();
    
    if (!searchValue) {
      this.listMahasiswaFiltered = this.listMahasiswa;
      return;
    }
    
    this.listMahasiswaFiltered = this.listMahasiswa.filter(mhs => 
      mhs.nama.toLowerCase().includes(searchValue) ||
      mhs.nim.toLowerCase().includes(searchValue) ||
      mhs.jurusan.toLowerCase().includes(searchValue)
    );
  }

  // Pull to Refresh
  handleRefresh(event: any) {
    this.api.getMahasiswa().subscribe({
      next: (res) => {
        this.listMahasiswa = res;
        this.listMahasiswaFiltered = res;
        event.target.complete();
        this.tampilkanToast('Data berhasil diperbarui!', 'success');
      },
      error: (err) => {
        event.target.complete();
        this.tampilkanToast('Gagal refresh data!', 'danger');
      }
    });
  }

  // Simpan data (CREATE atau UPDATE)
  simpanData() {
    // Validasi
    if (!this.inputNim || !this.inputNama || !this.inputProdi || !this.inputJenisKelamin) {
      this.tampilkanToast('Semua field harus diisi!', 'warning');
      return;
    }

    const data = {
      nim: this.inputNim,
      nama: this.inputNama,
      jurusan: this.inputProdi,
      jenis_kelamin: this.inputJenisKelamin
    };

    if (this.idEdit) {
      // Mode EDIT
      this.api.updateMahasiswa(this.idEdit, data).subscribe({
        next: () => {
          this.tampilkanToast('Data berhasil diupdate!', 'success');
          this.resetForm();
          this.loadData();
        },
        error: (err) => {
          const errorMsg = err.error?.error || 'Terjadi kesalahan!';
          this.tampilkanToast(errorMsg, 'danger');
        }
      });
    } else {
      // Mode TAMBAH
      this.api.tambahMahasiswa(data).subscribe({
        next: () => {
          this.tampilkanToast('Data berhasil ditambahkan!', 'primary');
          this.resetForm();
          this.loadData();
        },
        error: (err) => {
          const errorMsg = err.error?.error || 'Terjadi kesalahan!';
          this.tampilkanToast(errorMsg, 'danger');
        }
      });
    }
  }

  // Edit data (auto-fill form)
  editData(mhs: any) {
    this.idEdit = mhs.id;
    this.inputNim = mhs.nim;
    this.inputNama = mhs.nama;
    this.inputProdi = mhs.jurusan;
    this.inputJenisKelamin = mhs.jenis_kelamin;
    
    // Scroll ke atas
    const content = document.querySelector('ion-content');
    content?.scrollToTop(500);
  }

  // Reset form
  resetForm() {
    this.idEdit = null;
    this.inputNim = '';
    this.inputNama = '';
    this.inputProdi = '';
    this.inputJenisKelamin = '';
  }

  // Konfirmasi hapus dengan Alert
  async konfirmasiHapus(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus',
      message: 'Yakin ingin menghapus data ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          role: 'confirm',
          handler: () => {
            this.api.deleteMahasiswa(id).subscribe({
              next: () => {
                this.tampilkanToast('Data berhasil dihapus!', 'danger');
                this.loadData();
              },
              error: () => {
                this.tampilkanToast('Gagal menghapus data!', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // Toast notification
  async tampilkanToast(pesan: string, warna: string) {
    const toast = await this.toastCtrl.create({
      message: pesan,
      duration: 2000,
      color: warna,
      position: 'bottom'
    });
    await toast.present();
  }
}