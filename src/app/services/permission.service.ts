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

  createPermission(server: Server, methods: string[], path: string, action: string, description: string){
    return this.httpServer.post(server, '/permissions', { methods: methods, path: path, action: action, description: description});
  }

  deletePermission(server: Server, permission_id: string){
    return this.httpServer.delete(server, `/permissions/${permission_id}`);
  }

}
