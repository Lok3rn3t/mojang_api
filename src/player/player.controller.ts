import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlayerService } from './player.service';

@ApiTags('Minecraft skins')
@Controller('skin')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':nickname/head')
  @ApiOperation({ summary: "Get a player's head by nickname" })
  @ApiParam({ name: 'nickname', description: 'Minecraft player nickname', example: 'Notch' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Head image size (default is 50)', example: 50 })
  @ApiOkResponse({
    description: 'Base64 PNG image of the player\'s head',
    schema: {
      example: {
        nickname: 'Notch',
        size: 50,
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      },
    },
  })
  async getHead(@Param('nickname') nickname: string, @Query('size') size: number) {
    const base64 = await this.playerService.getPlayerHeadBase64(nickname, Number(size));
    return { nickname, size, image: base64 };
  }

  @Get(':nickname/fullskin')
  @ApiOperation({ summary: 'Get full Minecraft skin (base64 PNG)' })
  @ApiParam({ name: 'nickname', description: 'Minecraft nickname' })
  @ApiOkResponse({
    description: 'Full skin image in base64',
    schema: {
      example: {
        nickname: 'Notch',
        image: 'data:image/png;base64,...',
      },
    },
  })
  async getFullSkin(@Param('nickname') nickname: string) {
    const image = await this.playerService.getFullSkinBase64(nickname);
    return { nickname, image };
  }
}