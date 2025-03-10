import { Injectable } from '@angular/core';

// Camera : le module, la classe qui va nous fournir les méthode pour intéragir / manpuler
// manipuler la camera de l'appareil
// CameraResultType : un enum qui nous fournit des formats
// types de retour possible de la photo
// CameraSource : un enum qui nous fournit les différents sources possibles pour la photo
// Photo : une interface qui va définir la strucute de l'objet contenant la photo
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';

export interface IUserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: IUserPhoto[] = [];

  constructor() {}

  // Utilisation de camera de capacitor
  async addPhotoToGallery() {
    const picture = await Camera.getPhoto({
      //  URI = Uniform Ressource Identifier
      // une URI est un string qui va permettre d'identifier une ressource
      // dans notre contexte l'uri(CameraResultType.Uri) signifie que
      //Camera va return une r&férence à la photo prise sous la forme d'une URI
      //a la place de données brutes
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const savedFile = await this.savePhoto(picture);

    this.photos.unshift(savedFile);
  }

  // Permet de sauvegarder la photo sur le stockage local de l'application
  async savePhoto(photo: Photo) {
    // Conversion de la photo en base64
    const base64 = await this.fetchBlob(photo);

    const fileName = Date.now() + '.jpeg';
    const file = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  }

  // Récupération de blob et conversion en base64
  async fetchBlob(photo: Photo) {
    const result = await fetch(photo.webPath!);

    // Un blob est un "Binary large object"
    // Un blob représente des données binaires
    // on va généralement utiliser des blob pour faciliter le traitement
    // de données multimedia type images, audio, ...
    // Principalement utilisé lors des requêtes HTTP pour alléger les requêtes
    // mais pas que

    const blob = await result.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }

  // Création d'une méthode utilitaire (qui pourrait avoir son propre fichier
  // dans un dossier "utils" par exemple)
  //Le base64 est un encodage qui permet de convertir des données binaires en string
  // en ASCII

  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      //On récupère le blob et on le transforme / convertit en base64
      // "data:image/jpeg;base64,/5j/FEZKBVHBSDzef..."

      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
