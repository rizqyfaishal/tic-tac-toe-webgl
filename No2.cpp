#include <OpenGL/gl.h>
#include <GLUT/glut.h>

/*
 * Inisiasi variabel.
 * Eye, center, dan up adalah variabel untuk parameter gluLookAt.
 * Depth adalah nilai batas saat bergerak kedepan, initDepth adalah nilai batas saat mundur, dan limit adalah
 * batas pergerakan ke atas, kanan, kiri, bawah.
 * Status adalah variabel yang menunjukkan kamera mana yang sedang aktif
 */
GLfloat eyex = 8.0, eyey = 0.0, eyez = 8.0, centerx = 0.0, centery = 0.0, centerz = 0.0, upx = 0.0, upy = 1.0, upz = 0.0;
float depth = 4, initDepth = 8, limit = 5;
int status = 1;

/*
 * Fungsi untuk menggambar model pada layar
 */
void display () {
    
    /* Clear window */
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    /* Mengubah mode matrix menjadi modelview matrix */
    glMatrixMode(GL_MODELVIEW);
    
    /* Pembuatan model */
    glPushMatrix();
    
    // Rumah
    glPushMatrix();
    glutSolidCube(2);                 // Bangunan
    
    glTranslatef(0,1,0);
    glPushMatrix();                   // Atap
    glRotatef(-90,1,0,0);
    glutSolidCone(1.5,1,16,8);
    glPopMatrix();
    
    glTranslatef(.75,.5,-.75);
    glPushMatrix();                   // Lubang asap
    glScalef(1,3,1);
    glutSolidCube(.25);
    glPopMatrix();
    glPopMatrix();
    
    glTranslatef(0,-.65,2);
    
    // Mobil
    glPushMatrix();
    glPushMatrix();                   // Body
    glScalef(2,.5,1);
    glutSolidCube(.5);
    glPopMatrix();
    glTranslatef(0,0,.25);
    glPushMatrix();
    glTranslatef(-.4,-.2,0);
    glutSolidTorus(.05,.1,8,8);       // Roda
    glTranslatef(.8,0,0);
    glutSolidTorus(.05,.1,8,8);       // Roda
    glPopMatrix();
    glTranslatef(0,0,-.5);
    glPushMatrix();
    glTranslatef(-.4,-.2,0);
    glutSolidTorus(.05,.1,8,8);       // Roda
    glTranslatef(.8,0,0);
    glutSolidTorus(.05,.1,8,8);       // Roda
    glPopMatrix();
    glPopMatrix();
    
    glPopMatrix();

    glFlush();
}

/*
 * Fungsi untuk mendefinisikan viewport transformation
 */
void reshape ( int width, int height ) {
    
    glViewport(0,0,width,height);
}

/*
 * Fungsi untuk menginisiasi camera menggunakan gluLookAt
 */
void camera(void) {
    
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(eyex,eyey,eyez,centerx,centery,centerz,upz,upy,upz);
}

/*
 * Callback function yang digunakan untuk handling keypress events.
 * Tombol yang digunakan adalah 1, 2, 3, 4, 5, 6 untuk camera
 * depan kanan kiri belakang atas dan bawah, serta tombol
 * w, s, a, d, i, k, untuk bergerak ke atas, bawah, kiri, kanan,
 * depan, dan belakang.
 */
