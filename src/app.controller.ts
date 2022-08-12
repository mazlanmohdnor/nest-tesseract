import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('upscale')
  getHello() {
    return this.appService.upscale();
  }

  @Get('sharp')
  sharpenImg() {
    return this.appService.sharpenImg();
  }

  @Get('/')
  process() {
    return this.appService.process();
  }
}
