import { StoryEntity } from '@/entities/story.entity';
import { setSeederFactory } from 'typeorm-extension';
import { StoryType } from '@/utils/constant';
import { faker } from '@faker-js/faker';

export default setSeederFactory(StoryEntity, async (): Promise<StoryEntity> => {
  const story = new StoryEntity();
  
  story.type = faker.helpers.arrayElement(Object.values(StoryType));
  
  if (story.type === StoryType.TEXT) {
    story.content = faker.lorem.sentence();
    story.background_color = faker.color.rgb();
    story.url = null; 
  } else if (story.type === StoryType.IMAGE) {
    story.url = faker.image.urlPicsumPhotos({ 
      height: 500, 
      width: 500, 
      grayscale: false, 
      blur: 0,
    });
    story.background_color = null;
  } else if (story.type === StoryType.VIDEO) {
    story.url = faker.internet.url();
    story.background_color = null;
  }
  
  return story;
});
