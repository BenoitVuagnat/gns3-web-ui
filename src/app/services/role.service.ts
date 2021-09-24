import { Injectable } from '@angular/core';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';
import { Role } from '../models/roles/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

constructor(
  private httpServer: HttpServer
) { }

  getRoles(server: Server){
    return this.httpServer.get(server, '/roles');
  }

  addPermission(server : Server, role_id: string, permission_id : string)
  {
    return this.httpServer.put(server, `/roles/${role_id}/permissions/${permission_id}`, {});
  }


}
