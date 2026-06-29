import { Controller, Get, Query } from '@nestjs/common';

import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('dossier')
  getDossier(@Query('locale') locale?: string) {
    return this.portfolioService.getPublicDossier(locale);
  }

  @Get()
  getPortfolio(@Query('locale') locale?: string) {
    return this.portfolioService.getPublicPortfolio(locale);
  }
}
