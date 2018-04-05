------------------------------------------------------------------------
Petunjuk menjalankan program UTS Grafkom
------------------------------------------------------------------------
Anggota:
Mohamad Harits Nur Fauzan - 1406623820 - mharitsnf@gmail.com
Rizqy Faishal Tanjung - 1406622856 - rizqyfaishal27@gmail.com

------------------------------------------------------------------------
Soal no. 1
------------------------------------------------------------------------

Buka file index.html di browser (rekomendasi menggunakan Google Chrome)

Program ini merupakan implementasi dari game tic-tac-toe, yaitu setiap
pemain harus meletakkan 3 buah piece/batu yang berurut secara mendatar
menurun, atau diagonal. Pemain terdiri dari 2 pemain yang mempunyai kesempatan
menang yang sama.

--------------------
Penjalanan Program
--------------------
- Interaksi program hanya menggunaka mouse dan keyboard (untuk input nama)
- Program pertama kali akan menanyakan nama pemain user 1
- Setelah itu, program akan menanyakan nama pemain user 2
- Jika sudah akan muncul sebuah dummy loading yaitu kotak yang berotasi selama 
 3 detik
- Setelah itu kedua pemain disuruh untuk memilih bentuk sebagai bidak/piece
 dalam permainan
- Jika sudah maka kedua pemain tinggal menyelesaikan permainan, dengan mengisi 
atau memindahkan piece dalam grid
- Jika salah satu pemain menang, maka bidak akan menampilkan animasi
- Setiap bidak mempunyai animasi masing-masing
- Game selesai

------------------------------------------------------------------------
Soal no. 2
------------------------------------------------------------------------

--------------------------------
Petunjuk include file
--------------------------------
Untuk OS Windows:

#include <GL/gl.h>
#include <GL/glut.h>

Untuk MacOSX:

#include <OpenGL/gl.h>
#include <GLUT/glut.h>

--------------------------------
Penjalanan program
--------------------------------
Program dapat dikendalikan menggunakan tombol-tombol pergerakan berikut:

W: bergerak ke atas
A: bergerak ke kiri
S: bergerak ke bawah
D: bergerak ke kanan
I: bergerak ke depan
K: bergerak ke belakang

Dan tombol berikut digunakan untuk mengubah posisi camera:

1: kamera 1 (depan)
2: kamera 2 (kanan)
3: kamera 3 (kiri)
4: kamera 4 (belakang)
5: kamera 5 (atas)
6: kamera 6 (bawah)

Saat tombol pergerakan ditekan, kamera akan bergerak sesuai dengan arah yang ditekan.
Nilai awal (tengah) adalah 8, dan kamera dapat bergerak ke kiri atau kanan hingga nilai
5 atau 10, dan bergerak ke atas atau bawah hingga nilai 10 atau 5

----------------------------------
Kontribusi
----------------------------------
Mohamad Harits Nur Fauzan - 50%
Rizqy Faishal Tanjung - 50%
