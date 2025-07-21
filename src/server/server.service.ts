import { Injectable } from '@nestjs/common';
import { status } from 'minecraft-server-util';

@Injectable()
export class ServerService {
  async getServerInfo(host: string, port: number = 25565): Promise<any> {
    try {
      const result = await status(host, port, {
        enableSRV: true,
        timeout: 5000,
      });

      return {
        host,
        port,
        online: true,
        version: result.version.name,
        players: {
          online: result.players.online,
          max: result.players.max,
          sample: result.players.sample || [],
        },
        motd: result.motd.clean,
        favicon: result.favicon, // base64 PNG
      };
    } catch (error) {
      return {
        host,
        port,
        online: false,
        error: error,
      };
    }
  }
}
