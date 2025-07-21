import { Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [PlayerModule, ServerModule],
})
export class AppModule {}
