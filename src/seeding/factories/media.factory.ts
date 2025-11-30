import { MediaEntity } from '@/entities/media.entity';
import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { MediaType } from '@/utils/constant';

export default setSeederFactory(MediaEntity, async (): Promise<MediaEntity> => {
  const media = new MediaEntity();
  
  const mediaType = MediaType.IMAGE;
  
  if (mediaType === MediaType.IMAGE) {
    media.url = faker.image.urlPicsumPhotos({ 
      height: 500, 
      width: 700, 
      grayscale: false, 
      blur: 0,
    });
  } else {
    media.url = faker.helpers.arrayElement([
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4'
    ]);
  }
  media.width = 700;
  media.height = 500;
  media.type = mediaType;
  media.order = 0;
  
  return media;
});
