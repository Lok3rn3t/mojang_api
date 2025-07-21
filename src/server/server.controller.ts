import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServerService } from './server.service';

@ApiTags('Minecraft Server')
@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get(':host')
  @ApiOperation({ summary: 'Get Minecraft server info by IP or domain' })
  @ApiParam({
    name: 'host',
    description: 'IP address or domain of the Minecraft server',
    example: 'play.hypixel.net',
  })
  @ApiQuery({
    name: 'port',
    required: false,
    type: Number,
    description: 'Port of the Minecraft server (default is 25565)',
    example: 25565,
  })
  @ApiOkResponse({
    description: 'Information about the Minecraft server',
    schema: {
      example: {
        host: 'mc.example.com',
        port: 25565,
        online: true,
        version: 'Paper 1.21.8',
        players: {
          online: 1000,
          max: 20000,
          sample: [{ id: 'uuid', name: 'Steve' }],
        },
        motd: "Welcome to Example Server!",
        favicon: "data:image/png;base64,...",
      },
    },
  })
  async getServerInfo(
    @Param('host') host: string,
    @Query('port') port?: number,
  ) {
    return this.serverService.getServerInfo(host, Number(port ?? 25565));
  }
}
