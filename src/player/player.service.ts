import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';

@Injectable()
export class PlayerService {
  async getSkinUrl(nickname: string): Promise<string> {
    try {
      const profile = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${nickname}`);
      const uuid = profile.data.id;

      const session = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
      const properties = session.data.properties.find((p) => p.name === 'textures');

      const decoded = JSON.parse(Buffer.from(properties.value, 'base64').toString());
      return decoded.textures.SKIN.url;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException(`Minecraft user '${nickname}' not found`);
      }
      throw new InternalServerErrorException('Failed to fetch skin URL');
    }
  }

  async getPlayerHeadBase64(nickname: string, size: number): Promise<string> {
    try {
      const skinUrl = await this.getSkinUrl(nickname);
      const img = await loadImage(skinUrl);

      const scale = Math.floor(size / 8);
      const finalSize = scale * 8;

      const canvas = createCanvas(finalSize, finalSize);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Draw the head
      ctx.drawImage(img, 8, 8, 8, 8, 0, 0, finalSize, finalSize);

      const hatCanvas = createCanvas(8, 8);
      const hatCtx = hatCanvas.getContext('2d');
      hatCtx.drawImage(img, 40, 8, 8, 8, 0, 0, 8, 8);

      const imageData = hatCtx.getImageData(0, 0, 8, 8);
      const data = imageData.data;

      // Check if the hat pixels are all transparent (old skin)
      let oldSkin = true;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (!(r === 0 && g === 0 && b === 0 && a === 255)) {
          oldSkin = false;
          break;
        }
      }

      if (!oldSkin) {
        ctx.drawImage(img, 40, 8, 8, 8, 0, 0, finalSize, finalSize);
      }

      return canvas.toDataURL();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to render head:', error.message);
      throw new InternalServerErrorException('Failed to render player head image');
    }
  }
}
