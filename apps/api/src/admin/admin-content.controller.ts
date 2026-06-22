import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from './admin.guard';
import { AdminContentService } from './admin-content.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get('content')
  getDashboardData() {
    return this.adminContentService.getDashboardData();
  }

  @Put('profile')
  updateProfile(@Body() body: Record<string, unknown>) {
    return this.adminContentService.updateProfile(body);
  }

  @Post('contact-links')
  createContactLink(@Body() body: Record<string, unknown>) {
    return this.adminContentService.createContactLink(body);
  }

  @Put('contact-links/:id')
  updateContactLink(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminContentService.updateContactLink(id, body);
  }

  @Delete('contact-links/:id')
  deleteContactLink(@Param('id') id: string) {
    return this.adminContentService.deleteContactLink(id);
  }

  @Post('technologies')
  createTechnology(@Body() body: Record<string, unknown>) {
    return this.adminContentService.createTechnology(body);
  }

  @Put('technologies/:id')
  updateTechnology(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminContentService.updateTechnology(id, body);
  }

  @Delete('technologies/:id')
  deleteTechnology(@Param('id') id: string) {
    return this.adminContentService.deleteTechnology(id);
  }

  @Post('projects')
  createProject(@Body() body: Record<string, unknown>) {
    return this.adminContentService.createProject(body);
  }

  @Put('projects/:id')
  updateProject(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminContentService.updateProject(id, body);
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.adminContentService.deleteProject(id);
  }

  @Post('roadmap')
  createRoadmapItem(@Body() body: Record<string, unknown>) {
    return this.adminContentService.createRoadmapItem(body);
  }

  @Put('roadmap/:id')
  updateRoadmapItem(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminContentService.updateRoadmapItem(id, body);
  }

  @Delete('roadmap/:id')
  deleteRoadmapItem(@Param('id') id: string) {
    return this.adminContentService.deleteRoadmapItem(id);
  }

  @Post('site-copy')
  upsertSiteCopy(@Body() body: Record<string, unknown>) {
    return this.adminContentService.upsertSiteCopy(body);
  }

  @Put('site-copy/:id')
  updateSiteCopy(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminContentService.updateSiteCopy(id, body);
  }

  @Delete('site-copy/:id')
  deleteSiteCopy(@Param('id') id: string) {
    return this.adminContentService.deleteSiteCopy(id);
  }
}
