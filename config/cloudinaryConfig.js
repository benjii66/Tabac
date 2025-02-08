import { Cloudinary } from '@cloudinary/url-gen';

// Configuration de Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: 'dchckbio5'
  }
});

export default cld;
