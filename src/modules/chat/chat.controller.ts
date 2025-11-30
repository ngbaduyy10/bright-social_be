import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';

@Controller('chat')
export class ChatController {}

