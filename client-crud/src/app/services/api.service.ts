import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/mahasiswa';

  constructor(private http: HttpClient) { }

  // GET - Ambil semua data
  getMahasiswa(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // POST - Tambah data baru
  tambahMahasiswa(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // PUT - Update data
  updateMahasiswa(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // DELETE - Hapus data
  deleteMahasiswa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}