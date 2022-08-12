import { Controller, Get, Param } from '@nestjs/common';
import { AppService, ImgSharpenType } from './app.service';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('upscale/:folder')
  getHello(@Param('folder') folder) {
    return this.appService.upscale(folder);
  }

  @Get('sharp/whiteFontBlackBG')
  sharpenImgWhiteFontBlackBG() {
    return this.appService.sharpenImg('whiteFontBlackBG');
  }

  @Get('sharp/blackFontWhiteBG')
  sharpenImgBlackFontWhiteBG() {
    return this.appService.sharpenImg('blackFontWhiteBG');
  }

  @Get('/:folderName/:type')
  process(
    @Param('folderName') folderName,
    @Param('type') type: ImgSharpenType = 'blackFontWhiteBG',
  ) {
    const IMG_BASE = path.join(
      process.cwd(),
      'src',
      'assets',
      'img',
      'raw',
      folderName,
    );

    return this.appService.process(IMG_BASE, folderName, type);
  }

  @Get('clean')
  cleanDir() {
    return this.appService.cleanAllDir();
  }
}
