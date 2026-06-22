import { Controller, Get, Query } from '@nestjs/common';

import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  getPortfolio(@Query('locale') locale?: string) {
    return this.portfolioService.getPublicPortfolio(locale);
  }
}
