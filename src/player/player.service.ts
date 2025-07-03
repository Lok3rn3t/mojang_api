import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';

@Injectable()
export class PlayerService {
  async getSkinUrl(nickname: string): Promise<string> {
    const profile = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${nickname}`);
    const uuid = profile.data.id;

    const session = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
    const properties = session.data.properties.find((p) => p.name === 'textures');

    const decoded = JSON.parse(Buffer.from(properties.value, 'base64').toString());
    return decoded.textures.SKIN.url;
  }

  async getPlayerHeadBase64(nickname: string, size: number): Promise<string> {
    const skinUrl = await this.getSkinUrl(nickname);
    const img = await loadImage(skinUrl);

    const scale = Math.floor(size / 8);
    const finalSize = scale * 8;

    const canvas = createCanvas(finalSize, finalSize);
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, 8, 8);

    ctx.imageSmoothingEnabled = false;

    let hasVisibleHat = false;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // alpha channel
        hasVisibleHat = true;
        break;
      }
    }

    // Draw the base head
    ctx.drawImage(
      img,
      8, 8, 8, 8,         // (srcX, srcY, srcW, srcH)
      0, 0, finalSize, finalSize // (destX, destY, destW, destH)
    );
    if(hasVisibleHat) {
      // Draw the hat layer / overlay
      ctx.drawImage(
        img,
        40, 8, 8, 8,         // the coordinates of the hat on the skin
        0, 0, finalSize, finalSize
      );
    }
    return canvas.toDataURL();
  }

}
