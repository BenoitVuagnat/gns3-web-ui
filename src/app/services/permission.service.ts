import { Injectable } from '@angular/core';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';
import { Permission } from '../models/permissions/permission';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

constructor(
  private httpServer: HttpServer
  ) {}

  getPermissions(server: Server){
    return this.httpServer.get(server, '/permissions');
  }

}
