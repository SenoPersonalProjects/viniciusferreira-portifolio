import { Module } from '@nestjs/common';
import { AdminContentController } from './admin/admin-content.controller';
import { AdminContentService } from './admin/admin-content.service';
import { AdminGuard } from './admin/admin.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortfolioController } from './portfolio/portfolio.controller';
import { PortfolioService } from './portfolio/portfolio.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [AppController, PortfolioController, AdminContentController],
  providers: [
    AppService,
    PrismaService,
    PortfolioService,
    AdminContentService,
    AdminGuard,
  ],
})
export class AppModule {}