void KeyPressed (unsigned char Key, int x, int y) {
    
    // Mengatur koordinat eye dan center untuk camera depan
    if (Key == '1') {
        eyex = 8.0;
        eyey = 0.0;
        eyez = 8.0;
        centerx = 0.0;
        centery = 0.0;
        centerz = 0.0;
        upx = 0.0;
        upy = 1.0;
        upz = 0.0;
        status = 1;
    }
    // Mengatur koordinat eye dan center untuk camera kanan
    else if (Key == '2') {
        eyex = 8.0;
        eyey = 0.0;
        eyez = -8.0;
        centerx = 0.0;
        centery = 0.0;
        centerz = 0.0;
        upx = 0.0;
        upy = 1.0;
        upz = 0.0;
        status = 2;
    }
    // Mengatur koordinat eye dan center untuk camera kiri
    else if (Key == '3') {
        eyex = -8.0;
        eyey = 0.0;
        eyez = 8.0;
        centerx = 0.0;
        centery = 0.0;
        centerz = 0.0;
        upx = 0.0;
        upy = 1.0;
        upz = 0.0;
        status = 3;
    }
    // Mengatur koordinat eye dan center untuk camera belakang
    else if (Key == '4') {
        eyex = -8.0;
        eyey = 0.0;
        eyez = -8.0;
        centerx = 0.0;
        centery = 0.0;
        centerz = 0.0;
        upx = 0.0;
        upy = 1.0;
        upz = 0.0;
        status = 4;
    }
    // Mengatur koordinat eye dan center untuk camera atas
    else if (Key == '5') {
        eyex = 0.005;
        eyey = 8.0;
        eyez = 0.0;
        centerx = 0.0;
        centery = 0.0;
        centerz = 0.0;
        upx = 0.0;
        upy = 1.0;
        upz = 0.0;
        status = 5;
    }
    // Mengatur koordinat eye dan center untuk camera bawah
    else if (Key == '6') {
        eyex = 0.005;
        eyey = -8.0;
        eyez = 0.0;
        centerx = 0.0;
        centery = 0.0;
        centerz = 0.0;
        upx = 0.0;
        upy = 1.0;
        upz = 0.0;
        status = 6;
    }
    
    
    // Tombol W digunakan untuk bergerak ke atas
    else if (Key == 'w') {
        if (status == 1 || status == 2 || status == 3 || status == 4) {
            if (eyey < limit) {
                eyey = eyey + 0.1;
                centery = centery + 0.1;
            }
        } else if (status == 5) {
            if (eyex > -limit) {
                eyex = eyex - 0.1;
                centerx = centerx - 0.1;
            }
        } else if (status == 6) {
            if (eyex < limit) {
                eyex = eyex + 0.1;
                centerx = centerx + 0.1;
            }
        }
    }
    // Tombol W digunakan untuk bergerak ke bawah
    else if (Key == 's') {
        if (status == 1 || status == 2 || status == 3 || status == 4) {
            if (eyey > -limit) {
                eyey = eyey - 0.1;
                centery = centery - 0.1;
            }
        } else if (status == 5) {
            if (eyex < limit) {
                eyex = eyex + 0.1;
                centerx = centerx + 0.1;
            }
        } else if (status == 6) {
            if (eyex > -limit) {
                eyex = eyex - 0.1;
                centerx = centerx - 0.1;
            }
        }
    }
    
    /*
     * Tombol W digunakan untuk bergerak ke kiri, koordinat yang berubah
     * menyesuaikan dengan lokasi kamera.
     */
    else if (Key == 'a') {
        if (status == 1) {
            if (eyex > limit) {
                eyex = eyex - 0.1;
                centerx = centerx - 0.1;
                eyez = eyez + 0.1;
                centerz = centerz + 0.1;
            }
        } else if (status == 2) {
            if (eyex < (limit*2)+1) {
                eyex = eyex + 0.1;
                centerx = centerx + 0.1;
                eyez = eyez + 0.1;
                centerz = centerz + 0.1;
            }
        } else if (status == 3) {
            if (eyez > limit) {
                eyex = eyex - 0.1;
                centerx = centerx - 0.1;
                eyez = eyez - 0.1;
                centerz = centerz - 0.1;
            }
        } else if (status == 4) {
            if (eyex < -limit) {
                eyex = eyex + 0.1;
                centerx = centerx + 0.1;
                eyez = eyez - 0.1;
                centerz = centerz - 0.1;
            }
        } else if (status == 5 || status == 6) {
            if (eyez < limit) {
                eyez = eyez + 0.1;
                centerz = centerz + 0.1;
            }
        }
    }
    /*
     * Tombol D digunakan untuk bergerak ke kanan, koordinat yang berubah
     * menyesuaikan dengan lokasi kamera.
     */
    else if (Key == 'd') {
        if (status == 1) {
            if (eyez > limit) {
                eyex = eyex + 0.1;
                centerx = centerx + 0.1;
                eyez = eyez - 0.1;
                centerz = centerz - 0.1;
            }
        } else if (status == 2) {
            if (eyex > limit) {
                eyex = eyex - 0.1;
                centerx = centerx - 0.1;
                eyez = eyez - 0.1;
                centerz = centerz - 0.1;
            }
        } else if (status == 3) {
            if (eyez < (limit*2)+1) {
                eyex = eyex + 0.1;
                centerx = centerx + 0.1;
                eyez = eyez + 0.1;
                centerz = centerz + 0.1;
            }
        } else if (status == 4) {
            if (eyez < -limit) {
                eyex = eyex - 0.1;
                centerx = centerx - 0.1;
                eyez = eyez + 0.1;
                centerz = centerz + 0.1;
            }
        } else if (status == 5 || status == 6) {
            if (eyez > -limit) {
                eyez = eyez - 0.1;
                centerz = centerz - 0.1;
            }
        }
    }
    /*
     * Tombol I digunakan untuk bergerak ke depan, koordinat yang berubah
     * menyesuaikan dengan lokasi kamera.
     */
    else if (Key == 'i') {
        if (status == 1) {
            if (eyez > depth) {
                eyez = eyez - 0.1;
            }
        } else if (status == 4) {
            if (eyez < -depth) {
                eyez = eyez + 0.1;
            }
        } else if (status == 2) {
            if (eyex > depth) {
                eyex = eyex - 0.1;
            }
        } else if (status == 3) {
            if (eyex < -depth) {
                eyex = eyex + 0.1;
            }
        } else if (status == 5) {
            if (eyey > depth) {
                eyey = eyey - 0.1;
            }
        } else if (status == 6) {
            if (eyey < -depth) {
                eyey = eyey + 0.1;
            }
        }
    }
    /*
     * Tombol K digunakan untuk bergerak ke belakang, koordinat yang berubah
     * menyesuaikan dengan lokasi kamera.
     */
    else if (Key == 'k') {
        if (status == 1) {
            if (eyez < initDepth) {
                eyez = eyez + 0.1;
            }
        } else if (status == 4) {
            if (eyez > -initDepth) {
                eyez = eyez - 0.1;
            }
        } else if (status == 2) {
            if (eyex < initDepth) {
                eyex = eyex + 0.1;
            }
        } else if (status == 3) {
            if (eyex > -initDepth) {
                eyex = eyex - 0.1;
            }
        } else if (status == 5) {
            if (eyey < initDepth) {
                eyey = eyey + 0.1;
            }
        } else if (status == 6) {
            if (eyey > -initDepth) {
                eyey = eyey - 0.1;
            }
        }
    }
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    camera();
    glutPostRedisplay();
}

int main ( int argc, char * argv[] ) {
    
    /* Inisiasi glut */
    glutInit(&argc,argv);
    
    /* Setup size, window, dan display mode */
    glutInitWindowSize(500,500);
    glutInitWindowPosition(0,0);
    glutInitDisplayMode(GLUT_RGB | GLUT_DEPTH);
    
    /* Membuat window baru */
    glutCreateWindow("Soal 2");
    glutDisplayFunc(display);
    glutReshapeFunc(reshape);
    
    /* Set up depth-buffering */
    glEnable(GL_DEPTH_TEST);
    
    /* Menyalakan default lighting */
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    
    /* Matrix projection untuk inisiasi view */
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(40,1,5,20);
    
    /* Menginisiasi kamera */
    camera();
    
    /* Fungsi yang menerima events dari keyboard */
    glutKeyboardFunc(KeyPressed);
    
    glutMainLoop();
}
